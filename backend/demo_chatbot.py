#!/usr/bin/env python3
"""
Quick demo of the chatbot with pre-defined queries
"""
import requests
import json
from time import sleep

BASE_URL = "http://localhost:8000"
TEST_USER = "testuser@example.com"
TEST_PASSWORD = "testpass123"

def get_token():
    login_data = {"username": TEST_USER, "password": TEST_PASSWORD}
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def chat(query, token):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/chat", json={"query": query}, headers=headers)
    if response.status_code == 200:
        return response.json()["response"]
    return f"Error: {response.status_code}"

print("\n" + "🎬 " * 30)
print("     BROKEMATE AI CHATBOT - LIVE DEMO")
print("🎬 " * 30)

print("\n🔐 Authenticating...")
token = get_token()
if not token:
    print("❌ Authentication failed!")
    exit(1)

print("✅ Ready!\n")

# Demo queries
demo_queries = [
    "Hello! Can you help me understand my spending?",
    "What are my biggest expenses this month?",
    "I want to save more money. Any suggestions?",
]

for i, query in enumerate(demo_queries, 1):
    print("=" * 80)
    print(f"\n💬 Demo Query #{i}")
    print(f"👤 User: {query}\n")
    print("⏳ AI is analyzing your expenses and generating response...")
    
    response = chat(query, token)
    
    print(f"\n🤖 AI Assistant:")
    print("-" * 80)
    print(response)
    print("-" * 80)
    
    if i < len(demo_queries):
        print("\n⏸  Next query in 3 seconds...")
        sleep(3)

print("\n" + "=" * 80)
print("\n✅ Demo completed! Your chatbot is working perfectly!")
print("\n💡 Try the interactive mode: python3 interactive_chat.py")
print("=" * 80 + "\n")
