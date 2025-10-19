import uvicorn
import json
from datetime import date, timedelta, datetime
from typing import List, Optional, Dict, Any, Literal
import os

from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
import hashlib
import replicate
from receipt_parser import ReceiptParser

# --- 1. APPLICATION SETUP ---
app = FastAPI(
    title="Brokemate API",
    description="Backend for the Brokemate personal expense management application.",
    version="1.2.0"
)

# --- 2. CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. SECURITY & AUTHENTICATION SETUP ---
SECRET_KEY = "a_very_secret_key_that_should_be_in_an_env_file"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- REPLICATE API CONFIGURATION ---
REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN", "")
if not REPLICATE_API_TOKEN:
    raise ValueError("REPLICATE_API_TOKEN environment variable is required")
os.environ["REPLICATE_API_TOKEN"] = REPLICATE_API_TOKEN

# --- RECEIPT PARSER INITIALIZATION ---
receipt_parser = ReceiptParser()

# --- 4. IN-MEMORY DATABASE ---
# This is now structured to support multiple users.
fake_users_db = {}
user_expenses = {}

# Sample data for a test user for easy testing
test_user = "user@example.com"
fake_users_db[test_user] = {
    "username": test_user,
    "full_name": "Test User",
    "email": test_user,
    "hashed_password": pwd_context.hash("password123"[:72]),  # Truncate password to fix bcrypt issue
    "disabled": False,
}
user_expenses[test_user] = [
    {"id": 1, "amount": 250.00, "category": "Food", "description": "Lunch with colleagues", "date": "2025-09-27", "flag": None},
    {"id": 2, "amount": 1200.50, "category": "Shopping", "description": "New headphones", "date": "2025-09-26", "flag": "red"},
    {"id": 3, "amount": 150.00, "category": "Transport", "description": "Metro card recharge", "date": "2025-09-25", "flag": "green"},
]


# --- 5. PYDANTIC MODELS (DATA & USER VALIDATION) ---

# Expense Models
class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="The expense amount, must be positive.")
    category: str
    description: Optional[str] = None
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    flag: Optional[Literal['red', 'green']] = None

class FlagUpdate(BaseModel):
    id: int
    flag: Literal['red', 'green']

# User & Token Models
class User(BaseModel):
    username: str

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# AI Models - Note: The frontend will send all expenses for context.
class ChatRequest(BaseModel):
    query: str


# --- 6. AUTHENTICATION HELPER FUNCTIONS ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    # Ensure password is a string and has reasonable length
    if not isinstance(password, str):
        password = str(password)
    if len(password) > 72:  # bcrypt max length
        password = password[:72]
    return pwd_context.hash(password)

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# --- 7. AI RESPONSES USING REPLICATE IBM GRANITE 3.3 8B INSTRUCT ---

def call_replicate_model(prompt: str, max_tokens: int = 1000) -> str:
    """Call the IBM Granite 3.3 8B Instruct model via Replicate API."""
    try:
        output = replicate.run(
            "ibm-granite/granite-3.3-8b-instruct",
            input={
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9,
            }
        )
        
        # The output is an iterator, so we need to join it
        response = "".join(output)
        return response.strip()
        
    except Exception as e:
        print(f"Error calling Replicate API: {e}")
        return f"I apologize, but I'm having trouble connecting to the AI service right now. Please try again later."

def generate_expense_summary(expenses: List[dict]) -> str:
    """Generate a summary of expenses for context."""
    if not expenses:
        return "No expenses recorded yet."
    
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
    
    summary = f"Total expenses: ₹{total:,.2f} across {len(expenses)} transactions.\n"
    summary += "Spending by category:\n"
    for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        percentage = (amount / total) * 100
        summary += f"  - {cat}: ₹{amount:,.2f} ({percentage:.1f}%)\n"
    summary += f"Flagged expenses: {red_flags} concerning (red), {green_flags} good choices (green)"
    
    return summary

def generate_ai_analysis(expenses: List[dict]) -> str:
    """Generate financial analysis using IBM Granite 3.3 8B Instruct."""
    if not expenses:
        return "� You haven't added any expenses yet! Start tracking your spending to get personalized insights."
    
    expense_summary = generate_expense_summary(expenses)
    
    prompt = f"""You are a helpful financial advisor assistant for the Brokemate expense tracking app. 
Analyze the following expense data and provide actionable insights, tips, and recommendations.
Be friendly, encouraging, and use emojis where appropriate. Keep the response concise but informative.

{expense_summary}

Provide a comprehensive financial analysis report that includes:
1. Overview of spending patterns
2. Insights about the top spending categories
3. Specific recommendations for improvement
4. Budget optimization tips

Format your response with clear sections and bullet points."""

    return call_replicate_model(prompt, max_tokens=800)

def generate_ai_chat_response(query: str, expenses: List[dict]) -> str:
    """Generate chat response using IBM Granite 3.3 8B Instruct."""
    expense_summary = generate_expense_summary(expenses)
    
    prompt = f"""You are a helpful financial advisor chatbot for the Brokemate expense tracking app.
Answer the user's question based on their expense data. Be friendly, helpful, and use emojis where appropriate.
Keep responses concise and actionable.

User's expense data:
{expense_summary}

User's question: {query}

Provide a helpful, personalized response:"""

    return call_replicate_model(prompt, max_tokens=600)


# --- 8. API ENDPOINTS ---

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/register", response_model=User, status_code=201, tags=["Authentication"])
def register_user(user: UserCreate):
    """Register a new user."""
    if user.username in fake_users_db:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = UserInDB(username=user.username, hashed_password=hashed_password)
    fake_users_db[user.username] = new_user.dict()
    user_expenses[user.username] = []
    return new_user

@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Logs in a user and returns a JWT token."""
    user = get_user(fake_users_db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- PROTECTED EXPENSE MANAGEMENT ENDPOINTS ---

@app.get("/expenses", response_model=List[Expense], tags=["Expenses"])
def get_expenses(current_user: User = Depends(get_current_user)):
    """Retrieve all expenses for the current user."""
    user_db = user_expenses.get(current_user.username, [])
    return sorted(user_db, key=lambda x: x['date'], reverse=True)

@app.post("/add-expense", response_model=Expense, status_code=201, tags=["Expenses"])
def add_expense(expense: ExpenseCreate, current_user: User = Depends(get_current_user)):
    """Add a new expense for the current user."""
    try:
        print(f"DEBUG: Received expense data: {expense.dict()}")
        user_db = user_expenses.get(current_user.username, [])
        new_id = max((d['id'] for d in user_db), default=0) + 1
        new_expense_data = expense.dict()
        new_expense_data.update({"id": new_id, "flag": None})
        new_expense_data['date'] = new_expense_data['date'].isoformat()
        user_db.append(new_expense_data)
        user_expenses[current_user.username] = user_db
        print(f"DEBUG: Successfully added expense with id {new_id}")
        return new_expense_data
    except Exception as e:
        print(f"ERROR in add_expense: {str(e)}")
        raise
    
@app.put("/edit-expense/{expense_id}", response_model=Expense, tags=["Expenses"])
def edit_expense(expense_id: int, expense_update: ExpenseCreate, current_user: User = Depends(get_current_user)):
    """Update an existing expense by its ID for the current user."""
    user_db = user_expenses.get(current_user.username, [])
    for index, item in enumerate(user_db):
        if item["id"] == expense_id:
            updated_data = expense_update.dict()
            updated_data['date'] = updated_data['date'].isoformat()
            user_db[index].update(updated_data)
            return user_db[index]
    raise HTTPException(status_code=404, detail="Expense not found")

@app.post("/flag-expense", response_model=Expense, tags=["Expenses"])
def flag_expense(flag_update: FlagUpdate, current_user: User = Depends(get_current_user)):
    """Flag an expense as 'red' or 'green' for the current user."""
    user_db = user_expenses.get(current_user.username, [])
    for item in user_db:
        if item['id'] == flag_update.id:
            item['flag'] = flag_update.flag
            return item
    raise HTTPException(status_code=404, detail="Expense not found")

@app.delete("/delete-expense/{expense_id}", status_code=204, tags=["Expenses"])
def delete_expense(expense_id: int, current_user: User = Depends(get_current_user)):
    """Delete an expense by its ID for the current user."""
    user_db = user_expenses.get(current_user.username, [])
    original_count = len(user_db)
    user_db = [item for item in user_db if item['id'] != expense_id]
    if len(user_db) == original_count:
        raise HTTPException(status_code=404, detail="Expense not found")
    user_expenses[current_user.username] = user_db
    return

# --- AI ENDPOINTS (Simplified) ---

@app.post("/analyze", tags=["AI"])
def analyze_expenses(current_user: User = Depends(get_current_user)):
    """Analyzes the current user's spending habits using IBM Granite 3.3 8B Instruct via Replicate."""
    user_db = user_expenses.get(current_user.username, [])
    analysis_result = generate_ai_analysis(user_db)
    return {"analysis": analysis_result}

@app.post("/chat", tags=["AI"])
def chat_with_ai(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """Powers the AI chat using IBM Granite 3.3 8B Instruct via Replicate, with the current user's expense data as context."""
    user_db = user_expenses.get(current_user.username, [])
    chat_response = generate_ai_chat_response(request.query, user_db)
    return {"response": chat_response}

# --- RECEIPT PROCESSING ENDPOINT ---
@app.post("/process-receipt", tags=["Expenses"])
async def process_receipt(
    file: UploadFile = File(...),
    description: str = "Receipt items",
    current_user: User = Depends(get_current_user)
):
    """Process a receipt image and automatically add expenses."""
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    temp_file_path = None
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Save to temporary file
        temp_file_path = receipt_parser.save_temp_image(contents)
        
        # Process the receipt
        expenses = receipt_parser.process_receipt(temp_file_path, description)
        
        # Add expenses to user's account
        user_db = user_expenses.get(current_user.username, [])
        next_id = max((d['id'] for d in user_db), default=0) + 1
        
        for expense in expenses:
            expense['id'] = next_id
            expense['flag'] = None
            user_db.append(expense)
            next_id += 1
        
        user_expenses[current_user.username] = user_db
        
        return {
            "message": "Receipt processed successfully",
            "expenses_added": len(expenses),
            "expenses": expenses
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary file
        if temp_file_path:
            receipt_parser.cleanup_temp_file(temp_file_path)

# --- Health Check ---
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Brokemate API is running!"}

# --- This line allows you to run the file directly for testing ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)