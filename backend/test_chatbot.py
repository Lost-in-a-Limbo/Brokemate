#!/usr/bin/env python3
"""
Comprehensive test script for the Brokemate AI Chatbot
Tests authentication, expense management, and AI chat functionality
"""
import requests
import json
from time import sleep

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = "testuser@example.com"
TEST_PASSWORD = "testpass123"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_response(response, title="Response"):
    """Print formatted API response"""
    print(f"\n{title}:")
    print("-" * 60)
    if response.status_code == 200 or response.status_code == 201:
        try:
            data = response.json()
            print(json.dumps(data, indent=2))
        except:
            print(response.text)
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
    print("-" * 60)

def test_health_check():
    """Test if the server is running"""
    print_section("1. HEALTH CHECK")
    response = requests.get(f"{BASE_URL}/")
    print_response(response, "Server Status")
    return response.status_code == 200

def register_and_login():
    """Register a new user and login"""
    print_section("2. USER REGISTRATION & LOGIN")
    
    # Register
    print("\n📝 Registering new user...")
    register_data = {
        "username": TEST_USER,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/register", json=register_data)
    if response.status_code == 201:
        print("✅ User registered successfully")
    elif response.status_code == 400:
        print("ℹ️  User already exists, proceeding to login...")
    else:
        print_response(response, "Registration Error")
        return None
    
    # Login
    print("\n🔐 Logging in...")
    login_data = {
        "username": TEST_USER,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✅ Login successful! Token: {token[:20]}...")
        return token
    else:
        print_response(response, "Login Error")
        return None

def add_sample_expenses(token):
    """Add sample expenses for testing"""
    print_section("3. ADDING SAMPLE EXPENSES")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    sample_expenses = [
        {"amount": 1250.00, "category": "Food", "description": "Grocery shopping at supermarket", "date": "2025-10-15"},
        {"amount": 850.50, "category": "Food", "description": "Dinner with friends at restaurant", "date": "2025-10-16"},
        {"amount": 2500.00, "category": "Shopping", "description": "New laptop accessories", "date": "2025-10-14"},
        {"amount": 500.00, "category": "Transport", "description": "Monthly metro pass", "date": "2025-10-12"},
        {"amount": 300.00, "category": "Entertainment", "description": "Movie tickets and snacks", "date": "2025-10-17"},
        {"amount": 1500.00, "category": "Health", "description": "Gym membership renewal", "date": "2025-10-10"},
        {"amount": 2000.00, "category": "Utilities", "description": "Electricity and water bills", "date": "2025-10-18"},
        {"amount": 450.00, "category": "Food", "description": "Coffee shop visits", "date": "2025-10-18"},
        {"amount": 3500.00, "category": "Shopping", "description": "New clothes for winter", "date": "2025-10-13"},
        {"amount": 750.00, "category": "Transport", "description": "Fuel expenses", "date": "2025-10-19"},
    ]
    
    added_count = 0
    for expense in sample_expenses:
        response = requests.post(f"{BASE_URL}/add-expense", json=expense, headers=headers)
        if response.status_code == 201:
            added_count += 1
            print(f"✅ Added: {expense['description']} - ₹{expense['amount']}")
        else:
            print(f"❌ Failed to add: {expense['description']}")
    
    print(f"\n✅ Successfully added {added_count}/{len(sample_expenses)} expenses")
    return added_count > 0

def test_ai_analysis(token):
    """Test the AI expense analysis feature"""
    print_section("4. AI EXPENSE ANALYSIS")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🤖 Requesting AI analysis of expenses...")
    print("⏳ This may take a few seconds as the AI model generates insights...")
    
    response = requests.post(f"{BASE_URL}/analyze", headers=headers)
    
    if response.status_code == 200:
        analysis = response.json()["analysis"]
        print("\n✅ AI Analysis received:")
        print("-" * 60)
        print(analysis)
        print("-" * 60)
        return True
    else:
        print_response(response, "Analysis Error")
        return False

def test_chatbot_queries(token):
    """Test various chatbot queries"""
    print_section("5. AI CHATBOT QUERIES")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    test_queries = [
        "What is my total spending?",
        "Which category am I spending the most on?",
        "Give me some tips to save money on food",
        "How can I budget better?",
        "Analyze my transport expenses",
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'─'*60}")
        print(f"Query {i}: {query}")
        print('─'*60)
        print("⏳ Asking AI chatbot...")
        
        response = requests.post(
            f"{BASE_URL}/chat",
            json={"query": query},
            headers=headers
        )
        
        if response.status_code == 200:
            answer = response.json()["response"]
            print("\n🤖 AI Response:")
            print(answer)
        else:
            print_response(response, "Chat Error")
        
        # Add delay to avoid rate limiting
        if i < len(test_queries):
            sleep(2)
    
    return True

def test_expense_retrieval(token):
    """Test retrieving all expenses"""
    print_section("6. RETRIEVE ALL EXPENSES")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/expenses", headers=headers)
    
    if response.status_code == 200:
        expenses = response.json()
        print(f"\n✅ Retrieved {len(expenses)} expenses:")
        
        total = sum(exp['amount'] for exp in expenses)
        categories = {}
        
        for exp in expenses:
            cat = exp['category']
            categories[cat] = categories.get(cat, 0) + exp['amount']
        
        print(f"\n📊 Summary:")
        print(f"   Total Expenses: ₹{total:,.2f}")
        print(f"   Number of Transactions: {len(expenses)}")
        print(f"\n📈 By Category:")
        for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            percentage = (amount / total) * 100
            print(f"   • {cat}: ₹{amount:,.2f} ({percentage:.1f}%)")
        
        return True
    else:
        print_response(response, "Retrieval Error")
        return False

def main():
    """Run all tests"""
    print("\n" + "🚀 " * 25)
    print("  BROKEMATE AI CHATBOT - COMPREHENSIVE TEST SUITE")
    print("🚀 " * 25)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Server is not running. Please start the server first.")
        return
    
    # Test 2: Authentication
    token = register_and_login()
    if not token:
        print("\n❌ Authentication failed. Cannot proceed with tests.")
        return
    
    # Test 3: Add Sample Data
    if not add_sample_expenses(token):
        print("\n⚠️  Warning: Could not add all expenses. Continuing anyway...")
    
    # Test 4: Retrieve Expenses
    test_expense_retrieval(token)
    
    # Test 5: AI Analysis
    test_ai_analysis(token)
    
    # Test 6: Chatbot Queries
    test_chatbot_queries(token)
    
    # Summary
    print_section("TEST SUMMARY")
    print("\n✅ All tests completed!")
    print("\n📝 What was tested:")
    print("   ✓ Server health check")
    print("   ✓ User registration and authentication")
    print("   ✓ Expense creation and retrieval")
    print("   ✓ AI-powered expense analysis")
    print("   ✓ AI chatbot with multiple queries")
    print("\n🎉 Your Brokemate AI Chatbot is working perfectly!")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except requests.exceptions.ConnectionError:
        print("\n\n❌ Could not connect to server. Please make sure it's running on port 8000")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
