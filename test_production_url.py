#!/usr/bin/env python3
import requests
import json

# Test the production URL for the description file
place_id = "ChIJNzjyIBI50i0RpFdnd_ZN3pg"
base_url = "https://baliciaga.com"

languages = ['en', 'zh', 'ko', 'ru']

print("Testing production URLs for Black Sand Brewery descriptions...\n")

for lang in languages:
    url = f"{base_url}/locales/{lang}/descriptions/{place_id}.json"
    print(f"Testing {lang}: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                sections = len(data.get('sections', []))
                print(f"  ✓ Valid JSON with {sections} sections")
            except json.JSONDecodeError as e:
                print(f"  ✗ Invalid JSON: {e}")
                print(f"  Response preview: {response.text[:200]}...")
        else:
            print(f"  ✗ HTTP Error")
            print(f"  Response: {response.text[:200]}...")
    except Exception as e:
        print(f"  ✗ Request failed: {e}")
    
    print()

print("\nChecking if the files have been deployed to production...")
print("Note: The fixed files are currently only in the dev branch and haven't been merged to main/production yet.")