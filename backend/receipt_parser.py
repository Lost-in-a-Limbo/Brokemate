import re
import os
import tempfile
from datetime import date
from typing import List, Dict, Optional
from PIL import Image
import pytesseract
from transformers import pipeline

class ReceiptParser:
    def __init__(self):
        # Initialize the AI classifier for categorizing items (lightweight mode)
        self.classifier = None
        try:
            # Only load AI model if explicitly requested (to avoid heavy startup)
            import os
            if os.environ.get('ENABLE_AI_CLASSIFICATION', 'false').lower() == 'true':
                self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
                print("AI classifier loaded successfully")
            else:
                print("Using lightweight mode - AI classifier disabled (set ENABLE_AI_CLASSIFICATION=true to enable)")
        except Exception as e:
            print(f"Warning: AI classifier not available: {e}")
            self.classifier = None
        
        # Map receipt categories to our expense categories
        self.category_mapping = {
            "Groceries": "Food",
            "Food": "Food", 
            "Beverages": "Food",
            "Drinks": "Food",
            "Electronics": "Shopping",
            "Technology": "Shopping",
            "Pharmacy": "Health",
            "Medicine": "Health",
            "Healthcare": "Health",
            "Clothing": "Shopping",
            "Fashion": "Shopping",
            "Transport": "Transport",
            "Transportation": "Transport",
            "Fuel": "Transport",
            "Gas": "Transport",
            "Entertainment": "Entertainment",
            "Movies": "Entertainment",
            "Games": "Entertainment",
            "Utilities": "Utilities",
            "Bills": "Utilities",
            "Other": "Other"
        }
        
        # Candidate labels for classification
        self.candidate_labels = [
            "Groceries", "Food", "Beverages", "Electronics", "Technology", 
            "Pharmacy", "Medicine", "Healthcare", "Clothing", "Fashion",
            "Transport", "Transportation", "Fuel", "Entertainment", 
            "Movies", "Games", "Utilities", "Bills", "Other"
        ]

    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from receipt image using OCR."""
        try:
            image = Image.open(image_path)
            # Preprocess image for better OCR results
            image = image.convert('L')  # Convert to grayscale
            
            # Try multiple OCR configurations for better results
            configs = [
                '--psm 6',  # Assume a single uniform block of text
                '--psm 4',  # Assume a single column of text
                '--psm 3',  # Fully automatic page segmentation
            ]
            
            raw_text = ""
            for config in configs:
                try:
                    text = pytesseract.image_to_string(image, config=config)
                    if text and len(text.strip()) > len(raw_text):
                        raw_text = text
                except:
                    continue
            
            print(f"Extracted text:\n{raw_text}")  # Debug logging
            return raw_text
        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")

    def parse_items_from_text(self, text: str) -> List[Dict]:
        """Parse items and prices from OCR text."""
        lines = text.split("\n")
        items = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Try different patterns to match items with prices
            patterns = [
                r"^(.*?)[\s:]+(\d+[.,]\d{2})$",  # Item name followed by price
                r"^(.*?)[\s:]+\$?\s*(\d+[.,]\d{2})$",  # Item name followed by $price
                r"^(.*?)[\s:]+₹?\s*(\d+[.,]\d{2})$",  # Item name followed by ₹price
                r"^(.*?)[\s:]+Rs\.?\s*(\d+[.,]\d{2})$",  # Item name followed by Rs price
                r"^(.*?)[\s]+(\d{1,6}\.\d{2})$",  # Simple decimal price
                r"^(.*?)[\s]+(\d{1,6},\d{2})$",   # Comma decimal price
                r"^(.*?)\s+(\d+)\.(\d{2})$",  # Separated decimal
                r"^(.*?)\s+(\d+),(\d{2})$",   # Separated comma
            ]
            
            for pattern in patterns:
                match = re.match(pattern, line)
                if match:
                    name = match.group(1).strip()
                    
                    # Handle both 2-group and 3-group matches
                    if len(match.groups()) == 3:
                        price_str = f"{match.group(2)}.{match.group(3)}"
                    else:
                        price_str = match.group(2).strip()
                    
                    # Clean up the price string
                    price_str = re.sub(r'[^\d.,]', '', price_str)  # Remove currency symbols
                    price_str = price_str.replace(",", ".")  # Normalize decimal separator
                    
                    try:
                        price = float(price_str)
                        # More lenient validation
                        if price > 0 and price < 1000000 and len(name) > 1:
                            # Skip common non-item words
                            skip_words = ['total', 'subtotal', 'tax', 'amount', 'paid', 'change', 'balance', 'receipt', 'thank you']
                            if not any(skip_word in name.lower() for skip_word in skip_words):
                                items.append({"item": name, "price": price})
                                print(f"Found item: {name} - ₹{price}")  # Debug logging
                                break
                    except ValueError:
                        continue
        
        # If still no items found, try to extract any numbers as amounts
        if not items:
            print("No structured items found, trying to extract any amounts...")
            amount_pattern = r'(\d+[.,]\d{2})'
            amounts = re.findall(amount_pattern, text)
            if amounts:
                for idx, amount_str in enumerate(amounts[:5]):  # Limit to 5 items
                    amount_str = amount_str.replace(",", ".")
                    try:
                        amount = float(amount_str)
                        if 0 < amount < 100000:
                            items.append({
                                "item": f"Item {idx + 1}",
                                "price": amount
                            })
                            print(f"Extracted amount: ₹{amount}")
                    except ValueError:
                        continue
        
        return items

    def classify_item(self, item_name: str) -> str:
        """Classify an item into a category using AI or rules."""
        if self.classifier:
            try:
                result = self.classifier(item_name, self.candidate_labels)
                if result and isinstance(result, dict) and 'labels' in result:
                    ai_category = result['labels'][0]
                    return self.category_mapping.get(str(ai_category), "Other")
            except Exception as e:
                print(f"AI classification failed for '{item_name}': {e}")
        
        # Fallback to rule-based classification
        return self.rule_based_classification(item_name)

    def rule_based_classification(self, item_name: str) -> str:
        """Fallback rule-based classification."""
        item_lower = item_name.lower()
        
        # Food keywords
        food_keywords = ["bread", "milk", "cheese", "fruit", "vegetable", "rice", "pasta", "meat", "chicken", "beef", "pork", "fish", "coffee", "tea", "juice", "water", "soda", "beer", "wine"]
        if any(keyword in item_lower for keyword in food_keywords):
            return "Food"
        
        # Electronics keywords
        electronics_keywords = ["phone", "laptop", "computer", "tablet", "headphones", "charger", "cable", "battery"]
        if any(keyword in item_lower for keyword in electronics_keywords):
            return "Shopping"
        
        # Health keywords
        health_keywords = ["medicine", "tablet", "capsule", "syrup", "cream", "bandage", "vitamin"]
        if any(keyword in item_lower for keyword in health_keywords):
            return "Health"
        
        # Transport keywords
        transport_keywords = ["fuel", "gas", "petrol", "diesel", "ticket", "bus", "train", "taxi", "uber"]
        if any(keyword in item_lower for keyword in transport_keywords):
            return "Transport"
        
        return "Other"

    def process_receipt(self, image_path: str, description: str = "Receipt items") -> List[Dict]:
        """Process a receipt image and return categorized expenses."""
        try:
            # Extract text from image
            text = self.extract_text_from_image(image_path)
            
            if not text or len(text.strip()) < 5:
                raise Exception("Could not extract readable text from the image. Please ensure the image is clear and well-lit.")
            
            # Parse items from text
            items = self.parse_items_from_text(text)
            
            if not items:
                # More helpful error message
                raise Exception("No items could be extracted from the receipt. Please ensure the receipt shows clear item names and prices.")
            
            # Classify each item
            expenses = []
            today = date.today().isoformat()
            
            for item in items:
                category = self.classify_item(item["item"])
                
                expense = {
                    "amount": item["price"],
                    "category": category,
                    "description": f"{description} - {item['item']}",
                    "date": today
                }
                expenses.append(expense)
            
            print(f"Successfully processed {len(expenses)} items from receipt")
            return expenses
            
        except Exception as e:
            print(f"Receipt processing error: {str(e)}")
            raise Exception(f"Error processing receipt: {str(e)}")

    def save_temp_image(self, image_data: bytes) -> str:
        """Save uploaded image data to a temporary file."""
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_data)
            return temp_file.name

    def cleanup_temp_file(self, file_path: str):
        """Clean up temporary file."""
        try:
            os.unlink(file_path)
        except Exception:
            pass