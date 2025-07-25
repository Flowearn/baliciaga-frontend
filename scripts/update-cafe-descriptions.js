import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current descriptions file
const descriptionsPath = path.join(__dirname, '../public/locales/en/descriptions.en.json');
const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

// Cafe descriptions to add
const cafeUpdates = {
  // Lusa By/Suka - Update existing one
  "ChIJKZFJhk9H0i0RC70PU8Q0O-Y": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "Lusa is a \"cafe & restaurant concept by Suka Espresso,\" a popular and well-regarded brand in Bali. Its concept is built on all-day versatility, serving \"Australian style breakfast\" and specialty coffee by day before transforming to serve \"housemade pasta and a range of steaks and roasts\" as the sun sets. The ambience is \"industrial-chic,\" creating a space that is \"both inspiring and welcoming\". It's a spacious, two-floor venue that has become a favorite for digital nomads, who appreciate the \"ample power outlets and fast Wi-Fi\" in a \"chic yet cozy\" environment."
      },
      {
        title: "Menu & Signature Experience",
        body: "The signature experience at Lusa is its seamless transition from a productive daytime cafe to a vibrant evening restaurant. The day menu features \"freshly brewed specialty coffee, cakes & pastries,\" while the evening brings \"housemade pasta\" like the popular Beef Ragu Pappardelle and mains such as a \"180g New Zealand grass fed beef tenderloin\". The vibe is further enhanced by \"live music four nights a week,\" making it the \"perfect way to spend a balmy evening in Bali\"."
      },
      {
        title: "Conclusion",
        body: "Lusa By/Suka is a smart and successful brand evolution, leveraging the reputation of Suka Espresso to create a dynamic, all-day destination. It perfectly caters to the modern Canggu lifestyle, offering a \"perfect blend of work and leisure\" where one can transition from a focused work session to a relaxed dinner with cocktails and live music, all within the same stylish space."
      }
    ]
  },
  // Neighbourhood Food
  "ChIJq_svKGxH0i0RU-zAhMppq8Y": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "Neighbourhood Food is a \"local eatery and coffee shop\" with a clear and authentic mission: \"serving wholesome, fresh no fuss food using highest quality local ingredients\". The concept is built on a philosophy of simplicity and community, aiming to \"support our local growers, and artisans\". The ambience is described as a \"hidden gem with a cozy, community-focused vibe\". Its Seseh location is noted as being smaller and more \"cosy,\" with a \"calm and peaceful\" setting perfect for a relaxing meal."
      },
      {
        title: "Menu & Signature Experience",
        body: "The menu is a direct reflection of the brand's ethos—\"fresh and simple, a reflection of the way we like to eat, wholesome and healthy\". The signature experience comes from their creative and exceptionally well-executed brunch staples. The \"Eggs Benedict with a hash stack\" is a standout dish that one reviewer had \"not seen anywhere, in the world,\" describing it as \"so incredibly tasty you want to lick up every sauce\". Other dishes like the shakshuka and smashed avo toast are praised for being \"fresh, flavorful, and beautifully presented\"."
      },
      {
        title: "Conclusion",
        body: "Neighbourhood Food offers a refreshing and sincere dining experience grounded in a \"no fuss\" philosophy and a genuine commitment to the local community. Its strength lies in its simplicity and the high quality of its ingredients, resulting in creative, wholesome dishes that have earned it a loyal following. It is a true \"hidden gem\" for those who appreciate thoughtful, well-crafted food."
      }
    ]
  },
  // Hungry Bird Coffee Roaster
  "ChIJa2bVbaxcBAURDMj_jEzGDqI": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "Hungry Bird is a \"haven for coffee aficionados,\" a dedicated \"specialty coffee roaster\" where the craft of coffee is the central focus. The concept is to provide a pure and exceptional coffee experience, sourcing and roasting beans on-site. The ambience is a \"relaxed, airy space\" with a \"friendly\" and inviting atmosphere that offers a \"perfect blend of comfort and style\". The on-site roastery is a key feature, allowing patrons to feel fully immersed in the coffee-making process."
      },
      {
        title: "Menu & Signature Experience",
        body: "The signature experience is undoubtedly the coffee. Hungry Bird is renowned for its \"commitment to quality,\" offering an extensive menu of \"Indonesian and... overseas single origins\". Reviewers describe tasting notes with precision, from a Balinese Kintamani with \"super creamy sweetness and a predominant berry flavour\" to a Sumatran natural that was \"juicy and sweet with notes of clementine and pineapple\". While they serve a \"delightful fusion of local and international flavors,\" including a comforting nasi goreng and a \"Monster Breakfast,\" the story of Hungry Bird is told in the cup."
      },
      {
        title: "Conclusion",
        body: "Hungry Bird is a coffee purist's sanctuary. It is an authentic roastery that prioritizes the quality and craft of coffee above all else, earning it a championship-winning reputation. For those who are passionate about coffee, it offers an unparalleled opportunity to explore a wide range of single-origin beans brewed with expertise in a relaxed, genuine atmosphere."
      }
    ]
  },
  // Secret Spot Canggu
  "ChIJmZf0Vlc50i0RR3Z4gOnFmUM": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "Secret Spot is a \"popular 'hipster surf style cafe'\" and a \"hidden gem\" whose concept is built around a fully \"plant-based, gluten-free menu\". It aims to be a \"cozy and charming atmosphere, perfect for unwinding or working\". The ambience is a \"laid-back vibe\" with a \"beautiful, minimalistic design\" and a \"chilled island vibe\". It's a comfortable space with \"ample comfy seats, good ac, [and] plugs,\" making it a favorite for remote work."
      },
      {
        title: "Menu & Signature Experience",
        body: "The menu is entirely vegan, and it excels at making plant-based food that is creative and delicious. One reviewer was \"genuinely surprised that vegan food could taste this good!\". The signature experience is indulging in their surprisingly hearty and flavorful dishes. The \"Italian sourdough sandwiches are spectacular,\" and the \"vegan pizzas (the spicy pumpkin is soooo moreish...)\" receive high praise. Other standout dishes include \"The tofu scramble,\" which is a highlight, as well as pumpkin ravioli and falafel bliss bowls."
      },
      {
        title: "Conclusion",
        body: "Secret Spot successfully demystifies vegan dining by offering a menu of spectacular plant-based comfort food in a \"chilled island vibe\" setting. It has become a go-to destination for both dedicated vegans and the curious, proving that a menu free from animal products can be incredibly satisfying, flavorful, and \"soooo moreish.\""
      }
    ]
  },
  // HOME CAFE CANGGU
  "ChIJSzQz6CQ50i0RalL4caNfcSI": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "HOME CAFE is built on a \"visionary concept\" that blends \"biochemistry and nutrition knowledge\" to create what it calls the \"healthiest eatery in Bali\". The core of its brand is a commitment to clean eating—being completely \"MSG and palm oil free\"—and creating a welcoming space for families. The ambience is described as \"cozy and beautiful\" with a \"homey tropical vibe\". The Canggu location is particularly noted for being \"super kids friendly,\" featuring a \"spacious play area, complete with toys, clean, [and] well maintained\"."
      },
      {
        title: "Menu & Signature Experience",
        body: "The menu is \"healthy and beautiful,\" using only \"top-end Australian virgin olive oil for cooking\" and vegetables \"grown on Bali soil\". There are \"plentiful Vegan and Keto-friendly choices,\" and all dishes are made with \"fresh ingredients\". The signature experience is the peace of mind that comes from eating food that is both delicious and trustworthy, in an environment where children are genuinely welcomed and catered for."
      },
      {
        title: "Conclusion",
        body: "HOME CAFE has carved out a unique niche by combining a scientifically-backed approach to healthy eating with a genuinely family-friendly atmosphere. Its strict \"MSG and palm oil free\" policy offers a level of trust that is rare, while its dedicated kids' play areas make it an invaluable resource for families looking for a wholesome and stress-free dining experience."
      }
    ]
  },
  // HOME CAFE MENGWI
  "ChIJt38YXDo50i0RJlB3Oz0PDjg": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "HOME CAFE is built on a \"visionary concept\" that blends \"biochemistry and nutrition knowledge\" to create what it calls the \"healthiest eatery in Bali\". The core of its brand is a commitment to clean eating—being completely \"MSG and palm oil free\"—and creating a welcoming space for families. The ambience is described as \"cozy and beautiful\" with a \"homey tropical vibe\"."
      },
      {
        title: "Menu & Signature Experience",
        body: "The menu is \"healthy and beautiful,\" using only \"top-end Australian virgin olive oil for cooking\" and vegetables \"grown on Bali soil\". There are \"plentiful Vegan and Keto-friendly choices,\" and all dishes are made with \"fresh ingredients\". The signature experience is the peace of mind that comes from eating food that is both delicious and trustworthy."
      },
      {
        title: "Conclusion",
        body: "HOME CAFE has carved out a unique niche by combining a scientifically-backed approach to healthy eating with a genuinely family-friendly atmosphere. Its strict \"MSG and palm oil free\" policy offers a level of trust that is rare in the dining scene."
      }
    ]
  },
  // MIEL SPECIALTY COFFEE CANGGU
  "ChIJYXyNN5U50i0RmIUNsfH9tHw": {
    sections: [
      {
        title: "Concept & Ambience",
        body: "MIEL is a specialty coffee shop designed to be an aesthetic and functional space, making it a \"popular spot for coffee enthusiasts\" and an \"ideal choice\" for remote workers. The concept is to provide \"exceptional coffee quality\" in a setting that is \"extremely well designed\" and \"Instagrammable\". The ambience is defined by its \"chic white interiors, high ceilings, and abundance of potted plants,\" which create a \"fresh and relaxing\" atmosphere. It's consistently described as a \"lovely and cozy place\"."
      },
      {
        title: "Menu & Signature Experience",
        body: "The signature experience at MIEL is the combination of high-quality coffee and a beautiful environment. The coffee is \"exceptional,\" and the menu features a \"large selection of coffee drinks,\" including unique signatures like the \"Sunset Espresso or Dirty Matcha\". The food is also a key part of the experience, with \"delicious breakfast options\" like the avocado bread with poached eggs, which is noted as being \"very tasty and... prettily presented\"."
      },
      {
        title: "Conclusion",
        body: "MIEL is the epitome of the modern, aesthetic-driven cafe. It successfully merges form and function, offering a \"fresh and relaxing\" space that is perfect for both work and leisure. Its reputation is built on serving \"exceptional coffee\" and beautifully presented food, making it a beloved destination for those who appreciate both quality and style."
      }
    ]
  }
};

// Update the descriptions
Object.keys(cafeUpdates).forEach(placeId => {
  if (descriptions[placeId]) {
    descriptions[placeId].sections = cafeUpdates[placeId].sections;
    console.log(`Updated ${descriptions[placeId].name}`);
  } else {
    console.log(`Warning: Place ID ${placeId} not found in descriptions`);
  }
});

// Write the updated descriptions back to file
fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
console.log('\nDescriptions updated successfully!');