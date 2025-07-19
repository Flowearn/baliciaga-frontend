#!/usr/bin/env python3
import json
import re
import os

def fix_json_file(filepath):
    """Fix a JSON file with incorrect quotes"""
    print(f"\nProcessing: {filepath}")
    
    try:
        # Read as text, not JSON
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract sections data
        sections = []
        
        # Pattern to find sections array content
        # This pattern handles both correct and incorrect quotes
        pattern = r'\{\s*["""]title["""]\s*:\s*["""]([^"""]+)["""]\s*,\s*["""]body["""]\s*:\s*["""]([^"""]+)["""]\s*\}'
        
        matches = re.findall(pattern, content, re.DOTALL)
        
        if not matches:
            print(f"  WARNING: No sections found in {filepath}")
            return False
            
        for title, body in matches:
            # Clean up the extracted text
            title = title.strip()
            body = body.strip()
            sections.append({
                "title": title,
                "body": body
            })
        
        # Create clean data structure
        clean_data = {
            "sections": sections
        }
        
        # Generate clean JSON
        clean_json = json.dumps(clean_data, ensure_ascii=False, indent=2)
        
        # Write back to file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(clean_json)
        
        print(f"  ✓ Fixed! Found {len(sections)} sections")
        return True
        
    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return False

# List of files to fix
files_to_fix = [
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/ru/descriptions/ChIJgfLsf1pF0i0RTDMRSpGD_Zs.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJN5xTyos50i0RiGBQWrCPinA.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJk4MaNPo50i0R4vfuHDwZ_3U.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJe7KSn4dH0i0RsfzzpwFhwpQ.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJkYxdu3E50i0RrFJjPHk8LqI.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJOwB4D8E50i0RnmcWbm5B1jI.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJgfLsf1pF0i0RTDMRSpGD_Zs.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJNzjyIBI50i0RpFdnd_ZN3pg.json",
    "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJ5Wex6mc50i0RNSHWdVKVoPo.json"
]

# Process all files
print("Starting JSON repair process...")
fixed_count = 0
for filepath in files_to_fix:
    if fix_json_file(filepath):
        fixed_count += 1

print(f"\n✅ Complete! Fixed {fixed_count}/{len(files_to_fix)} files")

# Verify the fixes
print("\n🔍 Verifying all fixed files...")
all_valid = True
for filepath in files_to_fix:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"  ✓ {os.path.basename(filepath)} - Valid JSON")
    except json.JSONDecodeError as e:
        print(f"  ✗ {os.path.basename(filepath)} - Still invalid: {e}")
        all_valid = False

if all_valid:
    print("\n🎉 All files are now valid JSON!")
else:
    print("\n⚠️  Some files still have issues")