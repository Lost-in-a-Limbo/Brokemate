#!/usr/bin/env python3
"""Quick terminal chatbot test"""
import requests

BASE_URL = "http://localhost:8000"
USER = "testuser@example.com"
PASS = "testpass123"

# Login
print("🔐 Logging in...")
response = requests.post(f"{BASE_URL}/token", data={"username": USER, "password": PASS})
if response.status_code != 200:
    print("❌ Login failed! Make sure the user exists.")
    exit(1)

token = response.json()["access_token"]
print("✅ Logged in successfully!\n")

# Quick chat test
print("="*70)
print("  🤖 BROKEMATE CHATBOT - TERMINAL TEST")
print("="*70)

test_query = "What's my total spending and give me a quick tip to save money?"

print(f"\n💬 Question: {test_query}")
print("\n⏳ AI is thinking...\n")

headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/chat", json={"query": test_query}, headers=headers)

if response.status_code == 200:
    ai_response = response.json()["response"]
    print("🤖 AI Response:")
    print("-"*70)
    print(ai_response)
    print("-"*70)
    print("\n✅ Chatbot is working! Integration complete!")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

print("\n" + "="*70 + "\n")
