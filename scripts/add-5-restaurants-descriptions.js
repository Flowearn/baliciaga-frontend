const fs = require('fs');
const path = require('path');

// 5家餐厅的描述数据
const restaurantDescriptions = {
  // Cinta Pererenan
  "ChIJA31WOU050i0ROZH_hS7ypXY": {
    zh: {
      name: "Cinta Pererenan",
      sections: [
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
      ]
    },
    en: {
      name: "Cinta Pererenan",
      sections: [
        {
          title: "Concept & Ambiance",
          body: "Cinta in Pererenan offers a European vibe in a peaceful corner with rice field views. The design philosophy embraces a \"quiet European corner\" concept, bringing Mediterranean charm to Bali's tropical setting. The seamless blend of indoor and outdoor seating allows diners to choose between air-conditioned comfort or alfresco dining with natural breezes."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu reflects modern interpretations of both Balinese and international cuisine. Signature dishes include the Prawn Pasta, Half Chicken, Basque Cheesecake, and Steak N Eggs. The kitchen prides itself on fresh ingredients and careful plating, making each dish a visual and culinary delight. The coffee selection is equally impressive, making it a popular spot for breakfast and lunch."
        },
        {
          title: "Conclusion",
          body: "Cinta Pererenan stands out as a perfect choice for those seeking a tranquil dining experience away from the busier areas of Canggu. With its rice field views, European-style ambiance, and quality cuisine, it offers a retreat for diners who value atmosphere as much as good food."
        }
      ]
    },
    ru: {
      name: "Cinta Pererenan",
      sections: [
        {
          title: "Концепция и атмосфера",
          body: "Cinta в Переренане предлагает европейскую атмосферу в тихом уголке с видом на рисовые поля. Философия дизайна воплощает концепцию «тихого европейского уголка», привнося средиземноморский шарм в тропическую обстановку Бали. Гармоничное сочетание внутренних и открытых зон позволяет гостям выбирать между комфортом кондиционированного помещения или обедом на свежем воздухе."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню отражает современную интерпретацию как балийской, так и международной кухни. Фирменные блюда включают пасту с креветками, половину курицы, баскский чизкейк и стейк с яйцами. Кухня гордится свежими ингредиентами и тщательной подачей, делая каждое блюдо визуальным и кулинарным наслаждением. Выбор кофе также впечатляет, что делает это место популярным для завтраков и обедов."
        },
        {
          title: "Заключение",
          body: "Cinta Pererenan выделяется как идеальный выбор для тех, кто ищет спокойный обеденный опыт вдали от более оживленных районов Чангу. С видом на рисовые поля, европейской атмосферой и качественной кухней, это место предлагает убежище для гостей, которые ценят атмосферу так же, как и хорошую еду."
        }
      ]
    },
    ko: {
      name: "Cinta Pererenan",
      sections: [
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
  
  // HUT Bali
  "ChIJy1yJjCFH0i0REyjNQfSK0Vw": {
    zh: {
      name: "HUT Bali",
      sections: [
        {
          title: "概念与氛围",
          body: "HUT Bali 体现了"热带隐居处"的概念，茂密的绿植和自然材料营造出宁静的用餐环境。餐厅的设计融合了传统的巴厘岛建筑与现代舒适设施，为客人提供了一个远离日常喧嚣的避难所。开放式布局让自然光线充足，而策略性放置的风扇确保了舒适的用餐体验。"
        },
        {
          title: "菜单与招牌体验",
          body: "菜单展示了健康意识的美食，强调新鲜、本地采购的食材。招牌菜包括他们著名的沙拉碗、自制格兰诺拉麦片和各种素食选择。饮品菜单同样令人印象深刻，提供冷萃咖啡、康普茶和新鲜果汁。他们对健康饮食的承诺延伸到提供无麸质和纯素食选择。"
        },
        {
          title: "结论",
          body: "HUT Bali 成功地创造了一个将健康饮食与热带天堂氛围相结合的空间。对于寻求营养餐食而不妥协口味或氛围的健康意识食客来说，这是一个理想的目的地。宁静的环境使其成为悠闲早午餐或安静工作会议的完美场所。"
        }
      ]
    },
    en: {
      name: "HUT Bali",
      sections: [
        {
          title: "Concept & Ambiance",
          body: "HUT Bali embodies the concept of a \"tropical hideaway,\" with lush greenery and natural materials creating a serene dining environment. The restaurant's design blends traditional Balinese architecture with modern comfort, offering guests a retreat from the everyday hustle. The open-air layout allows for abundant natural light, while strategically placed fans ensure comfortable dining."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu showcases health-conscious cuisine with an emphasis on fresh, locally sourced ingredients. Signature offerings include their famous salad bowls, house-made granola, and various vegetarian options. The beverage menu is equally impressive, featuring cold brew coffee, kombucha, and fresh juices. Their commitment to healthy eating extends to gluten-free and vegan options."
        },
        {
          title: "Conclusion",
          body: "HUT Bali successfully creates a space that combines healthy eating with a tropical paradise atmosphere. It's an ideal destination for health-conscious diners seeking nutritious meals without compromising on taste or ambiance. The peaceful setting makes it perfect for leisurely brunches or quiet work sessions."
        }
      ]
    },
    ru: {
      name: "HUT Bali",
      sections: [
        {
          title: "Концепция и атмосфера",
          body: "HUT Bali воплощает концепцию «тропического убежища» с пышной зеленью и натуральными материалами, создающими безмятежную обеденную среду. Дизайн ресторана сочетает традиционную балийскую архитектуру с современным комфортом, предлагая гостям убежище от повседневной суеты. Открытая планировка обеспечивает обилие естественного света, а стратегически расположенные вентиляторы обеспечивают комфортное питание."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню демонстрирует здоровую кухню с акцентом на свежие, местные ингредиенты. Фирменные предложения включают их знаменитые салатные боулы, домашнюю гранолу и различные вегетарианские блюда. Меню напитков также впечатляет, включая колд брю кофе, комбучу и свежие соки. Их приверженность здоровому питанию распространяется на безглютеновые и веганские варианты."
        },
        {
          title: "Заключение",
          body: "HUT Bali успешно создает пространство, которое сочетает здоровое питание с атмосферой тропического рая. Это идеальное место для заботящихся о здоровье гостей, ищущих питательные блюда без компромиссов во вкусе или атмосфере. Спокойная обстановка делает его идеальным для неспешных бранчей или тихих рабочих встреч."
        }
      ]
    },
    ko: {
      name: "HUT Bali",
      sections: [
        {
          title: "컨셉과 분위기",
          body: "HUT Bali는 무성한 녹지와 자연 소재로 고요한 식사 환경을 조성하는 '열대 은신처' 개념을 구현합니다. 레스토랑의 디자인은 전통적인 발리 건축과 현대적 편안함을 조화시켜 일상의 번잡함에서 벗어난 휴식처를 제공합니다. 개방형 레이아웃은 풍부한 자연광을 허용하며, 전략적으로 배치된 팬들이 편안한 식사를 보장합니다."
        },
        {
          title: "메뉴와 시그니처 경험",
          body: "메뉴는 신선하고 현지에서 조달된 재료에 중점을 둔 건강 의식적인 요리를 선보입니다. 시그니처 메뉴로는 유명한 샐러드 볼, 수제 그래놀라, 다양한 채식 옵션이 있습니다. 음료 메뉴도 인상적이며, 콜드브루 커피, 콤부차, 신선한 주스를 제공합니다. 건강한 식사에 대한 그들의 헌신은 글루텐 프리와 비건 옵션으로 확장됩니다."
        },
        {
          title: "결론",
          body: "HUT Bali는 건강한 식사와 열대 낙원 분위기를 결합한 공간을 성공적으로 만들어냅니다. 맛이나 분위기를 타협하지 않고 영양가 있는 식사를 찾는 건강 의식적인 다이너들에게 이상적인 목적지입니다. 평화로운 환경은 여유로운 브런치나 조용한 작업 세션에 완벽합니다."
        }
      ]
    }
  },
  
  // Penny Lane
  "ChIJ7SHlDCg50i0RaM29YbEeVjg": {
    zh: {
      name: "Penny Lane",
      sections: [
        {
          title: "概念与氛围",
          body: "Penny Lane 将怀旧的英式酒吧魅力带到了巴厘岛，完整呈现了木质内饰、复古装饰和温馨的氛围。餐厅散发着真正的"家外之家"的感觉，昏暗的灯光、舒适的座位和经典的摇滚音乐营造出一种既熟悉又异国情调的氛围。"
        },
        {
          title: "菜单与招牌体验",
          body: "菜单是对经典英式酒吧美食的庆祝，包括炸鱼薯条、牧羊人派和丰盛的英式早餐。他们还提供令人印象深刻的精酿啤酒选择和经典鸡尾酒。周日烤肉特别受欢迎，吸引了渴望家乡风味的外籍人士和好奇的当地人。份量很大，价格合理。"
        },
        {
          title: "结论",
          body: "Penny Lane 成功地在热带巴厘岛再现了正宗的英式酒吧体验。对于想念家乡舒适美食的英国外籍人士或任何寻求丰盛、熟悉餐食的人来说，这是一个完美的场所。友好的服务和热情的氛围使其成为社交聚会和轻松晚餐的热门选择。"
        }
      ]
    },
    en: {
      name: "Penny Lane",
      sections: [
        {
          title: "Concept & Ambiance",
          body: "Penny Lane brings nostalgic British pub charm to Bali, complete with wooden interiors, vintage decorations, and a cozy atmosphere. The restaurant exudes a genuine \"home away from home\" feeling, with dim lighting, comfortable seating, and classic rock music creating an ambiance that's both familiar and exotic."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu is a celebration of classic British pub fare, featuring fish and chips, shepherd's pie, and hearty full English breakfasts. They also offer an impressive selection of craft beers and classic cocktails. The Sunday roast is particularly popular, drawing expats craving tastes of home and curious locals alike. Portions are generous and prices reasonable."
        },
        {
          title: "Conclusion",
          body: "Penny Lane successfully recreates an authentic British pub experience in tropical Bali. It's a perfect spot for British expats missing comfort food from home or anyone seeking hearty, familiar meals. The friendly service and welcoming atmosphere make it a popular choice for social gatherings and relaxed dinners."
        }
      ]
    },
    ru: {
      name: "Penny Lane",
      sections: [
        {
          title: "Концепция и атмосфера",
          body: "Penny Lane привносит ностальгический шарм британского паба на Бали с деревянными интерьерами, винтажными украшениями и уютной атмосферой. Ресторан излучает подлинное чувство «дома вдали от дома» с приглушенным освещением, удобными сиденьями и классической рок-музыкой, создающей атмосферу, которая одновременно знакома и экзотична."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню - это празднование классической британской пабной кухни, включая рыбу с картофелем фри, пастуший пирог и сытные полные английские завтраки. Они также предлагают впечатляющий выбор крафтового пива и классических коктейлей. Воскресное жаркое особенно популярно, привлекая экспатов, тоскующих по вкусам дома, и любопытных местных жителей. Порции щедрые, а цены разумные."
        },
        {
          title: "Заключение",
          body: "Penny Lane успешно воссоздает аутентичный опыт британского паба в тропическом Бали. Это идеальное место для британских экспатов, скучающих по домашней комфортной еде, или для всех, кто ищет сытные, знакомые блюда. Дружелюбный сервис и гостеприимная атмосфера делают его популярным выбором для социальных встреч и непринужденных ужинов."
        }
      ]
    },
    ko: {
      name: "Penny Lane",
      sections: [
        {
          title: "컨셉과 분위기",
          body: "Penny Lane은 나무 인테리어, 빈티지 장식, 아늑한 분위기로 완성된 향수 어린 영국 펍의 매력을 발리에 가져옵니다. 레스토랑은 은은한 조명, 편안한 좌석, 클래식 록 음악으로 친숙하면서도 이국적인 분위기를 만들어내며 진정한 '집 같은' 느낌을 발산합니다."
        },
        {
          title: "메뉴와 시그니처 경험",
          body: "메뉴는 피시 앤 칩스, 셰퍼드 파이, 푸짐한 풀 잉글리시 브렉퍼스트 등 클래식한 영국 펍 요리의 축제입니다. 또한 인상적인 수제 맥주와 클래식 칵테일 선택을 제공합니다. 일요일 로스트는 특히 인기가 있어 고향의 맛을 그리워하는 외국인들과 호기심 많은 현지인들을 끌어들입니다. 양은 넉넉하고 가격은 합리적입니다."
        },
        {
          title: "결론",
          body: "Penny Lane은 열대 발리에서 정통 영국 펍 경험을 성공적으로 재현합니다. 고향의 편안한 음식을 그리워하는 영국 거주자들이나 푸짐하고 친숙한 식사를 찾는 사람들에게 완벽한 장소입니다. 친절한 서비스와 따뜻한 분위기로 사교 모임과 편안한 저녁 식사에 인기 있는 선택입니다."
        }
      ]
    }
  },
  
  // YUME 夢 l Japanese Dining
  "ChIJcUP9ogJB0i0R6EkIXLpYpUA": {
    zh: {
      name: "YUME 夢 l Japanese Dining",
      sections: [
        {
          title: "概念与氛围",
          body: "YUME（日语中的"梦"）提供了一种高档的日式用餐体验，将传统的日本美学与现代巴厘岛风格相融合。餐厅采用简约设计、自然材料和精心策划的灯光，营造出宁静而精致的氛围。开放式寿司吧让客人可以观看熟练的厨师在工作。"
        },
        {
          title: "菜单与招牌体验",
          body: "菜单展示了正宗的日本料理，重点是新鲜的寿司和生鱼片。招牌菜包括主厨精选拼盘、和牛牛肉菜肴和创意卷。他们对品质的承诺体现在每日空运的鱼类和精心挑选的食材上。清酒选择非常出色，有知识渊博的员工指导搭配。"
        },
        {
          title: "结论",
          body: "YUME 夢成功地将正宗的日本用餐提升到符合其"梦幻"名称的水平。对于寻求优质日本料理和无可挑剔服务的挑剔食客来说，这是一个理想的目的地。虽然价格反映了高品质，但整体体验证明了这一投资的价值。"
        }
      ]
    },
    en: {
      name: "YUME 夢 l Japanese Dining",
      sections: [
        {
          title: "Concept & Ambiance",
          body: "YUME (meaning \"dream\" in Japanese) delivers an upscale Japanese dining experience that blends traditional Japanese aesthetics with contemporary Bali style. The restaurant features minimalist design, natural materials, and carefully curated lighting that creates a serene yet sophisticated atmosphere. The open sushi bar allows diners to watch skilled chefs at work."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu showcases authentic Japanese cuisine with a focus on fresh sushi and sashimi. Signature offerings include the chef's omakase selection, wagyu beef dishes, and creative rolls. Their commitment to quality is evident in the daily air-flown fish and carefully selected ingredients. The sake selection is exceptional, with knowledgeable staff to guide pairings."
        },
        {
          title: "Conclusion",
          body: "YUME 夢 successfully elevates authentic Japanese dining to a level that lives up to its \"dream\" name. It's an ideal destination for discerning diners seeking premium Japanese cuisine with impeccable service. While prices reflect the high quality, the overall experience justifies the investment."
        }
      ]
    },
    ru: {
      name: "YUME 夢 l Japanese Dining",
      sections: [
        {
          title: "Концепция и атмосфера",
          body: "YUME (что означает «мечта» по-японски) предлагает высококлассный японский обеденный опыт, сочетающий традиционную японскую эстетику с современным балийским стилем. Ресторан отличается минималистичным дизайном, натуральными материалами и тщательно подобранным освещением, создающим безмятежную, но изысканную атмосферу. Открытый суши-бар позволяет гостям наблюдать за работой искусных поваров."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню демонстрирует аутентичную японскую кухню с акцентом на свежие суши и сашими. Фирменные предложения включают омакасе от шеф-повара, блюда из говядины вагю и креативные роллы. Их приверженность качеству очевидна в ежедневно доставляемой по воздуху рыбе и тщательно отобранных ингредиентах. Выбор саке исключителен, с знающим персоналом для рекомендаций по сочетаниям."
        },
        {
          title: "Заключение",
          body: "YUME 夢 успешно поднимает аутентичную японскую кухню на уровень, соответствующий названию «мечта». Это идеальное место для взыскательных гурманов, ищущих премиальную японскую кухню с безупречным сервисом. Хотя цены отражают высокое качество, общий опыт оправдывает инвестиции."
        }
      ]
    },
    ko: {
      name: "YUME 夢 l Japanese Dining",
      sections: [
        {
          title: "컨셉과 분위기",
          body: "YUME(일본어로 '꿈'을 의미)는 전통적인 일본 미학과 현대적인 발리 스타일을 조화시킨 고급 일식 다이닝 경험을 제공합니다. 레스토랑은 미니멀한 디자인, 자연 소재, 신중하게 선별된 조명으로 고요하면서도 세련된 분위기를 만들어냅니다. 오픈 스시 바에서는 숙련된 셰프들의 작업을 관찰할 수 있습니다."
        },
        {
          title: "메뉴와 시그니처 경험",
          body: "메뉴는 신선한 스시와 사시미에 중점을 둔 정통 일본 요리를 선보입니다. 시그니처 메뉴로는 셰프의 오마카세 선택, 와규 요리, 창의적인 롤이 있습니다. 매일 공수되는 생선과 신중하게 선택된 재료에서 품질에 대한 그들의 헌신이 분명히 드러납니다. 사케 선택은 탁월하며, 지식이 풍부한 직원이 페어링을 안내합니다."
        },
        {
          title: "결론",
          body: "YUME 夢는 '꿈'이라는 이름에 걸맞은 수준으로 정통 일본 다이닝을 성공적으로 승격시킵니다. 흠잡을 데 없는 서비스와 함께 프리미엄 일본 요리를 찾는 안목 있는 다이너들에게 이상적인 목적지입니다. 가격은 높은 품질을 반영하지만, 전반적인 경험이 투자를 정당화합니다."
        }
      ]
    }
  },
  
  // YUMEI NOODLES BALI
  "ChIJzX54qGJH0i0RVq590YDmdVY": {
    zh: {
      name: "YUMEI NOODLES BALI",
      sections: [
        {
          title: "概念与氛围",
          body: "YUMEI NOODLES 将街头美食的活力带入了舒适的休闲环境。餐厅拥抱"现代亚洲面馆"的概念，明亮的内饰、开放式厨房和充满活力的氛围使其成为快速但令人满意的餐食的完美场所。装饰融合了传统亚洲元素与现代设计。"
        },
        {
          title: "菜单与招牌体验",
          body: "菜单专注于各种亚洲面条，从日式拉面到越南河粉和中式炒面。招牌菜包括浓郁的豚骨拉面、辣味噌面和各种饺子。他们以面条的新鲜度为荣 - 许多都是内部制作的。份量很大，价格实惠，使其成为预算有限的食客的热门选择。"
        },
        {
          title: "结论",
          body: "YUMEI NOODLES 在休闲环境中提供正宗的亚洲面条体验。快速的服务、合理的价格和令人满意的份量使其成为寻求舒适亚洲美食而不需要高档用餐体验的任何人的可靠选择。这证明了简单的概念如果执行得好可以取得卓越的成果。"
        }
      ]
    },
    en: {
      name: "YUMEI NOODLES BALI",
      sections: [
        {
          title: "Concept & Ambiance",
          body: "YUMEI NOODLES brings street food energy into a comfortable casual dining setting. The restaurant embraces a \"modern Asian noodle house\" concept with bright interiors, open kitchen views, and energetic atmosphere that makes it perfect for quick yet satisfying meals. The decor blends traditional Asian elements with contemporary design."
        },
        {
          title: "Menu & Signature Experience",
          body: "The menu specializes in various Asian noodles, from Japanese ramen to Vietnamese pho and Chinese stir-fried noodles. Signature dishes include rich tonkotsu ramen, spicy miso noodles, and various dumpling options. They pride themselves on noodle freshness - many are made in-house. Portions are generous and prices affordable, making it popular with budget-conscious diners."
        },
        {
          title: "Conclusion",
          body: "YUMEI NOODLES delivers authentic Asian noodle experiences in a casual setting. The quick service, reasonable prices, and satisfying portions make it a reliable choice for anyone craving comforting Asian cuisine without the need for an upscale dining experience. It's proof that simple concepts executed well can excel."
        }
      ]
    },
    ru: {
      name: "YUMEI NOODLES BALI",
      sections: [
        {
          title: "Концепция и атмосфера",
          body: "YUMEI NOODLES привносит энергию уличной еды в комфортную обстановку повседневного ресторана. Ресторан воплощает концепцию «современного азиатского лапшичного дома» с яркими интерьерами, видом на открытую кухню и энергичной атмосферой, что делает его идеальным для быстрых, но сытных блюд. Декор сочетает традиционные азиатские элементы с современным дизайном."
        },
        {
          title: "Меню и знаковые впечатления",
          body: "Меню специализируется на различной азиатской лапше, от японского рамена до вьетнамского фо и китайской жареной лапши. Фирменные блюда включают насыщенный тонкоцу рамен, острую мисо-лапшу и различные варианты пельменей. Они гордятся свежестью лапши - многие виды делаются на месте. Порции щедрые, а цены доступные, что делает заведение популярным среди экономных гостей."
        },
        {
          title: "Заключение",
          body: "YUMEI NOODLES предлагает аутентичные азиатские блюда из лапши в непринужденной обстановке. Быстрое обслуживание, разумные цены и сытные порции делают его надежным выбором для всех, кто жаждет комфортной азиатской кухни без необходимости в высококлассном обеденном опыте. Это доказательство того, что простые концепции при хорошем исполнении могут достичь совершенства."
        }
      ]
    },
    ko: {
      name: "YUMEI NOODLES BALI",
      sections: [
        {
          title: "컨셉과 분위기",
          body: "YUMEI NOODLES는 길거리 음식의 에너지를 편안한 캐주얼 다이닝 환경으로 가져옵니다. 레스토랑은 밝은 인테리어, 오픈 키친 뷰, 활기찬 분위기로 '현대적인 아시아 누들 하우스' 개념을 수용하여 빠르면서도 만족스러운 식사에 완벽합니다. 장식은 전통적인 아시아 요소와 현대적인 디자인을 조화시킵니다."
        },
        {
          title: "메뉴와 시그니처 경험",
          body: "메뉴는 일본 라멘부터 베트남 쌀국수, 중국식 볶음면까지 다양한 아시아 면 요리를 전문으로 합니다. 시그니처 요리로는 진한 돈코츠 라멘, 매운 미소 면, 다양한 만두 옵션이 있습니다. 많은 면이 매장에서 직접 만들어지는 신선함에 자부심을 갖고 있습니다. 양은 넉넉하고 가격은 저렴하여 예산을 고려하는 다이너들에게 인기가 있습니다."
        },
        {
          title: "결론",
          body: "YUMEI NOODLES는 캐주얼한 환경에서 정통 아시아 누들 경험을 제공합니다. 빠른 서비스, 합리적인 가격, 만족스러운 양은 고급 다이닝 경험 없이도 편안한 아시아 요리를 갈망하는 사람들에게 신뢰할 수 있는 선택이 됩니다. 잘 실행된 단순한 컨셉이 탁월할 수 있다는 증거입니다."
        }
      ]
    }
  }
};

// 更新所有语言文件
const languages = ['zh', 'en', 'ru', 'ko'];

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'public', 'locales', lang, `descriptions.${lang}.json`);
  
  // 读取现有文件
  let existingData = {};
  try {
    existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return;
  }
  
  // 添加新的餐厅描述
  let addedCount = 0;
  Object.entries(restaurantDescriptions).forEach(([placeId, descriptions]) => {
    if (!existingData[placeId] && descriptions[lang]) {
      // 计算下一个ID
      const maxId = Math.max(...Object.values(existingData).map(item => item.id || 0));
      
      existingData[placeId] = {
        id: maxId + addedCount + 1,
        name: descriptions[lang].name,
        sections: descriptions[lang].sections
      };
      addedCount++;
      console.log(`Added ${descriptions[lang].name} to ${lang} descriptions`);
    }
  });
  
  // 写回文件
  if (addedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    console.log(`Updated ${filePath} - added ${addedCount} restaurants\n`);
  } else {
    console.log(`No updates needed for ${filePath}\n`);
  }
});

console.log('✅ All description files have been updated!');