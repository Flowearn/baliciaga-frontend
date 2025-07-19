#!/usr/bin/env python3
"""
JSON Syntax Checker for Bar Description Files
Checks all description JSON files for valid syntax across all languages and placeIds
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Configuration
PLACE_IDS = [
    "ChIJN5xTyos50i0RiGBQWrCPinA",
    "ChIJk4MaNPo50i0R4vfuHDwZ_3U",
    "ChIJkYxdu3E50i0RrFJjPHk8LqI",
    "ChIJOwB4D8E50i0RnmcWbm5B1jI",
    "ChIJgfLsf1pF0i0RTDMRSpGD_Zs",
    "ChIJe7KSn4dH0i0RsfzzpwFhwpQ",
    "ChIJNzjyIBI50i0RpFdnd_ZN3pg",
    "ChIJcfxIJo850i0RsrveoncQeBs",
    "ChIJ_XZL_xFH0i0RTo0EWBqsnRs",
    "ChIJCdPou9hH0i0RgIY7umQ751U",
    "ChIJiQdg1YdH0i0R8ANUMzZizN0",
    "ChIJxZh1qu1H0i0R5BXWVSV1zK8",
    "ChIJ5Wex6mc50i0RNSHWdVKVoPo",
    "ChIJYcKvqiJH0i0RtzWDiRmCnI0"
]

LANGUAGES = ["en", "ko", "ru", "zh"]
BASE_PATH = "/Users/troy/开发文档/Baliciaga/frontend/public/locales"


def check_json_file(file_path: Path) -> Tuple[bool, str]:
    """
    Check if a file contains valid JSON.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        if not file_path.exists():
            return False, f"File not found"
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Try to parse the JSON
        json.loads(content)
        return True, ""
        
    except json.JSONDecodeError as e:
        return False, f"JSON parse error: {str(e)}"
    except Exception as e:
        return False, f"Error reading file: {str(e)}"


def main():
    """Main function to check all JSON files and generate report."""
    
    # Results storage
    total_files = 0
    passed_files = []
    failed_files = []
    
    # Check each combination of language and placeId
    for lang in LANGUAGES:
        for place_id in PLACE_IDS:
            # Construct file path
            file_path = Path(BASE_PATH) / lang / "descriptions" / f"{place_id}.json"
            total_files += 1
            
            # Check the file
            is_valid, error_msg = check_json_file(file_path)
            
            if is_valid:
                passed_files.append(str(file_path))
            else:
                failed_files.append({
                    "path": str(file_path),
                    "error": error_msg
                })
    
    # Generate report
    print("=" * 80)
    print("JSON SYNTAX VALIDATION REPORT")
    print("=" * 80)
    print(f"\nTotal files to check: {total_files}")
    print(f"Files checked: {len(passed_files) + len(failed_files)}")
    print(f"Passed: {len(passed_files)}")
    print(f"Failed: {len(failed_files)}")
    
    if failed_files:
        print("\n" + "=" * 80)
        print("FAILED FILES:")
        print("=" * 80)
        
        # Group failures by error type
        error_groups: Dict[str, List[str]] = {}
        for failure in failed_files:
            error_type = failure["error"]
            if error_type not in error_groups:
                error_groups[error_type] = []
            error_groups[error_type].append(failure["path"])
        
        # Print grouped errors
        for error_type, paths in error_groups.items():
            print(f"\n{error_type} ({len(paths)} files):")
            for path in sorted(paths):
                # Make path relative for readability
                rel_path = path.replace("/Users/troy/开发文档/Baliciaga/frontend/public/locales/", "")
                print(f"  - {rel_path}")
    
    if passed_files:
        print("\n" + "=" * 80)
        print("PASSED FILES:")
        print("=" * 80)
        print(f"\nAll {len(passed_files)} files passed JSON validation successfully.")
        
        if len(passed_files) <= 20:  # Only show individual files if not too many
            for path in sorted(passed_files):
                rel_path = path.replace("/Users/troy/开发文档/Baliciaga/frontend/public/locales/", "")
                print(f"  ✓ {rel_path}")
    
    # Summary statistics
    print("\n" + "=" * 80)
    print("SUMMARY BY LANGUAGE:")
    print("=" * 80)
    
    for lang in LANGUAGES:
        lang_passed = sum(1 for p in passed_files if f"/{lang}/" in p)
        lang_failed = sum(1 for f in failed_files if f"/{lang}/" in f["path"])
        total_lang = lang_passed + lang_failed
        
        if total_lang > 0:
            success_rate = (lang_passed / total_lang) * 100
            print(f"\n{lang.upper()}: {lang_passed}/{total_lang} passed ({success_rate:.1f}%)")
            if lang_failed > 0:
                print(f"  Failed: {lang_failed} files")


if __name__ == "__main__":
    main()