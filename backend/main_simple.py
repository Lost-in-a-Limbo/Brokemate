import uvicorn
import json
import hashlib
from datetime import date, timedelta, datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, status, Form, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Import receipt parser
try:
    from receipt_parser import ReceiptParser
    receipt_parser = ReceiptParser()
    RECEIPT_PARSING_ENABLED = True
except ImportError as e:
    print(f"Receipt parsing disabled: {e}")
    receipt_parser = None
    RECEIPT_PARSING_ENABLED = False

# --- APPLICATION SETUP ---
app = FastAPI(
    title="Brokemate API",
    description="Backend for the Brokemate personal expense management application.",
    version="1.0.0"
)

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SIMPLE IN-MEMORY DATABASE ---
fake_users_db = {}
user_expenses = {}

# Add a test user for easy testing
test_user = "user@example.com"
fake_users_db[test_user] = {
    "username": test_user,
    "password": hashlib.sha256("password123".encode()).hexdigest()
}
user_expenses[test_user] = [
    {"id": 1, "amount": 250.00, "category": "Food", "description": "Lunch with colleagues", "date": "2025-09-27", "flag": None},
    {"id": 2, "amount": 1200.50, "category": "Shopping", "description": "New headphones", "date": "2025-09-26", "flag": "red"},
    {"id": 3, "amount": 150.00, "category": "Transport", "description": "Metro card recharge", "date": "2025-09-25", "flag": "green"},
]

# --- SIMPLE AUTH HELPERS ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_simple_token(username: str) -> str:
    # Simple token - just base64 encoded username for demo
    import base64
    return base64.b64encode(username.encode()).decode()

def decode_simple_token(token: str) -> str:
    # Decode simple token
    import base64
    try:
        return base64.b64decode(token.encode()).decode()
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- AI RESPONSE HELPERS ---
def generate_simple_analysis(expenses: List[Dict]) -> str:
    if not expenses:
        return "📊 You haven't added any expenses yet! Start tracking your spending to get personalized insights."
    
    total = sum(exp['amount'] for exp in expenses)
    categories = {}
    red_flags = 0
    green_flags = 0
    
    for exp in expenses:
        categories[exp['category']] = categories.get(exp['category'], 0) + exp['amount']
        if exp.get('flag') == 'red':
            red_flags += 1
        elif exp.get('flag') == 'green':
            green_flags += 1
    
    top_category = max(categories.items(), key=lambda x: x[1]) if categories else ("None", 0)
    avg_expense = total / len(expenses)
    
    analysis = f"""💰 **Financial Analysis Report**

🔍 **Spending Overview:**
• Total Expenses: ₹{total:,.2f}
• Number of Transactions: {len(expenses)}
• Average Expense: ₹{avg_expense:,.2f}

📈 **Top Spending Category:** {top_category[0]} (₹{top_category[1]:,.2f})

🚩 **Flags Summary:**
• ❌ Concerning expenses: {red_flags}
• ✅ Good spending choices: {green_flags}

💡 **Smart Tip:** {"Consider reviewing your " + top_category[0].lower() + " expenses - they're your biggest spending category!" if top_category[1] > total * 0.4 else "Your spending looks well-distributed across categories. Keep it up!"}"""
    
    return analysis

def generate_simple_chat_response(query: str, expenses: List[Dict]) -> str:
    query_lower = query.lower().strip()
    
    # Calculate basic stats
    total_amount = sum(exp['amount'] for exp in expenses)
    total_transactions = len(expenses)
    
    # Keywords matching for different query types
    if any(word in query_lower for word in ['total', 'spent', 'spend', 'money', 'much']):
        if total_transactions == 0:
            return "💰 You haven't recorded any expenses yet. Start tracking to see your spending patterns!"
        return f"💰 You've spent a total of ₹{total_amount:,.2f} across {total_transactions} transactions."
    
    elif any(word in query_lower for word in ['category', 'categories', 'breakdown', 'where']):
        if not expenses:
            return "📊 You don't have any expenses categorized yet. Add some expenses to see the breakdown!"
        
        categories = {}
        for exp in expenses:
            categories[exp['category']] = categories.get(exp['category'], 0) + exp['amount']
        
        sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
        response = "📊 **Your Spending by Category:**\n"
        for cat, amount in sorted_cats[:5]:  # Show top 5 categories
            percentage = (amount / total_amount) * 100
            response += f"• {cat}: ₹{amount:,.2f} ({percentage:.1f}%)\n"
        
        if len(sorted_cats) > 5:
            response += f"... and {len(sorted_cats) - 5} more categories"
        return response
    
    elif any(word in query_lower for word in ['budget', 'save', 'saving', 'reduce', 'cut']):
        if total_amount > 0:
            avg_per_transaction = total_amount / total_transactions
            return f"""💡 **Budgeting Tips for You:**
• Your average transaction is ₹{avg_per_transaction:.2f}
• Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings
• Set weekly spending limits to stay on track
• Review your largest expenses first for savings opportunities"""
        else:
            return """💡 **Budgeting Tips:**
• Start by tracking all your expenses
• Set realistic spending limits for each category
• Use the 50/30/20 rule as a guideline
• Review and adjust monthly"""
    
    elif any(word in query_lower for word in ['advice', 'tip', 'tips', 'help', 'improve']):
        tips = [
            "🍳 Cook at home more - it's usually 3x cheaper than eating out",
            "💳 Use the 24-hour rule for non-essential purchases over ₹500",
            "📱 Set up spending alerts to stay aware of your habits",
            "🎯 Focus on your top 3 expense categories for maximum impact",
            "📈 Automate your savings - pay yourself first",
            "🛒 Make a shopping list and stick to it to avoid impulse buys"
        ]
        import random
        return f"""🌟 **Smart Money Tip:**\n{random.choice(tips)}"""
    
    elif any(word in query_lower for word in ['recent', 'latest', 'last', 'yesterday', 'today']):
        if not expenses:
            return "📅 You haven't recorded any recent expenses. Add your first expense to get started!"
        
        # Sort by date (most recent first)
        recent_expenses = sorted(expenses, key=lambda x: x['date'], reverse=True)[:3]
        response = "📅 **Your Recent Expenses:**\n"
        for exp in recent_expenses:
            response += f"• {exp['date']}: {exp['category']} - ₹{exp['amount']:.2f} ({exp['description']})\n"
        return response
    
    elif any(word in query_lower for word in ['highest', 'biggest', 'largest', 'most', 'expensive']):
        if not expenses:
            return "💸 No expenses to analyze yet. Add some expenses first!"
        
        highest_expense = max(expenses, key=lambda x: x['amount'])
        return f"""💸 **Your Highest Expense:**
₹{highest_expense['amount']:.2f} on {highest_expense['category']} 
"{highest_expense['description']}" on {highest_expense['date']}"""
    
    elif any(word in query_lower for word in ['hello', 'hi', 'hey', 'start']):
        return f"""👋 **Hello! I'm your Brokemate assistant.**

I can help you with:
• 💰 Analyzing your spending (ask "how much did I spend?")
• 📊 Category breakdowns (ask "show me categories")
• 💡 Money-saving tips (ask "give me advice")
• 📅 Recent expense reviews (ask "show recent expenses")

You currently have {total_transactions} transactions totaling ₹{total_amount:,.2f}.

What would you like to explore?"""
    
    else:
        # More intelligent default response based on context
        if total_transactions == 0:
            return """🤔 I'd love to help! Try asking me:
• "How should I start budgeting?"
• "Give me some money tips"
• "How can I save money?"

Once you add some expenses, I can give you personalized insights!"""
        else:
            return f"""🤔 I can help you with that! Here's what I can do:

• 💰 "How much have I spent?" - Get your total spending
• 📊 "Show me by category" - See spending breakdown  
• 💡 "Give me tips" - Get personalized advice
• 📅 "Show recent expenses" - See your latest transactions

You have {total_transactions} transactions (₹{total_amount:,.2f} total). What interests you most?"""

# --- API ENDPOINTS ---

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Brokemate API is running!"}

@app.post("/register", tags=["Authentication"])
def register_user(username: str = Form(...), password: str = Form(...)):
    """Register a new user."""
    if username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    fake_users_db[username] = {
        "username": username,
        "password": hash_password(password)
    }
    user_expenses[username] = []
    return {"username": username}

@app.post("/token", tags=["Authentication"])
def login_for_access_token(username: str = Form(...), password: str = Form(...)):
    """Login and get access token."""
    user = fake_users_db.get(username)
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_simple_token(username)
    return {"access_token": access_token, "token_type": "bearer"}

# --- EXPENSE ENDPOINTS ---
def get_current_user(authorization: Optional[str] = None):
    """Get current user from token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    username = decode_simple_token(token)
    
    if username not in fake_users_db:
        raise HTTPException(status_code=401, detail="User not found")
    
    return username

@app.get("/expenses", tags=["Expenses"])
def get_expenses(request: Request):
    """Get all expenses for current user."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    expenses = user_expenses.get(username, [])
    return sorted(expenses, key=lambda x: x['date'], reverse=True)

@app.post("/add-expense", tags=["Expenses"])
def add_expense(
    request: Request,
    amount: float = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    date: str = Form(...)
):
    """Add a new expense."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    
    new_id = max((exp['id'] for exp in user_db), default=0) + 1
    new_expense = {
        "id": new_id,
        "amount": amount,
        "category": category,
        "description": description,
        "date": date,
        "flag": None
    }
    
    user_db.append(new_expense)
    user_expenses[username] = user_db
    return new_expense

@app.put("/edit-expense/{expense_id}", tags=["Expenses"])
def edit_expense(
    expense_id: int,
    request: Request,
    amount: float = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    date: str = Form(...)
):
    """Edit an existing expense."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    
    for exp in user_db:
        if exp["id"] == expense_id:
            exp.update({
                "amount": amount,
                "category": category,
                "description": description,
                "date": date
            })
            return exp
    
    raise HTTPException(status_code=404, detail="Expense not found")

@app.delete("/delete-expense/{expense_id}", tags=["Expenses"])
def delete_expense(expense_id: int, request: Request):
    """Delete an expense."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    
    original_count = len(user_db)
    user_db[:] = [exp for exp in user_db if exp['id'] != expense_id]
    
    if len(user_db) == original_count:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    user_expenses[username] = user_db
    return {"message": "Expense deleted"}

@app.post("/flag-expense", tags=["Expenses"])
def flag_expense(
    request: Request,
    id: int = Form(...),
    flag: str = Form(...)
):
    """Flag an expense as good or bad."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    
    for exp in user_db:
        if exp['id'] == id:
            exp['flag'] = flag
            return exp
    
    raise HTTPException(status_code=404, detail="Expense not found")

# --- AI ENDPOINTS ---
@app.post("/analyze", tags=["AI"])
def analyze_expenses(request: Request):
    """Analyze expenses using built-in intelligence."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    analysis_result = generate_simple_analysis(user_db)
    return {"analysis": analysis_result}

@app.post("/chat", tags=["AI"])
def chat_with_ai(request: Request, query: str = Form(...)):
    """Chat with AI assistant."""
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    user_db = user_expenses.get(username, [])
    chat_response = generate_simple_chat_response(query, user_db)
    return {"response": chat_response}

@app.post("/process-receipt", tags=["Receipt Processing"])
async def process_receipt(
    request: Request,
    file: UploadFile = File(...),
    description: str = Form("Receipt items")
):
    """Process a receipt image and extract expenses automatically."""
    if not RECEIPT_PARSING_ENABLED or receipt_parser is None:
        raise HTTPException(
            status_code=501, 
            detail="Receipt processing is not available. Please install required dependencies: pillow, pytesseract, transformers"
        )
    
    authorization = request.headers.get("authorization")
    username = get_current_user(authorization)
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")
    
    try:
        # Read the uploaded file
        image_data = await file.read()
        
        # Save to temporary file
        temp_path = receipt_parser.save_temp_image(image_data)
        
        try:
            # Process the receipt
            expenses = receipt_parser.process_receipt(temp_path, description)
            
            # Add expenses to user's database
            user_db = user_expenses.setdefault(username, [])
            next_id = max([exp.get("id", 0) for exp in user_db], default=0) + 1
            
            added_expenses = []
            for expense_data in expenses:
                expense = {
                    "id": next_id,
                    "amount": expense_data["amount"],
                    "category": expense_data["category"],
                    "description": expense_data["description"],
                    "date": expense_data["date"],
                    "flag": None
                }
                user_db.append(expense)
                added_expenses.append(expense)
                next_id += 1
            
            return {
                "message": f"Successfully processed receipt and added {len(added_expenses)} expenses",
                "expenses_added": len(added_expenses),
                "expenses": added_expenses
            }
            
        finally:
            # Clean up temporary file
            receipt_parser.cleanup_temp_file(temp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing receipt: {str(e)}")

# --- RUN SERVER ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)