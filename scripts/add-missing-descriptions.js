import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const descriptions = {
  "ChIJA31WOU050i0ROZH_hS7ypXY": {
    name: "Cinta Pererenan",
    sections: {
      zh: [
        {
          title: "概念与氛围",
          body: "Cinta 位于 Pererenan 一个宁静的角落，拥有稻田景观，提供欧洲风格的宁静体验。这里的设计理念是'安静的欧洲角落'，将地中海的魅力带到了巴厘岛的热带环境中。室内外座位完美融合，让你可以选择在空调房间内用餐或在户外享受自然微风。"
        },
        {
          title: "菜单与招牌体验",
          body: "菜单反映了对巴厘岛和国际美食的现代诠释。招牌菜包括大虾意面、半只鸡、巴斯克芝士蛋糕和牛排配鸡蛋。厨房以其对新鲜食材的承诺和精心的摆盘而自豪，使每道菜都成为视觉和味觉的享受。咖啡选择也同样令人印象深刻，使其成为早餐和午餐的热门选择。"
        },
        {
          title: "结论",
          body: "Cinta Pererenan 是寻求宁静用餐体验的完美选择，远离 Canggu 更繁忙地区的喧嚣。凭借其稻田景观、欧洲风格的氛围和高品质的美食，它为那些重视氛围与美食同等重要的人提供了一个避难所。"
        }
      ],
      en: [
        {
          title: "Concept & Ambiance",
          body: "Cinta in Pererenan offers a European vibe in a peaceful corner with rice field views. The design philosophy embraces a 'quiet European corner' concept, bringing Mediterranean charm to Bali's tropical setting. The seamless blend of indoor and outdoor seating allows diners to choose between air-conditioned comfort or alfresco dining with natural breezes."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu reflects modern interpretations of both Balinese and international cuisine. Signature dishes include the Prawn Pasta, Half Chicken, Basque Cheesecake, and Steak N Eggs. The kitchen prides itself on fresh ingredients and careful plating, making each dish a visual and culinary delight. The coffee selection is equally impressive, making it a popular spot for breakfast and lunch."
        },
        {
          title: "Conclusion",
          body: "Cinta Pererenan stands out as a perfect choice for those seeking a tranquil dining experience away from the busier areas of Canggu. With its rice field views, European-style ambiance, and quality cuisine, it offers a retreat for diners who value atmosphere as much as good food."
        }
      ],
      ru: [
        {
          title: "Концепция и атмосфера",
          body: "Cinta в Переренане предлагает европейскую атмосферу в тихом уголке с видом на рисовые поля. Философия дизайна воплощает концепцию 'тихого европейского уголка', привнося средиземноморский шарм в тропическую обстановку Бали. Гармоничное сочетание внутренних и открытых зон позволяет гостям выбирать между комфортом кондиционированного помещения или обедом на свежем воздухе."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню отражает современную интерпретацию как балийской, так и международной кухни. Фирменные блюда включают пасту с креветками, половину курицы, баскский чизкейк и стейк с яйцами. Кухня гордится свежими ингредиентами и тщательной подачей, делая каждое блюдо визуальным и кулинарным наслаждением. Выбор кофе также впечатляет, что делает это место популярным для завтраков и обедов."
        },
        {
          title: "Заключение",
          body: "Cinta Pererenan выделяется как идеальный выбор для тех, кто ищет спокойный обеденный опыт вдали от более оживленных районов Чангу. С видом на рисовые поля, европейской атмосферой и качественной кухней, это место предлагает убежище для гостей, которые ценят атмосферу так же, как и хорошую еду."
        }
      ],
      ko: [
        {
          title: "컨셉과 분위기",
          body: "페레레난의 Cinta는 논 전망이 있는 평화로운 코너에서 유럽풍 분위기를 제공합니다. 디자인 철학은 '조용한 유럽 코너' 개념을 수용하여 발리의 열대 환경에 지중해의 매력을 가져옵니다. 실내외 좌석의 완벽한 조화로 에어컨이 있는 편안함과 자연 바람을 느끼며 식사하는 것 중 선택할 수 있습니다."
        },
        {
          title: "메뉴와 시그니처 경험",
          body: "메뉴는 발리와 국제 요리의 현대적 해석을 반영합니다. 시그니처 요리로는 새우 파스타, 하프 치킨, 바스크 치즈케이크, 스테이크 앤 에그가 있습니다. 주방은 신선한 재료와 정성스러운 플레이팅에 자부심을 갖고 있어 각 요리를 시각적이고 미식적인 즐거움으로 만듭니다. 커피 선택도 인상적이어서 아침과 점심 식사로 인기 있는 장소입니다."
        },
        {
          title: "결론",
          body: "Cinta Pererenan은 짱구의 번화한 지역에서 벗어나 평온한 식사 경험을 찾는 사람들에게 완벽한 선택입니다. 논 전망, 유럽 스타일의 분위기, 고품질 요리로 분위기를 음식만큼 중요하게 여기는 사람들에게 휴식처를 제공합니다."
        }
      ]
    }
  },
  // Add other 4 restaurants here...
};

// Function to add descriptions to all language files
function addDescriptions() {
  const languages = ['zh', 'en', 'ru', 'ko'];
  
  languages.forEach(lang => {
    const filePath = path.join(__dirname, '..', 'public', 'locales', lang, `descriptions.${lang}.json`);
    
    try {
      // Read existing file
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get max ID
      const maxId = Math.max(...Object.values(existingData).map(item => item.id || 0));
      let nextId = maxId + 1;
      
      // Add new descriptions
      let addedCount = 0;
      Object.entries(descriptions).forEach(([placeId, data]) => {
        if (!existingData[placeId]) {
          existingData[placeId] = {
            id: nextId++,
            name: data.name,
            sections: data.sections[lang]
          };
          addedCount++;
          console.log(`Added ${data.name} to ${lang} descriptions`);
        }
      });
      
      // Write back
      if (addedCount > 0) {
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
        console.log(`Updated ${lang} descriptions - added ${addedCount} restaurants\n`);
      }
      
    } catch (error) {
      console.error(`Error processing ${lang}:`, error.message);
    }
  });
}

// Show sample for now
console.log('Sample description structure for Cinta Pererenan:');
console.log(JSON.stringify(descriptions["ChIJA31WOU050i0ROZH_hS7ypXY"], null, 2));
console.log('\nThis script would add descriptions for all 5 restaurants to all language files.');