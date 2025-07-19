#!/usr/bin/env python3
import json

filepath = '/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJgfLsf1pF0i0RTDMRSpGD_Zs.json'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Check for curly quotes
if '"' in content or '"' in content:
    print("Found curly quotes in the file!")
    print(f'Number of " quotes: {content.count('"')}')
    print(f'Number of " quotes: {content.count('"')}')
    
    # Show first occurrence
    idx = content.find('"')
    if idx != -1:
        print(f"\nFirst curly quote at position {idx}:")
        print(content[max(0, idx-20):idx+20])
else:
    print("No curly quotes found")

# Try to parse as JSON
try:
    json.loads(content)
    print("\nJSON parsing: SUCCESS")
except json.JSONDecodeError as e:
    print(f"\nJSON parsing: FAILED")
    print(f"Error: {e}")