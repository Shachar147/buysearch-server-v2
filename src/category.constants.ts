// 🧷 Flat constants (used across the backend)

// --- Category Enum ---
// 👕 Clothing - Tops
export enum Category {
  CLOTHING = "Clothing",

  // 👕 Clothing - Tops
  T_SHIRTS = "T-Shirts & Vests",
  TOPS = "Tops",
  SHIRTS = "Shirts",
  POLO_SHIRTS = "Polo Shirts",
  TANKS = "Tanks",
  SWEATERS = "Sweaters",
  CREW_NECK_SWEATERS = "Crew Neck Sweaters",
  KNITWEAR = "Knitwear",
  BODYSUITS = "Bodysuits",
  OVERSHIRTS = "Overshirts",

  // 👕 Clothing - Bottoms
  BOTTOMS = "Bottoms",
  JEANS = "Jeans",
  SKINNY_JEANS = "Skinny Jeans",
  SLIM_JEANS = "Slim Jeans",
  STRAIGHT_JEANS = "Straight Jeans",
  PANTS = "Pants",
  JOGGERS = "Joggers",
  TROUSERS = "Trousers",
  SHORTS = "Shorts",
  SKIRTS = "Skirts",
  MINI_SKIRTS = "Mini Skirts",
  MAXI_SKIRTS = "Maxi Skirts",
  SHORT_JEANS = "Short Jeans",

  // 👕 Clothing - Dresses, Outerwear, etc.
  DRESSES_OVERALLS = "Dresses & Overalls",
  DRESSES = "Dresses",
  MAXI_DRESSES = "Maxi Dresses",
  MINI_DRESSES = "Mini Dresses",
  OVERALLS = "Overalls",
  JACKETS_COATS = "Jackets & Coats",
  BLAZERS = "Blazers",
  OUTERWEAR = "Outerwear",
  SUITS = "Suits",
  SWIMWEAR = "Swimwear",
  BEACHWEAR = "Beachwear",
  BEACHWEAR_SWIMWEAR = "Beachwear & Swimwear",
  UNDERWEAR = "Underwear",
  BOXERS = "Boxers",
  SOCKS = "Socks",
  LINGERIE = "Lingerie & Nightwear",
  STRAPLESS = "Strapless",
  UNDERWEAR_LINGERIE = "Underwear & Lingerie",
  OVERSIZE = "Oversize",
  SPECIAL_FIT = "Special Fit",

  // 👟 Shoes
  SHOES = "Shoes",
  TRAINERS = "Trainers",
  SNICKERS = "Snickers",
  SNEAKERS = "Sneakers",
  BOOTS = "Boots",
  SANDALS = "Sandals",
  FLIP_FLOPS = "Flip Flops",
  SLIPPERS = "Slippers",
  ESPADRILLES = "Espadrilles Shoes",
  MOCCASINS = "Moccasin Shoes",
  ELEGANT_SHOES = "Elegant Shoes",
  OXFORD_SHOES = "Oxford Shoes",

  // 👜 Accessories
  ACCESSORIES = "Accessories",
  BAGS = "Bags",
  BACKPACKS = "Backpacks",
  LAPTOP_BAGS = "Laptop Bags",
  SIDE_BAGS = "Side Bags",
  TRAVEL_BAGS = "Travel Bags",
  POUCH_BAGS = "Pouch Bags",
  POUCHES = "Pouch bags",
  WALLETS = "Wallets",
  BELTS = "Belts",
  CARD_HOLDERS = "Card Holders",
  WALLETS_LEATHER = "Wallets & Leather",
  HATS = "Hats",
  BUCKET_HATS = "Bucket Hats",
  HEADWEAR = "Hats & Headwear",
  SUNGLASSES = "Sunglasses",
  EYEWEAR = "Eyewear",
  NECKLACES = "Necklaces",
  BRACELETS = "Bracelets",
  RINGS = "Rings",
  JEWELRY = "Jewelry",
  GLOVES = "Gloves",
  SCARVES = "Scarves",
  HANDKERCHIEFS = "Handkerchiefs",
  OTHER_ACCESSORIES = "Other",

  // 🏷️ Brands (used as filters)
  BY_BRAND = "By Brand",

  // 🏃 Sport
  RUNNING = "Running",
  SPORT = "Sport",

  // 🏠 Home & Wellness
  WELLNESS = "Wellness & Body",
  BEAUTY = "Beauty",
  PERFUMES = "Perfumes",
  HOME = "Home",
  HOME_WELLNESS = "Home & Wellness",

  // 🎁 Gifts
  GIFTS = "Gifts"
}

/**
 * Maps scraped/found category keywords (English or Hebrew) to one or more canonical Category enum values.
 * Used to normalize free-text or scraped categories to the internal enum(s).
 */
export const CATEGORY_NORMALIZATION_MAP: Record<string, Category[]> = {
  'caps': [Category.HATS],
  'כובעים': [Category.HATS],
  'כובע': [Category.HATS],
  "ג'קט": [Category.JACKETS_COATS],
  'hats': [Category.HATS],
  't-shirt': [Category.T_SHIRTS],
  't-shirts': [Category.T_SHIRTS],
  'tshirts': [Category.T_SHIRTS],
  'חולצות': [Category.SHIRTS],
  'shirts': [Category.SHIRTS],
  'pants': [Category.PANTS],
  'מכנסיים': [Category.PANTS],
  'dresses': [Category.DRESSES],
  'שמלות': [Category.DRESSES],
  'skirts': [Category.SKIRTS],
  'חצאיות': [Category.SKIRTS],
  'jackets': [Category.JACKETS_COATS],
  'coats': [Category.JACKETS_COATS],
  "ג'קטים": [Category.JACKETS_COATS],
  'אוברולים': [Category.OVERALLS],
  'overalls': [Category.OVERALLS],
  'bodysuit': [Category.BODYSUITS],
  'bodysuits': [Category.BODYSUITS],
  'בגד גוף': [Category.BODYSUITS],
  'בגדי גוף': [Category.BODYSUITS],
  'jewlery': [Category.JEWELRY],
  'תכשיטים': [Category.JEWELRY],
  'אביזרים': [Category.ACCESSORIES],
  'תיקים': [Category.ACCESSORIES, Category.BAGS],
  'תיק נסיעה': [Category.BAGS, Category.TRAVEL_BAGS],
  'תיקי נסיעה': [Category.ACCESSORIES, Category.BAGS, Category.TRAVEL_BAGS],
  'תיקי גב': [Category.ACCESSORIES, Category.BAGS, Category.BACKPACKS],
  'פאוץ׳': [Category.ACCESSORIES, Category.BAGS, Category.POUCHES],
  "תיקי פאוץ'": [Category.ACCESSORIES, Category.BAGS, Category.POUCHES],
  "סנדלים וכפכפים": [Category.SHOES, Category.SANDALS, Category.FLIP_FLOPS],
  "סניקרס": [Category.SHOES, Category.SNICKERS],
  "צ'אנקי סניקרס": [Category.SHOES, Category.SNICKERS],
  'תיק לפטופ': [Category.BAGS, Category.LAPTOP_BAGS],
  'תיק ללפטופ': [Category.BAGS, Category.LAPTOP_BAGS],
  'תיק למחשב נייד': [Category.BAGS, Category.LAPTOP_BAGS],
  'תיק למחשב-נייד': [Category.BAGS, Category.LAPTOP_BAGS],
  'תיקי לפטופ': [Category.BAGS, Category.LAPTOP_BAGS],
  'בגדים': [], // No direct mapping, could be [Category.CLOTHING_MAIN_CATEGORY] if exists
  'טי שרט שרוול ארוך': [Category.T_SHIRTS],
  'טי שרט שרוול קצר': [Category.T_SHIRTS],
  'נעליים': [Category.SHOES],
  "ג'ינסים": [Category.JEANS],
  "תיקי צד": [Category.BAGS, Category.SIDE_BAGS],
  "חגורה": [Category.ACCESSORIES, Category.BELTS],
  "חגורות": [Category.ACCESSORIES, Category.BELTS],
  'ארנק כרטיסים': [Category.ACCESSORIES, Category.WALLETS, Category.CARD_HOLDERS],
  'ארנקים': [Category.ACCESSORIES, Category.WALLETS],
  "פאוץ'": [Category.BAGS, Category.POUCHES],
  'pouch bags': [Category.BAGS, Category.POUCHES],
  'משקפי שמש': [Category.ACCESSORIES, Category.SUNGLASSES],
  'גרב': [Category.ACCESSORIES, Category.SOCKS],
  'גרביים': [Category.ACCESSORIES, Category.SOCKS],
  'צמידים': [Category.ACCESSORIES, Category.JEWELRY, Category.BRACELETS],
  'צמיד': [Category.ACCESSORIES, Category.JEWELRY, Category.BRACELETS],
  'tax free': [],
  'שרשרת': [Category.ACCESSORIES, Category.JEWELRY, Category.NECKLACES],
  'שרשראות': [Category.ACCESSORIES, Category.JEWELRY, Category.NECKLACES],
  'טבעות': [Category.ACCESSORIES, Category.JEWELRY, Category.RINGS],
  'בקבוקי ספורט': [Category.ACCESSORIES, Category.SPORT],
  'אביזרי ספורט': [Category.ACCESSORIES, Category.SPORT],
  'כפפות': [Category.ACCESSORIES, Category.GLOVES],
  'חליפות': [Category.SUITS],
  'גוף & וולנס': [Category.WELLNESS],
  'straight': [Category.JEANS, Category.STRAIGHT_JEANS],
  'skinny': [Category.JEANS, Category.SKINNY_JEANS],
  'slim': [Category.JEANS, Category.SLIM_JEANS],
  'נעליים אלגנטיות': [Category.SHOES, Category.ELEGANT_SHOES],
  'נעליים שטוחות': [Category.SHOES],
  'מגפי שרוכים': [Category.SHOES, Category.BOOTS],
  'בגדי ים': [Category.SWIMWEAR],
  'בגד ים': [Category.SWIMWEAR],
  "מגפי צ'לסי": [Category.SHOES, Category.BOOTS],
  'מוקסינים': [Category.SHOES, Category.MOCCASINS],
  'מוקסין': [Category.SHOES, Category.MOCCASINS],
  'כפכפים': [Category.FLIP_FLOPS],
  'סנדלים': [Category.SANDALS],
  'ספורט': [Category.SPORT],
  'גופיות': [Category.TANKS],
  'sleeveless': [Category.TANKS],
  'גופייה': [Category.TANKS],
  'גופיה': [Category.TANKS],
  'beauty': [Category.BEAUTY],
  'סריגים': [Category.KNITWEAR],
  'סריג רוכסן': [Category.KNITWEAR],
  'קרדיגן': [Category.KNITWEAR],
  'סווטשירטים': [Category.SWEATERS],
  'סווטשירט': [Category.SWEATERS],
  'סוודרים': [Category.SWEATERS],
  'סווטשירט crew': [Category.SWEATERS],
  'חולצות פולו': [Category.T_SHIRTS],
  'פולו שרוול קצר': [Category.T_SHIRTS],
  'polo t-shirts': [],
  'polo tshirts': [],
  'נעלי בית': [Category.SLIPPERS],
  'אביזרי נעליים': [Category.SHOES, Category.ACCESSORIES],
  'clothes': [],
  'חולצת פולו': [],
  'הלבשה תחתונה': [Category.LINGERIE],
  'מתנות': [Category.GIFTS],
  'טי שירט': [Category.T_SHIRTS],
  'מגפיים': [Category.SHOES, Category.BOOTS],
  'מגפיים אלגנטיות': [Category.SHOES, Category.BOOTS],
  'כפכפי אצבע': [Category.SHOES, Category.FLIP_FLOPS],
  'נעלי אוקספורד': [Category.SHOES, Category.OXFORD_SHOES],
  'בגדי ספורט': [Category.SPORT],
  'Phonebag': [Category.ACCESSORIES, Category.BAGS],
  'אספדרילים': [Category.SHOES, Category.ESPADRILLES],
  'אספדריל': [Category.SHOES, Category.ESPADRILLES],
  'בגד חוף': [Category.BEACHWEAR, Category.SWIMWEAR],
  'וסט': [Category.T_SHIRTS],
  'סטרפלס': [Category.STRAPLESS],
  'מטפחות': [Category.HANDKERCHIEFS],
  "טישירט": [Category.T_SHIRTS],
  "מכנסיים קצרים": [Category.PANTS, Category.SHORTS],
  'short jeans': [Category.SHORTS, Category.SHORT_JEANS],
  "אוברסייז": [Category.OVERSIZE],
  "Oversize": [Category.OVERSIZE],
  "סוודר": [Category.SWEATERS],
  "קרדיגנים": [],
  "בלייזר": [Category.BLAZERS],
  "בלייזרים": [Category.BLAZERS],
  'home': [Category.HOME],
  'pouch': [Category.POUCH_BAGS],
  'new era': [],
  'abercrombie and fitch': [],
  'חצאית': [Category.SKIRTS],
  'חצאית מיני': [Category.SKIRTS, Category.MINI_SKIRTS],
  'חצאית מקסי': [Category.SKIRTS, Category.MAXI_SKIRTS],
  'שמלה ארוכה': [Category.DRESSES, Category.MAXI_DRESSES],
  'שמלה קצרה': [Category.DRESSES, Category.MINI_DRESSES],
  'שמלה מקסי': [Category.DRESSES, Category.MAXI_DRESSES],
  'שמלה מיני': [Category.DRESSES, Category.MINI_DRESSES],
  'שמלת מיני': [Category.DRESSES, Category.MINI_DRESSES],
  'welness & body': [Category.WELLNESS],
};

// --- Category Synonyms Map ---
export type CategorySynonyms = {
  [K in Category]: { en: string[]; he: string[] }
};

export const CATEGORY_SEARCH_KEYWORDS_MAP: CategorySynonyms = {
  [Category.T_SHIRTS]: {
    en: ['t-shirt', 'tshirt', 'tee', 't shirt', 'tank top', 'vest'],
    he: ['טי שירט', 'טי-שירט', 'טישרט', 'חולצה', 'חולצות', 'טי שירטים', 'טי-שירטים']
  },
  [Category.TOPS]: {
    en: ['top', 'tops'],
    he: ['טופ', 'טופים']
  },
  [Category.SHIRTS]: {
    en: ['shirt', 'blouse', 'button down', 'button-up', 'dress shirt'],
    he: ['חולצה', 'חולצות', 'חולצה מכופתרת', 'חולצות מכופתרות', 'חולצה אלגנט', 'חולצות אלגנט']
  },
  [Category.TANKS]: {
    en: ['tank', 'tank top', 'tanktop'],
    he: ['גופיה', 'גופיות']
  },
  [Category.SWEATERS]: {
    en: ['sweater', 'sweaters', 'jumper', 'pull', 'pull-over', 'pullover'],
    he: ['סוודר', 'סוודרים']
  },
  [Category.CREW_NECK_SWEATERS]: {
    en: ['crew neck sweater', 'crewneck sweater', 'crew neck', 'crewneck'],
    he: []
  },
  [Category.KNITWEAR]: {
    en: ['knitwear', 'knit', 'knitted'],
    he: ['סריג', 'סריגים']
  },
  [Category.BODYSUITS]: {
    en: ['bodysuit', 'bodysuits'],
    he: ['בודי', 'בודיס', 'בודיסוט', 'בודיסוטים', 'בגד גוף', 'בגד-גוף', 'בגדי גוף','בגדי-גוף']
  },
  [Category.OVERSHIRTS]: {
    en: ['overshirt', 'overshirts'],
    he: []
  },
  [Category.BOTTOMS]: {
    en: ['bottom', 'bottoms'],
    he: []
  },
  [Category.JEANS]: {
    en: ['jeans', 'denim', 'pants', 'trousers'],
    he: ['ג׳ינס', 'גינס', 'ג׳ינסים', 'גינסים', 'דנים', 'מכנס ג׳ינס', 'מכנסי ג׳ינס']
  },
  [Category.SKINNY_JEANS]: {
    en: ['skinny jeans', 'skinny fit jeans'],
    he: ['סקיני', 'סקיני ג׳ינס', 'סקיני גינס']
  },
  [Category.SLIM_JEANS]: {
    en: ['slim jeans', 'slim fit jeans'],
    he: ['סלים', 'סלים ג׳ינס', 'סלים גינס']
  },
  [Category.STRAIGHT_JEANS]: {
    en: ['straight jeans', 'straight fit jeans'],
    he: ['סטרייט', 'סטרייט ג׳ינס', 'סטרייט גינס']
  },
  [Category.PANTS]: {
    en: ['pants', 'trousers', 'slacks'],
    he: ['מכנס', 'מכנסיים', 'מכנסי בד', 'מכנסי עבודה']
  },
  [Category.JOGGERS]: {
    en: ['jogger', 'joggers', 'sweatpants'],
    he: ['ג׳וגר', 'ג׳וגרים', 'ג׳וגרז', 'ג׳וגרזים', 'טרנינג', 'טרנינגים']
  },
  [Category.TROUSERS]: {
    en: ['trousers', 'pants'],
    he: ['מכנס', 'מכנסיים']
  },
  [Category.SHORTS]: {
    en: ['shorts', 'bermuda'],
    he: ['שורט', 'שורטים', 'ברמודה', 'ברמודות']
  },
  [Category.SKIRTS]: {
    en: ['skirt', 'skirts'],
    he: ['חצאית', 'חצאיות']
  },
  [Category.MINI_SKIRTS]: {
    en: ['mini skirt', 'mini skirts'],
    he: ['מיני חצאית', 'מיני חצאיות']
  },
  [Category.MAXI_SKIRTS]: {
    en: ['maxi skirt', 'maxi skirts'],
    he: ['מקסי חצאית', 'מקסי חצאיות']
  },
  [Category.SHORT_JEANS]: {
    en: ['short jeans', 'jean shorts', 'denim shorts'],
    he: ['שורט ג׳ינס', 'שורט גינס', 'שורטים ג׳ינס', 'שורטים גינס']
  },
  [Category.DRESSES_OVERALLS]: {
    en: ['dress', 'dresses', 'overall', 'overalls'],
    he: ['שמלה', 'שמלות', 'אוברול', 'אוברולים']
  },
  [Category.DRESSES]: {
    en: ['dress', 'gown', 'frock', 'dresses'],
    he: ['שמלה', 'שמלות']
  },
  [Category.MAXI_DRESSES]: {
    en: ['maxi dress', 'maxi dresses'],
    he: ['מקסי שמלה', 'מקסי שמלות']
  },
  [Category.MINI_DRESSES]: {
    en: ['mini dress', 'mini dresses'],
    he: ['מיני שמלה', 'מיני שמלות']
  },
  [Category.OVERALLS]: {
    en: ['overall', 'overalls'],
    he: ['אוברול', 'אוברולים']
  },
  [Category.JACKETS_COATS]: {
    en: ['jacket', 'coat', 'blazer', 'suit jacket', 'jackets', 'coats', 'outerwear'],
    he: ['מעיל', 'מעילים', 'ג׳קט', 'ג׳קטים', 'ז׳קט', 'ז׳קטים']
  },
  [Category.BLAZERS]: {
    en: ['blazer', 'blazers'],
    he: ['בלייזר', 'בלייזרים']
  },
  [Category.OUTERWEAR]: {
    en: ['outerwear'],
    he: []
  },
  [Category.SUITS]: {
    en: ['suit', 'suits'],
    he: ['חליפה', 'חליפות']
  },
  [Category.SWIMWEAR]: {
    en: ['swimwear', 'swimsuit', 'bathing suit', 'bikini', 'trunks'],
    he: ['בגד ים', 'בגדי ים', 'ביקיני', 'טרנקס']
  },
  [Category.BEACHWEAR]: {
    en: ['beachwear', 'beach wear'],
    he: ['בגד חוף', 'בגדי חוף']
  },
  [Category.BEACHWEAR_SWIMWEAR]: {
    en: ['beachwear', 'swimwear', 'beach wear', 'bathing suit'],
    he: ['בגד ים', 'בגדי ים', 'בגד חוף', 'בגדי חוף']
  },
  [Category.UNDERWEAR]: {
    en: ['underwear', 'briefs', 'undergarments'],
    he: ['תחתון', 'תחתונים', 'הלבשה תחתונה']
  },
  [Category.BOXERS]: {
    en: ['boxer', 'boxers'],
    he: ['בוקסר', 'בוקסרים']
  },
  [Category.SOCKS]: {
    en: ['sock', 'socks'],
    he: ['גרב', 'גרביים']
  },
  [Category.LINGERIE]: {
    en: ['lingerie', 'nightwear', 'night wear', 'nightgown', 'nightdress', 'nightie'],
    he: ['הלבשה תחתונה', 'לנז׳רי', 'לנז׳רי', 'פיג׳מה', 'פיג׳מות', 'כותונת', 'כותנות']
  },
  [Category.STRAPLESS]: {
    en: ['strapless'],
    he: []
  },
  [Category.UNDERWEAR_LINGERIE]: {
    en: ['underwear', 'lingerie'],
    he: ['הלבשה תחתונה', 'לנז׳רי']
  },
  [Category.OVERSIZE]: {
    en: ['oversize', 'oversized'],
    he: ['אוברסייז']
  },
  [Category.SPECIAL_FIT]: {
    en: ['special fit', 'tall', 'petite', 'plus size'],
    he: ['מידה מיוחדת', 'מידות מיוחדות', 'מידה גדולה', 'מידות גדולות', 'מידה קטנה', 'מידות קטנות']
  },
  [Category.SHOES]: {
    en: ['shoes', 'footwear', 'sneakers', 'trainers', 'boots', 'sandals'],
    he: ['נעל', 'נעליים', 'סניקרס', 'סניקרסים', 'נעלי ספורט', 'נעלי עור', 'נעלי גברים', 'נעלי נשים', 'מגף', 'מגפיים', 'סנדל', 'סנדלים']
  },
  [Category.TRAINERS]: {
    en: ['trainer', 'trainers'],
    he: ['טריינר', 'טריינרים']
  },
  [Category.SNICKERS]: {
    en: ['snicker', 'snickers'],
    he: ['סניקר', 'סניקרס']
  },
  [Category.SNEAKERS]: {
    en: ['sneaker', 'sneakers'],
    he: ['סניקר', 'סניקרס']
  },
  [Category.BOOTS]: {
    en: ['boot', 'boots'],
    he: ['מגף', 'מגפיים']
  },
  [Category.SANDALS]: {
    en: ['sandal', 'sandals'],
    he: ['סנדל', 'סנדלים']
  },
  [Category.FLIP_FLOPS]: {
    en: ['flip flop', 'flip flops', 'thong', 'thongs'],
    he: ['כפכף', 'כפכפים']
  },
  [Category.SLIPPERS]: {
    en: ['slipper', 'slippers'],
    he: ['נעלי בית', 'נעל בית']
  },
  [Category.ESPADRILLES]: {
    en: ['espadrille', 'espadrilles'],
    he: ['אספדריל', 'אספדרילים']
  },
  [Category.MOCCASINS]: {
    en: ['moccasin', 'moccasins'],
    he: ['מוקסין', 'מוקסינים']
  },
  [Category.ELEGANT_SHOES]: {
    en: ['elegant shoes', 'dress shoes'],
    he: ['נעל אלגנט', 'נעליים אלגנטיות']
  },
  [Category.OXFORD_SHOES]: {
    en: ['oxford', 'oxford shoes'],
    he: ['אוקספורד', 'נעלי אוקספורד']
  },
  [Category.ACCESSORIES]: {
    en: ['accessories', 'jewelry', 'watch', 'sunglasses', 'bag', 'hat', 'hats', 'belt', 'scarf', 'gloves', 'accessory'],
    he: ['אביזרים', 'אקססוריז', 'אביזר', 'שעון', 'שעונים', 'תיק', 'תיקים', 'כובע', 'כובעים', 'משקפיים', 'משקפי שמש', 'צמיד', 'צמידים', 'שרשרת', 'שרשראות', 'עגיל', 'עגילים', 'טבעת', 'טבעות', 'חגורה', 'חגורות', 'ארנק', 'ארנקים']
  },
  [Category.BAGS]: {
    en: ['bag', 'bags', 'handbag', 'handbags'],
    he: ['תיק', 'תיקים']
  },
  [Category.BACKPACKS]: {
    en: ['backpack', 'backpacks'],
    he: ['תיק גב', 'תיקי גב']
  },
  [Category.LAPTOP_BAGS]: {
    en: ['laptop bag', 'laptop bags'],
    he: ['תיק למחשב', 'תיקי מחשב']
  },
  [Category.SIDE_BAGS]: {
    en: ['side bag', 'side bags', 'crossbody', 'cross body'],
    he: ['תיק צד', 'תיקי צד']
  },
  [Category.TRAVEL_BAGS]: {
    en: ['travel bag', 'travel bags', 'duffle', 'duffle bag'],
    he: ['תיק נסיעות', 'תיקי נסיעות']
  },
  [Category.POUCH_BAGS]: {
    en: ['pouch bag', 'pouch bags'],
    he: ['פאוץ׳', 'פאוצ׳ים']
  },
  [Category.POUCHES]: {
    en: ['pouch', 'pouches'],
    he: ['פאוץ׳', 'פאוצ׳ים']
  },
  [Category.WALLETS]: {
    en: ['wallet', 'wallets'],
    he: ['ארנק', 'ארנקים']
  },
  [Category.BELTS]: {
    en: ['belt', 'belts'],
    he: ['חגורה', 'חגורות']
  },
  [Category.CARD_HOLDERS]: {
    en: ['card holder', 'card holders'],
    he: ['מחזיק כרטיסים', 'מחזיקי כרטיסים']
  },
  [Category.WALLETS_LEATHER]: {
    en: ['wallet', 'leather wallet', 'leather wallets'],
    he: ['ארנק', 'ארנק עור', 'ארנקים', 'ארנקי עור']
  },
  [Category.HATS]: {
    en: ['hat', 'hats', 'cap', 'caps'],
    he: ['כובע', 'כובעים', 'כובע מצחיה', 'כובעי מצחיה']
  },
  [Category.BUCKET_HATS]: {
    en: ['bucket hat', 'bucket hats'],
    he: ['כובע דלי', 'כובעי דלי']
  },
  [Category.HEADWEAR]: {
    en: ['headwear', 'head wear'],
    he: ['כיסוי ראש', 'כיסויי ראש']
  },
  [Category.SUNGLASSES]: {
    en: ['sunglasses', 'shades'],
    he: ['משקפי שמש']
  },
  [Category.EYEWEAR]: {
    en: ['eyewear', 'glasses', 'spectacles'],
    he: ['משקפיים']
  },
  [Category.NECKLACES]: {
    en: ['necklace', 'necklaces'],
    he: ['שרשרת', 'שרשראות']
  },
  [Category.BRACELETS]: {
    en: ['bracelet', 'bracelets'],
    he: ['צמיד', 'צמידים']
  },
  [Category.RINGS]: {
    en: ['ring', 'rings'],
    he: ['טבעת', 'טבעות']
  },
  [Category.JEWELRY]: {
    en: ['jewelry', 'jewellery'],
    he: ['תכשיט', 'תכשיטים']
  },
  [Category.GLOVES]: {
    en: ['glove', 'gloves'],
    he: ['כפפה', 'כפפות']
  },
  [Category.SCARVES]: {
    en: ['scarf', 'scarves'],
    he: ['צעיף', 'צעיפים']
  },
  [Category.HANDKERCHIEFS]: {
    en: ['handkerchief', 'handkerchiefs'],
    he: ['ממחטה', 'ממחטות']
  },
  [Category.OTHER_ACCESSORIES]: {
    en: ['other accessories', 'other'],
    he: ['אחר', 'אחרים', 'אביזרים אחרים']
  },
  [Category.BY_BRAND]: {
    en: ['by brand', 'brand'],
    he: ['מותג', 'מותגים']
  },
  [Category.RUNNING]: {
    en: ['running', 'run'],
    he: ['ריצה', 'רץ', 'רצים']
  },
  [Category.SPORT]: {
    en: ['sport', 'sports', 'athletic', 'athletics'],
    he: ['ספורט', 'ספורטיבי', 'ספורטיביים']
  },
  [Category.WELLNESS]: {
    en: ['wellness', 'body care', 'body'],
    he: ['בריאות', 'טיפוח']
  },
  [Category.BEAUTY]: {
    en: ['beauty', 'cosmetics', 'makeup'],
    he: ['יופי', 'קוסמטיקה', 'איפור']
  },
  [Category.PERFUMES]: {
    en: ['perfume', 'perfumes', 'fragrance', 'fragrances'],
    he: ['בושם', 'בשמים', 'ניחוח', 'ניחוחות']
  },
  [Category.HOME]: {
    en: ['home', 'house', 'apartment', 'flat'],
    he: ['בית', 'דירה', 'דירות']
  },
  [Category.HOME_WELLNESS]: {
    en: ['home wellness', 'home & wellness', 'wellness', 'body care', 'body'],
    he: ['בית', 'בריאות', 'טיפוח']
  },
  [Category.GIFTS]: {
    en: ['gift', 'gifts', 'present', 'presents'],
    he: ['מתנה', 'מתנות']
  },
  [Category.CLOTHING]: {
    en: ['clothing', 'apparel', 'garment', 'garments', 'clothes'],
    he: ['בגדים', 'לבוש',]
  },
  [Category.POLO_SHIRTS]: {
    en: ['polo shirt', 'polo shirts', 'polo'],
    he: ['חולצת פולו', 'חולצות פולו', 'פולו']
  }
};

// --- Generate Keyword-to-Category Map ---
export const CATEGORY_KEYWORD_TO_CATEGORY: Record<string, Category> = {};
for (const [cat, { en, he }] of Object.entries(CATEGORY_SEARCH_KEYWORDS_MAP) as [Category, { en: string[]; he: string[] }][]) {
  [...en, ...he].forEach(syn => {
    CATEGORY_KEYWORD_TO_CATEGORY[syn.toLowerCase()] = cat;
  });
} 