#!/usr/bin/env python3
import os
import json
import re

def detect_language(text):
    """检测文本的主要语言"""
    # 移除JSON结构词汇
    text = text.replace('"title"', '').replace('"body"', '').replace('"sections"', '')
    
    # 检测各种语言字符
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    cyrillic_chars = len(re.findall(r'[а-яёА-ЯЁ]', text))
    korean_chars = len(re.findall(r'[\uac00-\ud7af]', text))
    english_chars = len(re.findall(r'[a-zA-Z]', text))
    
    # 计算主要语言
    total_chars = chinese_chars + cyrillic_chars + korean_chars + english_chars
    if total_chars == 0:
        return "unknown"
    
    chinese_ratio = chinese_chars / total_chars
    cyrillic_ratio = cyrillic_chars / total_chars
    korean_ratio = korean_chars / total_chars
    
    if chinese_ratio > 0.3:
        return "chinese"
    elif cyrillic_ratio > 0.3:
        return "russian"
    elif korean_ratio > 0.3:
        return "korean"
    elif english_chars > 50:  # 足够的英文字符
        return "english"
    else:
        return "mixed"

def check_language_consistency():
    """检查所有描述文件的语言一致性"""
    base_path = "/Users/troy/开发文档/Baliciaga/frontend/public/locales"
    language_dirs = ["zh", "en", "ru", "ko"]
    expected_languages = {
        "zh": "chinese",
        "en": "english", 
        "ru": "russian",
        "ko": "korean"
    }
    
    issues = []
    total_files = 0
    
    for lang_code in language_dirs:
        lang_path = os.path.join(base_path, lang_code, "descriptions")
        if not os.path.exists(lang_path):
            continue
            
        files = [f for f in os.listdir(lang_path) if f.endswith('.json')]
        print(f"\n检查 {lang_code} 目录 ({len(files)} 个文件):")
        
        for filename in files:
            total_files += 1
            file_path = os.path.join(lang_path, filename)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # 提取所有文本内容
                text_content = ""
                if 'sections' in data:
                    for section in data['sections']:
                        if 'title' in section:
                            text_content += section['title'] + " "
                        if 'body' in section:
                            text_content += section['body'] + " "
                
                detected_lang = detect_language(text_content)
                expected_lang = expected_languages[lang_code]
                
                if detected_lang != expected_lang:
                    issue = f"  ❌ {filename}: 检测到 {detected_lang}, 期望 {expected_lang}"
                    issues.append((lang_code, filename, detected_lang, expected_lang))
                    print(issue)
                else:
                    print(f"  ✅ {filename}: {detected_lang}")
                    
            except Exception as e:
                error = f"  ⚠️  {filename}: 读取错误 - {str(e)}"
                issues.append((lang_code, filename, "error", expected_languages[lang_code]))
                print(error)
    
    print(f"\n总结:")
    print(f"总共检查了 {total_files} 个文件")
    print(f"发现 {len(issues)} 个语言配置问题")
    
    if issues:
        print(f"\n问题详情:")
        for lang_code, filename, detected, expected in issues:
            print(f"  {lang_code}/{filename}: {detected} → {expected}")
    
    return issues

if __name__ == "__main__":
    check_language_consistency()