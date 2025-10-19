#!/usr/bin/env python3
"""
Interactive chatbot test - allows you to chat with the AI in real-time
"""
import requests
import json

BASE_URL = "http://localhost:8000"
TEST_USER = "testuser@example.com"
TEST_PASSWORD = "testpass123"

def get_token():
    """Get authentication token"""
    login_data = {
        "username": TEST_USER,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def chat(query, token):
    """Send a chat query to the AI"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/chat",
        json={"query": query},
        headers=headers
    )
    if response.status_code == 200:
        return response.json()["response"]
    return f"Error: {response.status_code}"

def main():
    print("\n" + "🤖 " * 30)
    print("     BROKEMATE AI CHATBOT - INTERACTIVE MODE")
    print("🤖 " * 30)
    
    # Get token
    print("\n🔐 Authenticating...")
    token = get_token()
    if not token:
        print("❌ Authentication failed!")
        return
    
    print("✅ Authenticated successfully!")
    print("\n" + "─" * 80)
    print("💡 TIP: Ask questions about your expenses, request financial advice,")
    print("        or get budgeting tips. Type 'quit' to exit.")
    print("─" * 80)
    
    # Interactive loop
    while True:
        try:
            print("\n" + "="*80)
            user_input = input("👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Thanks for using Brokemate AI Chatbot! Goodbye!\n")
                break
            
            if not user_input:
                continue
            
            print("\n⏳ AI is thinking...")
            response = chat(user_input, token)
            
            print(f"\n🤖 AI: {response}")
            
        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
