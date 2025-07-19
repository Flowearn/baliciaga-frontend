#!/usr/bin/env python3
"""
Debug JSON checker to understand why some files pass and others fail
"""

import json
from pathlib import Path

# Test files
test_files = [
    # Passed
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/en/descriptions/ChIJN5xTyos50i0RiGBQWrCPinA.json",
    # Failed
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJN5xTyos50i0RiGBQWrCPinA.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/ru/descriptions/ChIJgfLsf1pF0i0RTDMRSpGD_Zs.json"
]

for file_path in test_files:
    print(f"\n{'='*60}")
    print(f"Checking: {Path(file_path).name}")
    print(f"Language: {Path(file_path).parts[-3]}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Show the raw content around line 3-4
        lines = content.split('\n')
        print(f"\nLines 3-4:")
        if len(lines) >= 4:
            for i in range(2, min(5, len(lines))):
                print(f"  Line {i+1}: {repr(lines[i])}")
        
        # Try to parse
        data = json.loads(content)
        print(f"\n✅ JSON VALID - {len(data['sections'])} sections found")
        
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON INVALID: {str(e)}")
        
        # Show character position
        if hasattr(e, 'pos'):
            print(f"Error position: {e.pos}")
            print(f"Context: {repr(content[max(0, e.pos-20):e.pos+20])}")