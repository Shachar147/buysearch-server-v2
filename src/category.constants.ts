// 🧷 Flat constants (used across the backend)

// --- Category Enum ---
// 👕 Clothing - Tops
export enum Category {
  CLOTHING = "Clothing",

  // 👕 Clothing - Tops
  T_SHIRTS = "T-Shirts & Vests",
  LONG_T_SHIRTS = "Long T-Shirts",
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
  TIGHTS = "Tights",
  SHORT_TIGHTS = "Short Tights",
  JOGGERS = "Joggers",
  TROUSERS = "Trousers",
  SHORTS = "Shorts",
  SKIRTS = "Skirts",
  MINI_SKIRTS = "Mini Skirts",
  MIDI_SKIRTS = "Midi Skirts",
  MAXI_SKIRTS = "Maxi Skirts",
  SHORT_JEANS = "Short Jeans",
  SETS = "Sets",

  // 👕 Clothing - Dresses, Outerwear, etc.
  DRESSES_OVERALLS = "Dresses & Overalls",
  DRESSES = "Dresses",
  MAXI_DRESSES = "Maxi Dresses",
  MIDI_DRESSES = "Midi Dresses",
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
  SLEEP_WEAR = "Nightwear",
  LINGERIE = "Lingerie",
  STRAPLESS = "Strapless",
  UNDERWEAR_LINGERIE = "Underwear & Lingerie",
  OVERSIZE = "Oversize",
  SPECIAL_FIT = "Special Fit",

  // 👟 Shoes
  SHOES = "Shoes",
  BASKETBALL_SHOES = "Basketball Shoes",
  SOCCER_SHOES = "Soccer Shoes",
  TRAINERS = "Trainers",
  SNICKERS = "Snickers",
  SNEAKERS = "Sneakers",
  BOOTS = "Boots",
  HEELS = "Heels",
  SANDALS = "Sandals",
  FLIP_FLOPS = "Flip Flops",
  SLIPPERS = "Slippers",
  ESPADRILLES = "Espadrilles Shoes",
  MOCCASINS = "Moccasin Shoes",
  ELEGANT_SHOES = "Elegant Shoes",
  OXFORD_SHOES = "Oxford Shoes",
  RUNNING_SHOES = "Running Shoes",

  // 👜 Accessories
  ACCESSORIES = "Accessories",
  BAGS = "Bags",
  BACKPACKS = "Backpacks",
  LAPTOP_BAGS = "Laptop Bags",
  SIDE_BAGS = "Side Bags",
  TRAVEL_BAGS = "Travel Bags",
  POUCH_BAGS = "Pouch Bags",
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
  HOME_KITCHEN = "Home: Kitchen",
  HOME_SLEEP = "Home: Sleep",
  HOME_DECOR = "Home: Decor",
  HOME_BATH = "Home: Bath",
  HOME_WELLNESS = "Home & Wellness",

  // 💄 Makeup
  MAKEUP = "Makeup",
  LIP_PENCIL = "Lip Pencils",
  BROW_PENCIL = "Brow Pencils",
  CONCEALER = "Concealers",
  MAKEUP_REMOVER = "Makeup Removers",
  HAND_CREAM = "Hand Creams",
  BODY_CREAM = "Body Creams",
  EYE_CREAM = "Eye Creams",
  NIGHT_CREAM = "Night Creams",
  SUNSCREEN = "Sunscreens",
  SERUMS = "Serums",
  BODY_OIL = "Body Oils",
  MOISTURIZER = "Moisturizers",
  CREAMS_AND_OILS = "Creams and Oils",
  HAND_CARE = "Hand Care",
  MAKEUP_BRUSHES = "Makeup Brushes",
  LIP_GLOSS = "Lip Gloss",
  EYE_MAKEUP = "Eye Makeup",
  FRAMERS = "Primers",
  FACE_CLEANSER = "Face Cleansers",
  ENVELOPE_BAG = "Envelope Bag",

  // 🎁 Gifts
  GIFTS = "Gifts",
  BLACK_FRIDAY = "Black Friday",

  PREGNANCY = "Pregnancy"
}

/**
 * Maps scraped/found category keywords (English or Hebrew) to one or more canonical Category enum values.
 * Used to normalize free-text or scraped categories to the internal enum(s).
 */
export const CATEGORY_NORMALIZATION_MAP: Record<string, (Category|string)[]> = {
  'caps': [Category.HATS],
  'כובעים': [Category.HATS],
  'כובע': [Category.HATS],
  "ג'קט": [Category.JACKETS_COATS],
  "בומבר": [Category.JACKETS_COATS],
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
  'אוברול ': [Category.OVERALLS],
  'overalls': [Category.OVERALLS],
  'bodysuit': [Category.BODYSUITS],
  'bodysuits': [Category.BODYSUITS],
  'בגד גוף': [Category.BODYSUITS],
  'בגדי גוף': [Category.BODYSUITS],
  'jewlery': [Category.JEWELRY],
  'תכשיטים': [Category.JEWELRY],
  'אביזרים': [Category.ACCESSORIES],
  'תיקים': [Category.BAGS],
  'תיק נסיעה': [Category.TRAVEL_BAGS],
  'תיקי נסיעה': [Category.TRAVEL_BAGS],
  'תיקי גב': [Category.BACKPACKS],
  "פאוץ'": [Category.POUCH_BAGS],
  "פאוץ": [Category.POUCH_BAGS],
  "פאוצים'": [Category.POUCH_BAGS],
  "פאוצ'ים'": [Category.POUCH_BAGS],
  "תיקי פאוץ'": [Category.POUCH_BAGS],
  "סנדלים וכפכפים": [Category.SANDALS, Category.FLIP_FLOPS],
  "סניקרס": [Category.SNICKERS],
  "צ'אנקי סניקרס": [Category.SNICKERS],
  'תיק לפטופ': [Category.LAPTOP_BAGS],
  'תיק ללפטופ': [Category.LAPTOP_BAGS],
  'תיק למחשב נייד': [Category.LAPTOP_BAGS],
  'תיק למחשב-נייד': [Category.LAPTOP_BAGS],
  'תיקי לפטופ': [Category.LAPTOP_BAGS],
  'בגדים': [], // No direct mapping, could be [Category.CLOTHING_MAIN_CATEGORY] if exists
  'טי שרט שרוול ארוך': [Category.T_SHIRTS],
  'טי שרט שרוול קצר': [Category.T_SHIRTS],
  'נעליים': [Category.SHOES],
  "ג'ינסים": [Category.JEANS],
  "תיקי צד": [Category.SIDE_BAGS],
  "חגורה": [Category.BELTS],
  "חגורות": [Category.BELTS],
  'ארנק כרטיסים': [Category.WALLETS, Category.CARD_HOLDERS],
  'ארנקים': [Category.WALLETS],
  'pouch bags': [Category.POUCH_BAGS],
  'משקפי שמש': [Category.SUNGLASSES],
  'גרב': [Category.SOCKS],
  'גרביים': [Category.SOCKS],
  'צמידים': [Category.JEWELRY, Category.BRACELETS],
  'צמיד': [Category.JEWELRY, Category.BRACELETS],
  'tax free': ['Tax Free'],
  'שרשרת': [Category.JEWELRY, Category.NECKLACES],
  'שרשראות': [Category.JEWELRY, Category.NECKLACES],
  'טבעות': [Category.JEWELRY, Category.RINGS],
  'בקבוקי ספורט': [Category.SPORT],
  'אביזרי ספורט': [Category.SPORT],
  'כפפות': [Category.GLOVES],
  'חליפות': [Category.SUITS],
  'חליפת': [Category.SUITS],
  'גוף & וולנס': [Category.WELLNESS],
  'straight': [Category.JEANS, Category.STRAIGHT_JEANS],
  'skinny': [Category.JEANS, Category.SKINNY_JEANS],
  'slim': [Category.JEANS, Category.SLIM_JEANS],
  'נעליים אלגנטיות': [Category.ELEGANT_SHOES],
  'נעליים שטוחות': [Category.SHOES],
  'מגפי שרוכים': [Category.BOOTS],
  'בגדי ים': [Category.SWIMWEAR],
  'בגד ים': [Category.SWIMWEAR],
  "מגפי צ'לסי": [Category.BOOTS],
  'מוקסינים': [Category.MOCCASINS],
  'מוקסין': [Category.MOCCASINS],
  'כפכפים': [Category.FLIP_FLOPS],
  'סנדלים': [Category.SANDALS],
  'ספורט': [Category.SPORT],
  'גופיות': [Category.TANKS],
  'גופיית ': [Category.TANKS],
  'sleeveless': [Category.TANKS],
  'גופייה': [Category.TANKS],
  'גופיה': [Category.TANKS],
  'beauty': [Category.BEAUTY],
  'סריגים': [Category.KNITWEAR],
  'סריג רוכסן': [Category.KNITWEAR],
  'קרדיגן': [Category.KNITWEAR],
  'סווטשירטים': [Category.SWEATERS],
  'סוויטשירטים': [Category.SWEATERS],
  'קפוצון': [Category.SWEATERS],
  'סווטשירט': [Category.SWEATERS],
  'סוודרים': [Category.SWEATERS],
  'סווטשירט crew': [Category.SWEATERS],
  'חולצות פולו': [Category.T_SHIRTS],
  'פולו שרוול קצר': [Category.T_SHIRTS],
  'polo t-shirts': [Category.POLO_SHIRTS],
  'polo tshirts': [Category.POLO_SHIRTS],
  'נעלי בית': [Category.SLIPPERS],
  'אביזרי נעליים': [Category.ACCESSORIES],
  'clothes': [],
  'חולצת פולו': [Category.POLO_SHIRTS],
  'הלבשה תחתונה': [Category.LINGERIE],
  'מתנות': [Category.GIFTS],
  'טי שירט': [Category.T_SHIRTS],
  'מגפיים': [Category.BOOTS],
  'מגפיים אלגנטיות': [Category.BOOTS],
  'כפכפי אצבע': [Category.FLIP_FLOPS],
  'נעלי אוקספורד': [Category.OXFORD_SHOES],
  'בגדי ספורט': [Category.SPORT],
  'Phonebag': [Category.BAGS],
  'אספדרילים': [Category.ESPADRILLES],
  'אספדריל': [Category.ESPADRILLES],
  'בגד חוף': [Category.BEACHWEAR, Category.SWIMWEAR],
  'וסט': [Category.T_SHIRTS],
  'סטרפלס': [Category.STRAPLESS],
  'סטרפלפס': [Category.STRAPLESS],
  'מטפחות': [Category.HANDKERCHIEFS],
  "טישירט": [Category.T_SHIRTS],
  "מכנסיים קצרים": [Category.PANTS, Category.SHORTS],
  'short jeans': [Category.SHORTS, Category.SHORT_JEANS],
  "אוברסייז": [Category.OVERSIZE],
  "Oversize": [Category.OVERSIZE],
  "סוודר": [Category.SWEATERS],
  "קרדיגנים": [Category.KNITWEAR],
  "בלייזר": [Category.BLAZERS],
  "בלייזרים": [Category.BLAZERS],
  'home': [Category.HOME],
  'pouch': [Category.POUCH_BAGS],
  'new era': ['New Era'],
  'abercrombie and fitch': ['Abercrombie & Fitch'],
  'חצאית': [Category.SKIRTS],
  'חצאית מיני': [Category.MINI_SKIRTS],
  'חצאית מקסי': [Category.MAXI_SKIRTS],
  'חצאיות מיני': [Category.MINI_SKIRTS],
  'חצאיות מקסי': [Category.MAXI_SKIRTS],
  'חצאית מידי': [Category.MIDI_SKIRTS],
  'חצאיות מידי': [Category.MIDI_SKIRTS],
  'שמלה ארוכה': [Category.MAXI_DRESSES],
  'שמלה קצרה': [Category.MINI_DRESSES],
  'שמלה מקסי': [Category.MAXI_DRESSES],
  'שמלות מיני': [Category.MINI_DRESSES],
  'שמלת מיני': [Category.MINI_DRESSES],
  'שמלה מידי': [Category.MIDI_DRESSES],
  'שמלות מידי': [Category.MIDI_DRESSES],
  'שמלת מידי': [Category.MIDI_DRESSES],
  'welness & body': [Category.WELLNESS],
  'טייץ': [Category.TIGHTS],
  'legging': [Category.TIGHTS],
  'leggings': [Category.TIGHTS],
  'טייצים': [Category.TIGHTS],
  'בגדי חוף': [Category.BEACHWEAR],
  'מכנסיים וטייצים': [Category.PANTS],
  'מכנסיים ': [Category.PANTS],
  'מכנסי ': [Category.PANTS],
  'שמלות וחצאיות': [Category.DRESSES],
  'שמלת': [Category.DRESSES],
  'חליפות ואוברולים': [Category.OVERALLS],
  'בגדי ים וחוף': [Category.BEACHWEAR],
  "ז'קטים ומעילים": [Category.JACKETS_COATS],
  "פיג'מות": [Category.SLEEP_WEAR],
  "עקבים": [Category.HEELS],
  "נעלי עקב": [Category.HEELS],
  'קרם ידיים': [Category.HAND_CREAM],
  'קרם גוף': [Category.BODY_CREAM],
  'קרם עיניים': [Category.EYE_CREAM],
  'קרם לילה': [Category.NIGHT_CREAM],
  'קרם הגנה': [Category.SUNSCREEN],
  'סרומים': [Category.SERUMS],
  'סרום': [Category.SERUMS],
  'שמן גוף': [Category.BODY_OIL],
  'לחות': [Category.MOISTURIZER],
  'קרמים ושמנים': [Category.CREAMS_AND_OILS],
  'טיפוח ידיים': [Category.HAND_CARE],
  'מברשות איפור': [Category.MAKEUP_BRUSHES],
  'ליפ גלוס': [Category.LIP_GLOSS],
  'עיניים': [Category.EYE_MAKEUP],
  'פריימר': [Category.FRAMERS],
  'ניקוי הפנים': [Category.FACE_CLEANSER],
  'מארז זוגי': [Category.GIFTS],
  'מעטפת': [Category.ENVELOPE_BAG],
  "בלק פריידי": [Category.BLACK_FRIDAY],
  "בלאק פריידי": [Category.BLACK_FRIDAY],
  // --- BEGIN user-provided normalization terms ---
  'בוקסרים': [Category.BOXERS],
  'עיפרון גבות': [Category.BROW_PENCIL],
  'nightwear': [Category.SLEEP_WEAR],
  'אביזרי תיקים': [Category.BAGS],
  'טיפוח הגוף': [Category.WELLNESS],
  'backpacks': [Category.BACKPACKS],
  'סקיני': [Category.SKINNY_JEANS],
  'תיקי כתף': [Category.SIDE_BAGS],
  'הריון ולידה': [Category.PREGNANCY], // Ignore, not a product category for now
  'תחתונים': [Category.UNDERWEAR],
  'שפתונים': [Category.LIP_GLOSS],
  'ווסט': [Category.T_SHIRTS], // Vest for now
  'צעיפים ומטפחות': [Category.SCARVES, Category.HANDKERCHIEFS],
  'שמנים': [Category.BODY_OIL],
  'בישום לגבר': [Category.PERFUMES],
  'ברמודה': [Category.SHORTS],
  'פולו שרוול ארוך': [Category.LONG_T_SHIRTS],
  'סטילטו': [Category.HEELS],
  'מסיר איפור': [Category.MAKEUP_REMOVER],
  'לחות וסרומים': [Category.MOISTURIZER, Category.SERUMS],
  'מכופתרת שרוול ארוך': [Category.SHIRTS, Category.LONG_T_SHIRTS],
  'סריג crew': [Category.CREW_NECK_SWEATERS],
  'חולצות אופנה': [Category.SHIRTS],
  'חולצת ': [Category.TOPS],
  'Scarves': [Category.SCARVES],
  'תיקי קלאץ\'': [Category.BAGS],
  'מעיל ארוך': [Category.JACKETS_COATS],
  'black friday': [Category.BLACK_FRIDAY],
  'מכנסי פוטר': [Category.JOGGERS],
  'עיפרון שפתיים': [Category.LIP_PENCIL],
  "ג'ינס קצר": [Category.SHORT_JEANS],
  'אוברול קצר': [Category.OVERALLS],
  'מגפי בוקרים': [Category.BOOTS],
  'טיפוח פנים': [Category.WELLNESS],
  'סנדלי אצבע': [Category.FLIP_FLOPS],
  'מכנסי טריינינג': [Category.JOGGERS],
  'עקב': [Category.HEELS],
  'מותגים': [Category.BY_BRAND],
  'מעילים': [Category.JACKETS_COATS],
  'מיני & מארזים': [Category.GIFTS],
  'ביוטי': [Category.BEAUTY],
  'חולצות סריג': [Category.KNITWEAR],
  'מגפי ברך': [Category.BOOTS],
  'boxer': [Category.BOXERS],
  "מכנסי דגמ'ח": [Category.PANTS],
  'פדורה': [Category.HATS],
  'ביוטי ובישום': [Category.BEAUTY, Category.PERFUMES],
  'איפור': [Category.MAKEUP],
  'bikini': [Category.SWIMWEAR],
  'מגפי עקב': [Category.HEELS, Category.BOOTS],
  'סמקים וברונזרים': [Category.MAKEUP],
  'wellness & body': [Category.WELLNESS],
  'חזיות': [Category.LINGERIE],
  'בישום': [Category.PERFUMES],
  'מכופתרת שרוול קצר': [Category.SHIRTS, Category.LONG_T_SHIRTS],
  "ג'ינס מתרחב": [Category.JEANS],
  'בישום לגברים': [Category.PERFUMES],
  "קפוצ'ון": [Category.SWEATERS],
  'מחוייטות': [Category.SUITS],
  'סווטשירט רוכסן': [Category.SWEATERS],
  'SPORT': [Category.SPORT],
  'מעיל קצר': [Category.JACKETS_COATS],
  'עגילים': [Category.JEWELRY],
  'long jumpsuit': [Category.OVERALLS],
  'שלמים': [Category.SWIMWEAR],
  'side bags': [Category.SIDE_BAGS],
  'גולף': [Category.SHIRTS],
  'טיפוח': [Category.WELLNESS],
  // 'Golf': [Category.SHIRTS],
  "מכנסי צ'ינו": [Category.PANTS],
  'בישום לנשים': [Category.PERFUMES],
  'תיקים, נעליים ואביזרים': [Category.ACCESSORIES],
  'שמנים וסרומים': [Category.BODY_OIL, Category.SERUMS],
  'espadrilles shoes': [Category.ESPADRILLES],
  'פלטפורמה': [Category.HEELS],
  'תיקי מיני': [Category.BAGS],
  'קרופ טופ': [Category.TOPS],
  'שימר': [Category.MAKEUP],
  "טרנץ'": [Category.JACKETS_COATS],
  'bucket': [Category.BUCKET_HATS],
  // 'בויפרנד': [Category.JEANS],
  'נעלי כלה': [Category.SHOES],
  'צעיפים': [Category.SCARVES],
  'שמלות מקסי': [Category.MAXI_DRESSES],
  'travel bags': [Category.TRAVEL_BAGS],
  'חגורת לוגו': [Category.BELTS],
  "ג'ינס": [Category.JEANS],
  'heels': [Category.HEELS],
  'סריג ארוך': [Category.KNITWEAR],
  'סריג קצר': [Category.KNITWEAR],
  'מכנסי עור': [Category.PANTS],
  'תיקי נשיאה': [Category.BAGS],
  'סריג V': [Category.KNITWEAR],
  'סווטשרטים': [Category.SWEATERS],
  'sets': [Category.SETS],
  'אביזרי נסיעה': [Category.TRAVEL_BAGS],
  'פיג\'מות וחלוקים': [Category.SLEEP_WEAR],
  "ז'קטים": [Category.JACKETS_COATS],
  'קרופ': [Category.TOPS],
  'תיקי חוף': [Category.BAGS],
  'תיקי קרוסבודי': [Category.SIDE_BAGS],
  'ביקיני': [Category.SWIMWEAR],
  'שמלות מכופתרות': [Category.DRESSES],
  'מגפונים': [Category.BOOTS],
  'טופים': [Category.TOPS],
  'אייליינר': [Category.EYE_MAKEUP],
  'ballerina shoes': [Category.SHOES],
  'פודרה': [Category.MAKEUP],
  'שמלות חוף': [Category.BEACHWEAR],
  'שמלות סליפ': [Category.DRESSES],
  'מחוייטים': [Category.SUITS],
  'קונסילר': [Category.CONCEALER],
  'תיקי ערב': [Category.BAGS],
  'Parfum': [Category.PERFUMES],
  // --- END user-provided normalization terms ---
    "sisley paris": [Category.BY_BRAND],
    "lulu melon": [Category.BY_BRAND],
    "buyers' picks": [Category.GIFTS],
    "sapir avisror": [Category.BY_BRAND],
    "מיול'ס": [Category.SHOES],
    "צלחות": [Category.HOME],
    "גיפט קארד": [Category.GIFTS],
    "שיער": [Category.WELLNESS],
    "edc - eau de cologne": [Category.PERFUMES],
    "ספרים": [Category.HOME],
    "מחטבים": [Category.ACCESSORIES],
    "מפיצי ריח": [Category.PERFUMES],
    "אביזרי שיער": [Category.ACCESSORIES],
    "טקסטיל": [Category.HOME],
    "scarves": [Category.SCARVES],
    "ריהוט ונוי לבית": [Category.HOME],
    "מארז שלישייה": [Category.GIFTS],
    "edt - eau de toilette": [Category.PERFUMES],
    "נרות": [Category.HOME],
    "סבון גוף": [Category.WELLNESS],
    "בישום לבית": [Category.HOME],
    "בישום גוף": [Category.PERFUMES],
    "מכנסי דגמ\"ח": [Category.PANTS],
    "ספרי עיון": [Category.HOME],
    "ralph lauren": [Category.BY_BRAND],
    "מסכות פנים": [Category.WELLNESS],
    "מחזיקי מפתחות": [Category.ACCESSORIES],
    "פוך": [Category.HOME],
    "קערות": [Category.HOME],
    "חפצי נוי": [Category.HOME],
    "כוסות": [Category.HOME],
    "בישום לשיער": [Category.PERFUMES],
    "מסכות פילינג": [Category.WELLNESS],
    "ריהוט": [Category.HOME],
    "sport": [Category.SPORT],
    "edp - eau de parfum": [Category.PERFUMES],
    "ספרי שולחן קפה": [Category.HOME],
    "מסכות ופילינג": [Category.WELLNESS],
    "golf": [Category.SPORT],
    "טיפוח שיער": [Category.WELLNESS],
    "how to style your asics": [Category.GIFTS],
    "50 shades of brown": [Category.GIFTS],
    "מסכות": [Category.WELLNESS],
    "fragranced spray": [Category.PERFUMES],
    "summer club": [Category.GIFTS],
    "שפתיים": [Category.LIP_PENCIL],
    "קטורת": [Category.HOME],
    "סריג v": [Category.SWEATERS],
    "אירוח": [Category.HOME],
    "אמבטיה": [Category.HOME],
    "ג'ל לגבות": [Category.BROW_PENCIL],
    "ג'ל לניקוי": [Category.MAKEUP_REMOVER],
    "back to campus": [Category.GIFTS],
    "מגשים": [Category.HOME],
    "nadir eliyahou": [Category.BY_BRAND],
    "פנים": [Category.WELLNESS],
    "מכנסי 7/8": [Category.PANTS],
    "קרמיקה": [Category.HOME],
    "ניחוחות לבית": [Category.HOME],
    "באלם לניקוי": [Category.MAKEUP_REMOVER],
    "archive old": [Category.GIFTS],
    "גבות": [Category.BROW_PENCIL],
    "ספריי עיון": [Category.HOME],
    "שעונים": [Category.ACCESSORIES],
    "לייף סטייל": [Category.HOME],
    "buyer's picks": [Category.GIFTS],
    "maskit x gottex": [Category.BY_BRAND],
    "parfum": [Category.PERFUMES],
    "כיסוי דרכון": [Category.ACCESSORIES],
    'קרם יום': [Category.BEAUTY, Category.MAKEUP, Category.CREAMS_AND_OILS],
    'מזרנים': [Category.SPORT],
    'כלי הגשה': [Category.HOME],
    'קרם לצוואר': [Category.BEAUTY, Category.MAKEUP, Category.CREAMS_AND_OILS],
    'lingerie & nightwear': [Category.LINGERIE, Category.SLEEP_WEAR],
    'sweatpants': [Category.JOGGERS],
    'seatpant': [Category.JOGGERS],
    'חולצת טי': [Category.T_SHIRTS],
    'נעלי ': [Category.SHOES],
    "ג׳ינס סיאל": [Category.JEANS],
    "ג'ינס סיאל": [Category.JEANS],
    'maxi dress': [Category.MAXI_DRESSES],
    'maxi skirt': [Category.MAXI_SKIRTS],
    'mini dress': [Category.MINI_DRESSES],
    'mini skirt': [Category.MINI_SKIRTS],
    'midi dress': [Category.MIDI_DRESSES],
    'midi skirt': [Category.MIDI_SKIRTS],
    'Lingerie & Nightwear': [Category.LINGERIE],
    'creams and oils': [Category.CREAMS_AND_OILS],
};

// --- Category Synonyms Map ---
export type CategorySynonyms = {
  [K in Category]: { en: string[]; he: string[] }
};

export const CATEGORY_SEARCH_KEYWORDS_MAP: CategorySynonyms = {
  [Category.T_SHIRTS]: {
    en: ['t-shirt', 'tshirt', 'tee', 't shirt', 'tank top', 'vest'],
    he: ['טי שירט', 'טי-שירט', 'טישרט', 'חולצה', 'חולצות', 'טי שירטים', 'טי-שירטים', 'ווסט']
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
    he: ['גופיה', 'גופיות', 'גופיית']
  },
  [Category.SWEATERS]: {
    en: ['sweater', 'sweaters', 'jumper', 'pull', 'pull-over', 'pullover'],
    he: ['סוודר', 'סוודרים', 'סוויטשירטים', 'סווטשירטים', 'סווטשיירטים']
  },
  [Category.CREW_NECK_SWEATERS]: {
    en: ['crew neck sweater', 'crewneck sweater', 'crew neck', 'crewneck'],
    he: ['סריג CREW']
  },
  [Category.KNITWEAR]: {
    en: ['knitwear', 'knit', 'knitted'],
    he: ['סריג', 'סריגים']
  },
  [Category.BODYSUITS]: {
    en: ['bodysuit', 'bodysuits'],
    he: ['בודי', 'בודיס', 'בודיסוט', 'בודיסוטים', 'בגד גוף', 'בגד-גוף', 'בגדי גוף', 'בגדי-גוף']
  },
  [Category.OVERSHIRTS]: {
    en: ['overshirt', 'overshirts'],
    he: ['אוברשירט', 'אוברשיירט', 'אוברסייז']
  },
  [Category.BOTTOMS]: {
    en: ['bottom', 'bottoms'],
    he: []
  },
  [Category.JEANS]: {
    en: ['jeans', 'denim', 'pants', 'trousers'],
    he: ["ג'ינסים", "ג'ינס", "גינס", "גינסים", "מכנסי דנים", "מכנס דנים"]
  },
  [Category.SKINNY_JEANS]: {
    en: ['skinny jeans', 'skinny fit jeans'],
    he: ["סקיני ג'ינס", "סקיני גינס"]
  },
  [Category.SLIM_JEANS]: {
    en: ['slim jeans', 'slim fit jeans'],
    he: ["סלים ג'ינס", "סלים גינס"]
  },
  [Category.STRAIGHT_JEANS]: {
    en: ['straight jeans', 'straight fit jeans'],
    he: ["סטרייט ג'ינס", "סטרייט גינס"]
  },
  [Category.PANTS]: {
    en: ['pants', 'trousers', 'slacks'],
    he: ['מכנס', 'מכנסיים', 'מכנסי בד', 'מכנסי עבודה']
  },
  [Category.JOGGERS]: {
    en: ['jogger', 'joggers', 'sweatpants'],
    he: ["ג'וגר", "גוגר", "טרנינג", "סווטפנטס"]
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
    he: ["שורט ג'ינס", 'שורט גינס', "שורטים ג'ינס", 'שורטים גינס']
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
    he: ["מעיל", "מעילים", "ג'קט", "ג'קטים", "ז'קט", "ז'קטים", "בומבר"]
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
    he: ['בגד ים', 'בגדי ים', 'ביקיני', 'טרנקס', 'חוטיני']
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
    he: ['תחתון', 'תחתונים', 'הלבשה תחתונה', 'תחתוני ', 'תחתוני']
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
    en: ['lingerie'],
    he: ['הלבשה תחתונה', "לנז'רי"]
  },
  [Category.STRAPLESS]: {
    en: ['strapless'],
    he: ['סטרפלס', 'סטרפלפס']
  },
  [Category.UNDERWEAR_LINGERIE]: {
    en: ['underwear', 'lingerie'],
    he: ['הלבשה תחתונה', "לנז'יר"]
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
    he: ['כפכף', 'כפכפים', 'כפכפי ']
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
    he: ['אביזרים', 'אקססוריז', 'אביזר', 'שעון', 'שעונים', 'תיק', 'תיקים', 'כובע', 'כובעים', 'משקפיים', 'משקפי שמש', 'צמיד', 'צמידים', 'שרשרת', 'שרשראות', 'עגיל', 'עגילים', 'טבעת', 'טבעות', 'חגורה', 'חגורות', 'ארנק', 'ארנקים', 'נגד מים לטלפון', 'קייס ל']
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
    he: ["פאוץ'", "פאוצ'ים", "פאוץ", "פאוצים"]
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
    en: ['perfume', 'perfumes', 'fragrance', 'fragrances', 'parfum'],
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
  },
  [Category.LONG_T_SHIRTS]: {
    en: ['long t-shirt', 'long t-shirts', 'long sleeve t-shirt', 'long sleeve tee', 'long tee', 'long t shirt', 'long sleeve shirt'],
    he: ['טי שירט ארוך', 'טי שירטים ארוכים', 'חולצת טי ארוכה', 'חולצות טי ארוכות', 'חולצה ארוכה', 'חולצות ארוכות']
  },
  [Category.TIGHTS]: {
    en: ['tights', 'leggings', 'long tights', 'long leggings'],
    he: ['טייץ', 'טייצים', 'טייץ ארוך', 'טייצים ארוכים']
  },
  [Category.SHORT_TIGHTS]: {
    en: ['short tights', 'short leggings', 'bike shorts', 'biker shorts'],
    he: ['טייץ קצר', 'טייצים קצרים', 'טייץ אופניים', 'טייץ קצר']
  },
  [Category.MIDI_SKIRTS]: {
    en: ['midi skirt', 'midi skirts'],
    he: ['חצאית מידי', 'חצאיות מידי']
  },
  [Category.MIDI_DRESSES]: {
    en: ['midi dress', 'midi dresses'],
    he: ['שמלת מידי', 'שמלות מידי']
  },
  [Category.SLEEP_WEAR]: {
    en: ['pajamas', 'sleep wear', 'nightwear', 'night wear', 'nightgown', 'nightdress', 'nightie'],
    he: ["פיג'מה", "פיג'מות", "לבוש לילה", "לבוש שינה", "פיגמה", "פיגמות", 'כותונת', 'כותנות']
  },
  [Category.SETS]: {
    en: ["complete set", "total look"],
    he: ["סטים תואמים", "מכנס וחולצה"]
  },
  [Category.HEELS]: {
    en: ["heel shoes", "heels"],
    he: ["נעל עקב", "נעלי עקב", "נעליים עקב", "נעלים עקב", "עקבים"]
  },
  [Category.MAKEUP]: {
    en: ['makeup', 'cosmetics', 'make up', 'beauty products', 'foundation', 'concealer', 'blush', 'powder', 'highlighter', 'contour', 'bronzer', 'primer', 'setting spray', 'face makeup'],
    he: ['איפור', 'קוסמטיקה', 'מייקאפ', 'סומק', 'פודרה', 'היילייטר', 'קונטור', 'ברונזר', 'פריימר', 'ספריי מקבע', 'מייק-אפ', 'מוצרי יופי', 'מוצרי איפור']
  },
  [Category.LIP_PENCIL]: {
    en: ['lip pencil', 'lip liner', 'lip pencils', 'lip liners'],
    he: ['עיפרון שפתיים', 'עפרון שפתיים', 'עפרונות שפתיים', 'עפרון לשפתיים']
  },
  [Category.BROW_PENCIL]: {
    en: ['brow pencil', 'eyebrow pencil', 'brow pencils', 'eyebrow pencils', 'brow liner', 'brow definers'],
    he: ['עיפרון גבות', 'עפרון גבות', 'עפרונות גבות', 'עפרון לגבות']
  },
  [Category.CONCEALER]: {
    en: ['concealer', 'concealers', 'cover stick', 'corrector', 'blemish concealer', 'under eye concealer', 'spot concealer'],
    he: ['קונסילר', 'קונסילרים', 'מסתיר פגמים', 'קונסילר לעיניים', 'קונסילר מתקן', 'קונסילר נקודתי']
  },
  [Category.MAKEUP_REMOVER]: {
    en: ['makeup remover', 'makeup removers', 'cleanser', 'cleansing water', 'micellar water', 'makeup wipes', 'remover wipes', 'eye makeup remover', 'face cleanser'],
    he: ['מסיר איפור', 'מסירי איפור', 'ניקוי פנים', 'מים מיסלריים', 'מגבוני איפור', 'מסיר איפור לעיניים', 'מסיר איפור לפנים', 'תכשיר ניקוי']
  },
  [Category.HAND_CREAM]: {
    en: ['hand cream', 'hand creams', 'hand moisturizer'],
    he: ['קרם ידיים', 'קרם לידיים', 'קרם-ידיים', 'קרמי ידיים']
  },
  [Category.BODY_CREAM]: {
    en: ['body cream', 'body creams', 'body moisturizer'],
    he: ['קרם גוף', 'קרם לגוף', 'קרמים לגוף', 'קרם-גוף']
  },
  [Category.EYE_CREAM]: {
    en: ['eye cream', 'eye creams'],
    he: ['קרם עיניים', 'קרם לעיניים', 'קרם-עיניים', 'קרמים לעיניים', 'קרמים עיניים']
  },
  [Category.NIGHT_CREAM]: {
    en: ['night cream', 'night creams'],
    he: ['קרם לילה', 'קרם ללילה', 'קרם-לילה', 'קרמי-לילה']
  },
  [Category.SUNSCREEN]: {
    en: ['sunscreen', 'spf', 'sunblock', 'sun screen', 'spf cream'],
    he: ['קרם הגנה', 'קרם הגנה מהשמש', 'מסנן קרינה', 'קרם spf', 'קרם הגנה']
  },
  [Category.SERUMS]: {
    en: ['serum', 'serums', 'face serum', 'skin serum'],
    he: ['סרום', 'סרומים']
  },
  [Category.BODY_OIL]: {
    en: ['body oil', 'body oils'],
    he: ['שמן גוף', 'שמנים לגוף']
  },
  [Category.MOISTURIZER]: {
    en: ['moisturizer', 'moisturizers', 'hydrating cream'],
    he: ['לחות', 'קרם לחות']
  },
  [Category.CREAMS_AND_OILS]: {
    en: ['creams and oils', 'cream and oil'],
    he: ['קרמים ושמנים']
  },
  [Category.HAND_CARE]: {
    en: ['hand care', 'hand treatment'],
    he: ['טיפוח ידיים']
  },
  [Category.MAKEUP_BRUSHES]: {
    en: ['makeup brush', 'makeup brushes', 'cosmetic brush', 'cosmetic brushes'],
    he: ['מברשת איפור', 'מברשות איפור']
  },
  [Category.LIP_GLOSS]: {
    en: ['lip gloss', 'lipgloss'],
    he: ['ליפ גלוס', 'ליפגלוס']
  },
  [Category.EYE_MAKEUP]: {
    en: ['eye makeup', 'eye shadow', 'eyeshadow', 'mascara', 'eyeliner'],
    he: ['איפור עיניים', 'עיניים', 'צללית', 'מסקרה', 'אייליינר']
  },
  [Category.FRAMERS]: {
    en: ['primer', 'primers', 'makeup primer'],
    he: ['פריימר', 'פריימרים']
  },
  [Category.FACE_CLEANSER]: {
    en: ['face cleanser', 'facial cleanser', 'face wash', 'facial wash', 'cleanser'],
    he: ['ניקוי הפנים', 'תכשיר ניקוי', 'סבון פנים']
  },
  [Category.ENVELOPE_BAG]: {
    en: ['envelope bag', 'envelope clutch'],
    he: ['מעטפת', 'תיק מעטפה']
  },
  [Category.BLACK_FRIDAY]: {
    en: ["black friday", "black-friday", "blackfriday"],
    he: ["בלאק פריידי", "בלק פריידי", "בלאק פרידי"]
  },
  [Category.PREGNANCY]: {
    en: ['pregnancy'],
    he: ['הריון', ' לידה ']
  },
  [Category.BASKETBALL_SHOES]: {
    en: ['basketball shoe', 'kyrie shoe', 'kd shoe', 'lebron shoe', 'kevin durant shoe'],
    he: ['נעלי כדורסל', 'נעל כדורסל']
  },
  [Category.SOCCER_SHOES]: {
    en: ['soccer shoe', 'football shoe', 'messi shoe', 'ronaldo shoe'],
    he: ['נעל כדורגל', 'נעלי כדורגל']
  },
  [Category.RUNNING_SHOES]: {
    en: ['running shoe', 'shoe for running', 'running-shoe'],
    he: ['נעל ריצה', 'נעלי ריצה', 'נעל-ריצה']
  },
  [Category.HOME_KITCHEN]: {
    en: ['kitchen', 'spoons', 'forks'],
    he: ['למטבח', 'צלחת', 'צלחות', 'סכו"ם', 'מזלגות', 'סכינים', 'כפות', 'כפיות', 'כוסות', 'מטבח']
  },
  [Category.HOME_SLEEP]: {
    en: ['sleep', 'bedroom', 'bedding', 'duvet', 'pillow', 'sheets', 'blanket', 'quilt', 'linen', 'comforter', 'bed', 'mattress', 'bedspread', 'pillowcase', 'coverlet', 'sleeping'],
    he: ['שינה', 'חדר שינה', 'מצעים', 'שמיכה', 'כרית', 'סדין', 'שמיכות', 'כיסוי מיטה', 'ציפה', 'מיטה', 'מזרן', 'כיסוי', 'כריות', 'שנת לילה']
  },
  [Category.HOME_DECOR]: {
    en: ['decor', 'decoration', 'design', 'home decor', 'ornament', 'vase', 'picture', 'frame', 'art', 'sculpture', 'candle', 'home styling', 'accessory', 'accessories', 'interior'],
    he: ['עיצוב', 'דקור', 'דקורציה', 'קישוט', 'ואזה', 'תמונה', 'מסגרת', 'אומנות', 'פיסול', 'נר', 'סטיילינג', 'אביזר', 'אביזרים', 'פנים הבית']
  },
  [Category.HOME_BATH]: {
    en: ['bath', 'bathroom', 'towel', 'towels', 'bathrobe', 'robe', 'shower', 'soap', 'bath mat', 'bathroom accessories', 'washcloth', 'loofah', 'bathroom decor', 'bath accessories'],
    he: ['אמבטיה', 'מגבת', 'מגבות', 'חלוק', 'מקלחת', 'סבון', 'שטיחון', 'אביזרי אמבטיה', 'רחצה', 'ספוג', 'דקור אמבטיה', 'אביזרי רחצה']
  }
};

// --- Generate Keyword-to-Category Map ---
export const CATEGORY_KEYWORD_TO_CATEGORY: Record<string, Category> = {};
for (const [cat, { en, he }] of Object.entries(CATEGORY_SEARCH_KEYWORDS_MAP) as [Category, { en: string[]; he: string[] }][]) {
  [...en, ...he].forEach(syn => {
    CATEGORY_KEYWORD_TO_CATEGORY[syn.toLowerCase()] = cat;
  });
}

// --- Categories to Ignore ---
export const CATEGORIES_TO_IGNORE = new Set([
  'בויפרינד',
  'עור',
  'גברים',
  'נשים',
  'ילדים',
  'מצחיה',
  'מצחייה',
  '(not set)',
  'נמוכות',
  'גבוהות',
  'sale',
  'טרנץ',
  'new',
  'פשתן',
  'summer essentials',
  'or luzon picks',
  'סטיילינג',
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '60%',
  '70%',
  '80%',
  '90%',
  'archive',
  'wear it like jeremy',
  'five point four',
  'run',
  'שטוחים',
  'לוגו',
  'ארוכים',
  'מודפסים',
  'חלקים',
  'לוגומאניה',
  'אספדרילים',
  'נעלי אוקספורד',
  'מגפיים',
  'מגפי שרוכים',
  'נעליים שטוחות',
  'כפכפי אצבע',
  "מגפי צ'לסי",
  'וסט',
  "קז'ואל",
  'טי שירט שרוול ארוך',
  'טי שירט שרוול קצר',
  'men', // <- todo remove,
  'short jeans', // <- todo remove,
  'tax free', // todo remove,
  'italian summer', // todo remove,
  'mocha mousse', // todo remove,
  'straight',
  'back in stock', // todo remove,
  'crew neck sweaters', // todo remove
  'רוח',
  'גבות',
  'מעטפת',
  'best sellers',
  'wear your pride',
  'ישר',
  'גבר',
  'חדש',
  'בינוני',
  'גבוה',
  'נמוך',
  'דקה',
  'עבה',
  'ארוך',
  'קצר',
  'א-סימטרי',
  'א-סמטיריות',
  'רוח',
  'קרעים',
  'דלגיות',
  'מתרחבים',
  'קנה לפי סוג עור',
  'לכל סוגי העור',
  'צמר',
  'פמוטים',
  'קיטן',
  'צבאיים',
  'הריון ולידה',
  'מוצרי תינוקות',
  'pring',
  'סקיני',
  'מיני',
  'מידי',
  'do it like beckham',
  'noa taka picks',
  'spf 50+',
  "buyers' picks",
  "מעטפת",
  'print',
]); 