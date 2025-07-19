#!/usr/bin/env python3
import json

def manual_fix_file(filepath, sections_data):
    """Manually fix a file with known content"""
    clean_data = {
        "sections": sections_data
    }
    
    # Generate clean JSON
    clean_json = json.dumps(clean_data, ensure_ascii=False, indent=2)
    
    # Write back to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(clean_json)
    
    print(f"✓ Fixed {filepath}")

# Fix the two remaining files manually
print("Fixing remaining files manually...")

# File 1: ChIJk4MaNPo50i0R4vfuHDwZ_3U.json
file1 = "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJk4MaNPo50i0R4vfuHDwZ_3U.json"
sections1 = [
    {
        "title": "概念与氛围",
        "body": "LONGTIME 将自己定位为一个精心打造的"烹饪目的地"，其核心美学是"中世纪间谍的复古时尚感"。它旨在为顾客提供一种沉浸式的体验，仿佛进入了一个充满神秘、优雅和精致乐趣的世界。餐厅拥有双重空间：一个是藤蔓环绕的休闲露台，另一个则是戏剧性的、具有 Speakeasy 风格的私密室内用餐区。"
    },
    {
        "title": "菜单与招牌体验",
        "body": "菜单由师从名厨的 Chef Tyler Preston 主理，提供"突破界限的现代亚洲美食"。必点招牌包括：完美体现其融合精神的 奇趣布拉塔奶酪 (Curious Burrata) 配辣椒脆；以及令人难忘的、解构重组的干拌拉面 (Dry Ramen) 配豚骨肉汁。其充满创意的定制鸡尾酒也同样是体验的核心部分。"
    },
    {
        "title": "结论",
        "body": "LONGTIME 是一个以概念驱动的现代餐饮的典范。它将一个强大的、让人身临其境的主题，从"中世纪间谍"设计到前卫的美食和创意调酒，都执行得无可挑剔。对于寻求真正难忘用餐体验的挑剔食客来说，这里是 Berawa 一个必不可少的目的地。"
    }
]
manual_fix_file(file1, sections1)

# File 2: ChIJOwB4D8E50i0RnmcWbm5B1jI.json
file2 = "/Users/troy/开发文档/Baliciaga/frontend/public/locales/zh/descriptions/ChIJOwB4D8E50i0RnmcWbm5B1jI.json"
sections2 = [
    {
        "title": "概念与氛围",
        "body": "The Shady Fox 是一家"秘密鸡尾酒会客厅"，致力于为客人打造沉浸式的 Speakeasy 体验。它的主题极富戏剧性，旨在将顾客带到"1930年代的伦敦"。进入酒吧需要通过 Instagram 私信获取密码，这个仪式感本身就是体验的核心部分，营造出一种独特的专属感和神秘感。"
    },
    {
        "title": "菜单与招牌体验",
        "body": "酒吧的核心是高品质的手工鸡尾酒，酒单包括了复杂的"桶陈鸡尾酒"。然而，这里最具决定性的体验，是将卓越的鸡尾酒与 现场音乐 相结合。与DJ主导的场所不同，这里的周六晚上有著名的 Blues Mate 乐队驻场，其他夜晚则有现场爵士乐队，营造出一种经典而深情的灵魂氛围。"
    },
    {
        "title": "结论",
        "body": "The Shady Fox 是一家在概念、执行和氛围上都堪称典范的"隐藏宝石"。通过密码保护的进入方式、精致的鸡尾酒，以及最关键的——对深情现场蓝调和爵士乐的坚持，它成功地为顾客提供了一个真正独特、精致和难忘的戏剧化夜晚。"
    }
]
manual_fix_file(file2, sections2)

# Verify all files
print("\n🔍 Final verification of all 9 files...")
all_files = [
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

all_valid = True
for filepath in all_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"  ✓ {filepath.split('/')[-1]} - Valid JSON")
    except json.JSONDecodeError as e:
        print(f"  ✗ {filepath.split('/')[-1]} - Still invalid: {e}")
        all_valid = False

if all_valid:
    print("\n🎉 All 9 files are now valid JSON!")
else:
    print("\n⚠️  Some files still have issues")