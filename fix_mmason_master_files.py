#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix M. MASON content field in master description files
"""
import json
import os

def fix_mmason_in_descriptions():
    """Fix M. MASON content field to body in all description master files"""
    
    languages = ['en', 'zh', 'ru', 'ko']
    base_path = 'public/locales'
    
    for lang in languages:
        file_path = os.path.join(base_path, lang, f'descriptions.{lang}.json')
        
        print(f"\nProcessing {file_path}...")
        
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Find M. MASON entry
            fixed = False
            for place_id, venue in data.items():
                if venue.get('name') == 'M. MASON Bar | Grill Canggu':
                    print(f"  Found M. MASON with placeId: {place_id}")
                    
                    # Fix content to body in sections
                    if 'sections' in venue:
                        for section in venue['sections']:
                            if 'content' in section:
                                section['body'] = section.pop('content')
                                fixed = True
                                print(f"    Fixed 'content' to 'body' in section: {section.get('title', 'Unknown')}")
                    
            if fixed:
                # Write the updated data back
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"  ✅ Successfully updated {file_path}")
            else:
                print(f"  ℹ️  No changes needed in {file_path}")
                
        except FileNotFoundError:
            print(f"  ❌ File not found: {file_path}")
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON decode error in {file_path}: {e}")
        except Exception as e:
            print(f"  ❌ Error processing {file_path}: {e}")
    
    print("\n✨ Fix completed!")

if __name__ == "__main__":
    fix_mmason_in_descriptions()