#!/usr/bin/env python3
"""
Test script for Replicate API with IBM Granite 3.3 8B Instruct
"""
import os
import replicate

# Set API token
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")
if not REPLICATE_API_TOKEN:
    print("Warning: REPLICATE_API_TOKEN environment variable not set")
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

def test_granite_model():
    """Test the IBM Granite 3.3 8B Instruct model"""
    print("🧪 Testing IBM Granite 3.3 8B Instruct via Replicate...")
    print("-" * 60)
    
    try:
        # Test prompt
        prompt = """You are a helpful financial advisor assistant. 
        Analyze this spending: Total expenses: ₹5,500 across 10 transactions.
        Top category: Food (₹2,500). Provide 3 quick tips to save money."""
        
        print(f"📝 Prompt: {prompt[:100]}...\n")
        print("⏳ Calling Replicate API...")
        
        # Call the IBM Granite 3.3 8B Instruct model
        model = "ibm-granite/granite-3.3-8b-instruct"
        
        print(f"  Using model: {model}")
        output = replicate.run(
            model,
            input={
                "prompt": prompt,
                "max_tokens": 500,
                "temperature": 0.7,
                "top_p": 0.9,
            }
        )
        print(f"  ✓ Model {model} responded successfully!")
        
        # Collect response
        response = "".join(output)
        
        print("\n✅ Response received:")
        print("-" * 60)
        print(response)
        print("-" * 60)
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease check:")
        print("1. Your API token is valid")
        print("2. You have internet connection")
        print("3. The model name is correct")

if __name__ == "__main__":
    test_granite_model()
