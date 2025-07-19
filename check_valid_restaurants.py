#!/usr/bin/env python3
import json
import os
import re

def detect_language(text):
    """检测文本的主要语言"""
    text = text.replace('"title"', '').replace('"body"', '').replace('"sections"', '')
    
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    cyrillic_chars = len(re.findall(r'[а-яёА-ЯЁ]', text))
    korean_chars = len(re.findall(r'[\uac00-\ud7af]', text))
    english_chars = len(re.findall(r'[a-zA-Z]', text))
    
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
    elif english_chars > 50:
        return "english"
    else:
        return "mixed"

def main():
    # 1. 读取后端数据获取所有有效的Place ID
    try:
        with open('/Users/troy/开发文档/Baliciaga/backend/scripts/cafes-dev.json', 'r', encoding='utf-8') as f:
            cafes_data = json.load(f)
    except Exception as e:
        print(f"Error reading backend data: {e}")
        return

    valid_place_ids = set()
    place_id_to_name = {}
    
    for cafe in cafes_data:
        if 'placeId' in cafe and 'name' in cafe:
            place_id = cafe['placeId']
            valid_place_ids.add(place_id)
            place_id_to_name[place_id] = cafe['name']
    
    print(f"后端系统中共有 {len(valid_place_ids)} 个有效餐厅")
    print()
    
    # 2. 检查中文描述文件目录
    zh_desc_path = "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions"
    zh_files = [f for f in os.listdir(zh_desc_path) if f.endswith('.json')]
    
    print("检查中文描述文件:")
    print("=" * 80)
    
    valid_issues = []
    invalid_files = []
    valid_chinese = []
    
    for filename in zh_files:
        place_id = filename.replace('.json', '')
        
        # 跳过明显的测试文件
        if place_id in ['1', 'test-markdown']:
            continue
            
        if place_id not in valid_place_ids:
            invalid_files.append((filename, place_id))
            continue
            
        # 这是有效的餐厅，检查语言
        restaurant_name = place_id_to_name[place_id]
        file_path = os.path.join(zh_desc_path, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            text_content = ""
            if 'sections' in data:
                for section in data['sections']:
                    if 'title' in section:
                        text_content += section['title'] + " "
                    if 'body' in section:
                        text_content += section['body'] + " "
            
            detected_lang = detect_language(text_content)
            
            if detected_lang == "chinese":
                valid_chinese.append((restaurant_name, place_id))
                print(f"✅ {restaurant_name}")
            else:
                valid_issues.append((restaurant_name, place_id, detected_lang))
                print(f"❌ {restaurant_name} - 检测到 {detected_lang} 而非中文")
                
        except Exception as e:
            print(f"⚠️  {restaurant_name} - 文件读取错误: {e}")
    
    print()
    print("=" * 80)
    print("汇总:")
    print(f"✅ 正确的中文描述: {len(valid_chinese)} 个")
    print(f"❌ 需要修复的有效餐厅: {len(valid_issues)} 个")
    print(f"🗑️  无效文件（后端不存在）: {len(invalid_files)} 个")
    
    if valid_issues:
        print(f"\n需要修复中文描述的有效餐厅 ({len(valid_issues)} 个):")
        for i, (name, place_id, detected) in enumerate(valid_issues, 1):
            print(f"{i:2d}. {name} (当前: {detected})")
    
    if invalid_files:
        print(f"\n建议删除的无效文件 ({len(invalid_files)} 个):")
        for filename, place_id in invalid_files:
            print(f"   {filename}")

if __name__ == "__main__":
    main()