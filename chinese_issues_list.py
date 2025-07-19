#!/usr/bin/env python3
import json
import os

# 有问题的中文文件列表（基于之前的扫描结果）
problematic_files = [
    "ChIJcfxIJo850i0RsrveoncQeBs.json",
    "ChIJ_XZL_xFH0i0RTo0EWBqsnRs.json", 
    "ChIJBWxfWhA50i0Rzb3CWOIu8tA.json",
    "ChIJD4eq-jFH0i0ROgK2DCf0uNw.json",
    "ChIJN5xTyos50i0RiGBQWrCPinA.json",
    "ChIJb-BRehhH0i0RUcIoZtXLtUM.json",
    "ChIJkYxdu3E50i0RrFJjPHk8LqI.json",
    "ChIJL3L-Sfc50i0RwlAVew5QCm8.json",  # 已修复
    "ChIJOwB4D8E50i0RnmcWbm5B1jI.json",
    "ChIJWVWpMoZH0i0RRFcupYVhVi4.json",
    "ChIJERK7FYRH0i0RKyvr-65RLZg.json",
    "ChIJ2SXWetNH0i0RwwbG9ftXrx4.json",
    "ChIJPZo4Unk40i0RxI_FwqiKsWQ.json",
    "ChIJC3RsyoJH0i0Rri-AJ8JF9Tg.json",
    "ChIJxZh1qu1H0i0R5BXWVSV1zK8.json",
    "ChIJYUi2MOI50i0RFUr3eL2-pBk.json",
    "ChIJV8j8ZXk40i0RQ_ByVyakQkc.json",
    "ChIJ0RSTlvJH0i0R1ozPGwVxSoU.json",
    "ChIJiQdg1YdH0i0R8ANUMzZizN0.json",
    "ChIJgfLsf1pF0i0RTDMRSpGD_Zs.json",
    "ChIJ5fhhx1I50i0RYv-9kVUcpbY.json",
    "ChIJXxe2rXNH0i0Rnt_qeoqnQcc.json",
    "ChIJwVQNUZU50i0RPESrmvSu12w.json",
    "ChIJg1ad-75H0i0R8aB_K9oKYj8.json",
    "ChIJ1TBOq6ZK0i0RnepUROoMqMo.json",
    "ChIJ9UCFSPE50i0RVVADcFGCGXI.json",
    "ChIJj0tR_mpH0i0RP5h_ieNuzAs.json",
    "ChIJYcKvqiJH0i0RtzWDiRmCnI0.json",
    "ChIJ32m9jCxH0i0RLBCGarQNwNc.json",
    "ChIJuWrhQgA50i0Ra0tVN4yy1Dk.json",
    "ChIJ5Wex6mc50i0RNSHWdVKVoPo.json",
    "ChIJk4MaNPo50i0R4vfuHDwZ_3U.json",
    "ChIJNzjyIBI50i0RpFdnd_ZN3pg.json",
    "ChIJe7KSn4dH0i0RsfzzpwFhwpQ.json",
    "ChIJk3IjCVU50i0RDCA0u-V4WAs.json",
    "ChIJcYpksxVH0i0RCDMFafUy5N4.json",
    "ChIJCdPou9hH0i0RgIY7umQ751U.json"
]

def get_restaurant_name_from_backend():
    """从后端数据获取餐厅名称"""
    try:
        with open('/Users/troy/开发文档/Baliciaga/backend/scripts/cafes-dev.json', 'r', encoding='utf-8') as f:
            cafes_data = json.load(f)
            
        place_id_to_name = {}
        for cafe in cafes_data:
            if 'placeId' in cafe and 'name' in cafe:
                place_id_to_name[cafe['placeId']] = cafe['name']
        
        return place_id_to_name
    except Exception as e:
        print(f"Error reading backend data: {e}")
        return {}

def main():
    place_id_to_name = get_restaurant_name_from_backend()
    
    print("需要修复中文描述的餐厅列表:")
    print("=" * 60)
    
    fixed_count = 0
    total_count = 0
    
    for filename in problematic_files:
        total_count += 1
        place_id = filename.replace('.json', '')
        restaurant_name = place_id_to_name.get(place_id, '未知餐厅')
        
        # 检查是否已修复（Milk & Madu已修复）
        if place_id == "ChIJL3L-Sfc50i0RwlAVew5QCm8":
            print(f"✅ {total_count:2d}. {restaurant_name} (已修复)")
            fixed_count += 1
        else:
            print(f"❌ {total_count:2d}. {restaurant_name}")
            print(f"    Place ID: {place_id}")
        print()
    
    print("=" * 60)
    print(f"总计: {total_count} 个餐厅")
    print(f"已修复: {fixed_count} 个")
    print(f"待修复: {total_count - fixed_count} 个")

if __name__ == "__main__":
    main()