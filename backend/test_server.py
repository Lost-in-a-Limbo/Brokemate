#!/usr/bin/env python3
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing FastAPI import...")
    from fastapi import FastAPI
    print("✓ FastAPI imported successfully")
    
    print("Testing Uvicorn import...")
    import uvicorn
    print("✓ Uvicorn imported successfully")
    
    print("Testing Pydantic import...")
    from pydantic import BaseModel
    print("✓ Pydantic imported successfully")
    
    print("Testing passlib import...")
    from passlib.context import CryptContext
    print("✓ Passlib imported successfully")
    
    print("Testing bcrypt...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    test_hash = pwd_context.hash("test123")
    print(f"✓ Bcrypt working - hash: {test_hash[:20]}...")
    
    print("Testing verification...")
    is_valid = pwd_context.verify("test123", test_hash)
    print(f"✓ Verification: {'PASS' if is_valid else 'FAIL'}")
    
    print("\nAll imports successful! Starting minimal server...")
    
    app = FastAPI(title="Test API")
    
    @app.get("/")
    def read_root():
        return {"status": "healthy", "message": "Test API is running!"}
    
    @app.get("/test")
    def test_endpoint():
        return {"test": "working", "bcrypt": "functional"}
    
    if __name__ == "__main__":
        print("Starting server on http://localhost:8000")
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)