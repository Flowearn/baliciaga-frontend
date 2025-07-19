#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to update Black Sand Brewery content in all bar files
"""
import json
import os

def update_black_sand_brewery():
    """Update Black Sand Brewery content in all language bar files"""
    
    # Define the content for each language
    content_updates = {
        'zh': [
            {
                "title": "概念与氛围",
                "body": "Black Sand Brewery 是巴厘岛精酿啤酒界的先驱，被誉为岛上\"第一家拥有分享式美食概念的精酿啤酒厂\"。它源于一个充满热情的后院项目，如今已发展为一个充满活力的社区中心。其独特的魅力在于，它将工业风的酿酒厂与可以俯瞰\"绝美稻田\"景色的啤酒花园完美地融合在了一起。"
            },
            {
                "title": "菜单与招牌体验",
                "body": "这里的招牌体验无疑是啤酒本身。酒厂致力于酿造\"未经过滤、未经巴氏消毒\"的纯粹精酿。核心酒单涵盖了从旗舰款的 IPA 到大众欢迎的 **KÖLSCH（科隆啤酒）**和充满热带风情的 PINEAPPLE SOUR（菠萝酸啤）。为了搭配啤酒，餐厅提供了一个不拘一格的分享式美食菜单，从 Tacos 到 Pizza，应有尽有。"
            },
            {
                "title": "结论",
                "body": "Black Sand Brewery 已成为巴厘岛精酿啤酒界当之无愧的基石。它成功地将一个全球文化趋势转化为一个独特的巴厘岛机构，将高品质的精酿啤酒、美丽的稻田景色和强大的社区感完美结合，使其成为啤酒爱好者和美食家们必访的目的地。"
            }
        ],
        'en': [
            {
                "title": "Concept & Ambiance",
                "body": "Black Sand Brewery is a pioneer in Bali's craft beer scene, lauded as the island's \"first craft brewery with a sharing food concept.\" It grew from a passionate backyard project into a vibrant community hub. Its unique charm lies in perfectly blending an industrial brewery with a beer garden that overlooks stunning \"rice fields\" views."
            },
            {
                "title": "Menu & Signature Experience",
                "body": "The signature experience here is, unequivocally, the beer itself. The brewery is committed to pure, \"unfiltered, unpasteurized\" craft brews. The core tap list ranges from their flagship IPA to the crowd-pleasing KÖLSCH and the tropical PINEAPPLE SOUR. To complement the beer, they offer an eclectic, shareable food menu ranging from Tacos to Pizza."
            },
            {
                "title": "Conclusion",
                "body": "Black Sand Brewery is a definitive cornerstone of Bali's craft beer scene. It has successfully translated a global cultural trend into a uniquely Balinese institution, masterfully combining high-quality craft beer, a beautiful rice paddy setting, and a strong sense of community, making it a must-visit destination for beer aficionados and food lovers alike."
            }
        ],
        'ru': [
            {
                "title": "Концепция и атмосфера",
                "body": "Black Sand Brewery — пионер на крафтовой пивной сцене Бали, известный как «первая на острове крафтовая пивоварня с концепцией еды для компаний». Он вырос из страстного проекта на заднем дворе в оживленный общественный центр. Его уникальное очарование заключается в идеальном сочетании промышленной пивоварни с пивным садом, откуда открывается потрясающий вид на «рисовые поля»."
            },
            {
                "title": "Меню и знаковые впечатления",
                "body": "Фирменный опыт здесь — это, несомненно, само пиво. Пивоварня привержена чистому, «нефильтрованному, непастеризованному» крафтовому пиву. Основной ассортимент включает в себя от флагманского IPA до популярного KÖLSCH и тропического PINEAPPLE SOUR. В дополнение к пиву предлагается эклектичное меню еды для компаний, от тако (Tacos) до пиццы (Pizza)."
            },
            {
                "title": "Заключение",
                "body": "Black Sand Brewery — это безусловный краеугольный камень крафтовой пивной сцены Бали. Он успешно превратил мировой культурный тренд в уникальное балийское заведение, мастерски сочетая высококачественное крафтовое пиво, прекрасные виды на рисовые поля и сильное чувство общности, что делает его обязательным для посещения местом как для ценителей пива, так и для гурманов."
            }
        ],
        'ko': [
            {
                "title": "컨셉과 분위기",
                "body": "블랙 샌드 브루어리(Black Sand Brewery)는 발리 크래프트 비어 씬의 선구자로, 섬의 '셰어링 푸드 컨셉을 가진 최초의 크래프트 브루어리'로 칭송받습니다. 뒷마당의 열정적인 프로젝트에서 시작하여 활기찬 커뮤니티 허브로 성장했습니다. 독특한 매력은 산업적인 양조장과 멋진 '논' 전망을 자랑하는 비어 가든을 완벽하게 결합한 데 있습니다."
            },
            {
                "title": "메뉴와 시그니처 경험",
                "body": "이곳의 시그니처 경험은 단연코 맥주 그 자체입니다. 양조장은 '여과되지 않고 저온 살균되지 않은' 순수한 크래프트 맥주에 전념합니다. 핵심 탭 리스트는 대표적인 IPA부터 대중적인 쾰쉬(KÖLSCH), 그리고 열대과일 풍미의 **파인애플 사워(PINEAPPLE SOUR)**까지 다양합니다. 맥주와 어울리도록 **타코(Tacos)**부터 **피자(Pizza)**까지 다양한 셰어링 푸드 메뉴를 제공합니다."
            },
            {
                "title": "결론",
                "body": "블랙 샌드 브루어리는 발리 크래프트 비어 씬의 확실한 초석입니다. 세계적인 문화 트렌드를 독특한 발리 스타일의 기관으로 성공적으로 변모시켰으며, 고품질의 크래프트 맥주, 아름다운 논 풍경, 그리고 강력한 커뮤니티 의식을 훌륭하게 결합하여 맥주 애호가와 미식가 모두에게 필수적인 방문지가 되었습니다."
            }
        ]
    }
    
    # Base path for bar files
    base_path = 'public/locales'
    
    # Process each language
    for lang, sections in content_updates.items():
        file_path = os.path.join(base_path, lang, f'bars.{lang}.json')
        
        print(f"\nProcessing {file_path}...")
        
        try:
            # Read the current file
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Find Black Sand Brewery entry
            updated = False
            for place_id, venue in data.items():
                if venue.get('name') == 'Black Sand Brewery':
                    print(f"  Found Black Sand Brewery with placeId: {place_id}")
                    print(f"  Current sections: {len(venue.get('sections', []))}")
                    
                    # Update the sections
                    venue['sections'] = sections
                    updated = True
                    print(f"  Updated with {len(sections)} sections")
                    break
            
            if updated:
                # Write the updated data back
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"  ✅ Successfully updated {file_path}")
            else:
                print(f"  ⚠️  Black Sand Brewery not found in {file_path}")
                
        except FileNotFoundError:
            print(f"  ❌ File not found: {file_path}")
        except json.JSONDecodeError as e:
            print(f"  ❌ JSON decode error in {file_path}: {e}")
        except Exception as e:
            print(f"  ❌ Error processing {file_path}: {e}")
    
    print("\n✨ Update process completed!")

if __name__ == "__main__":
    update_black_sand_brewery()