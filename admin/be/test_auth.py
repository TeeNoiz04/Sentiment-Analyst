"""
Test script for authentication and session management
"""
import requests
import json

BASE_URL = "http://localhost:8000/client/auth"

def test_auth_flow():
    """Test complete authentication flow"""
    
    print("=" * 60)
    print("Testing Authentication & Session Management")
    print("=" * 60)
    
    # 1. Register
    print("\n1. Testing Register...")
    register_data = {
        "username": "testuser123",
        "password": "password123",
        "email": "test@example.com",
        "full_name": "Test User",
        "device_id": "test-device-001"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/register", json=register_data)
        if response.status_code == 201:
            print("✓ Register successful!")
            tokens = response.json()
            access_token = tokens["access_token"]
            refresh_token = tokens["refresh_token"]
            print(f"  User ID: {tokens['user']['user_id']}")
            print(f"  Username: {tokens['user']['username']}")
        else:
            print(f"✗ Register failed: {response.json()}")
            # Try login if user exists
            print("\n  Trying login instead...")
            login_data = {
                "username": register_data["username"],
                "password": register_data["password"]
            }
            response = requests.post(f"{BASE_URL}/login", json=login_data)
            if response.status_code == 200:
                print("✓ Login successful!")
                tokens = response.json()
                access_token = tokens["access_token"]
                refresh_token = tokens["refresh_token"]
            else:
                print(f"✗ Login failed: {response.json()}")
                return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    # 2. Get current user info
    print("\n2. Testing Get Current User Info...")
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        if response.status_code == 200:
            print("✓ Get user info successful!")
            user = response.json()
            print(f"  Username: {user['username']}")
            print(f"  Email: {user['email']}")
            print(f"  Status: {user['status']}")
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 3. Get all sessions
    print("\n3. Testing Get All Sessions...")
    try:
        response = requests.get(f"{BASE_URL}/sessions", headers=headers)
        if response.status_code == 200:
            print("✓ Get sessions successful!")
            data = response.json()
            print(f"  Total sessions: {data['total']}")
            for session in data['sessions']:
                print(f"  - Session {session['session_id']}: {session['device_info']} from {session['ip_address']}")
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 4. Login from another device
    print("\n4. Testing Login from Another Device...")
    login_data = {
        "username": register_data["username"],
        "password": register_data["password"],
        "device_id": "test-device-002"
    }
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        if response.status_code == 200:
            print("✓ Second login successful!")
            tokens2 = response.json()
            access_token2 = tokens2["access_token"]
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 5. Check sessions again
    print("\n5. Testing Get Sessions After Second Login...")
    try:
        response = requests.get(f"{BASE_URL}/sessions", headers=headers)
        if response.status_code == 200:
            print("✓ Get sessions successful!")
            data = response.json()
            print(f"  Total sessions: {data['total']}")
            for session in data['sessions']:
                print(f"  - Session {session['session_id']}: {session['device_info']}")
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 6. Refresh token
    print("\n6. Testing Token Refresh...")
    refresh_data = {"refresh_token": refresh_token}
    try:
        response = requests.post(f"{BASE_URL}/refresh", json=refresh_data)
        if response.status_code == 200:
            print("✓ Token refresh successful!")
            new_tokens = response.json()
            new_access_token = new_tokens["access_token"]
            print("  New access token received")
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 7. Logout
    print("\n7. Testing Logout...")
    try:
        response = requests.post(f"{BASE_URL}/logout", headers=headers)
        if response.status_code == 200:
            print("✓ Logout successful!")
            print(f"  {response.json()['message']}")
        else:
            print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 8. Try to access protected endpoint after logout
    print("\n8. Testing Access After Logout...")
    try:
        response = requests.get(f"{BASE_URL}/me", headers=headers)
        if response.status_code == 401:
            print("✓ Access denied as expected!")
            print(f"  {response.json()['detail']}")
        else:
            print(f"✗ Unexpected response: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # 9. Login again and test logout all
    print("\n9. Testing Logout All Sessions...")
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        if response.status_code == 200:
            tokens3 = response.json()
            access_token3 = tokens3["access_token"]
            headers3 = {"Authorization": f"Bearer {access_token3}"}
            
            response = requests.post(f"{BASE_URL}/logout-all", headers=headers3)
            if response.status_code == 200:
                print("✓ Logout all successful!")
                data = response.json()
                print(f"  {data['message']}")
                print(f"  Sessions revoked: {data['sessions_revoked']}")
            else:
                print(f"✗ Failed: {response.json()}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)


if __name__ == "__main__":
    test_auth_flow()
