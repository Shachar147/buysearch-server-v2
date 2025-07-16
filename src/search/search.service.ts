import { Injectable } from '@nestjs/common';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { ucfirst } from './search.utils';
import { normalizeBrandName } from 'src/scrapers/scraper_utils';
import {
  T_SHIRTS_CATEGORY,
  SHIRTS_CATEGORY,
  JEANS_CATEGORY,
  JACKETS_COATS_CATEGORY,
  DRESSES_CATEGORY,
  MOCCASINS_CATEGORY,
  SHOES_MAIN_CATEGORY,
  ACCESSORIES_MAIN_CATEGORY,
  JOGGERS_CATEGORY,
  HATS_CATEGORY,
  POLO_SHIRTS_CATEGORY,
  BAGS_CATEGORY,
  SKIRTS_CATEGORY,
  SHORTS_CATEGORY,
  SWIMWEAR_CATEGORY,
  LINGERIE_CATEGORY,
  TOPS_MAIN_CATEGORY,
  CLOTHING_MAIN_CATEGORY,
  BOXERS_CATEGORY,
  SNICKERS_CATEGORY,
  TANKS_CATEGORY,
  SWEATERS_CATEGORY,
  KNITWEAR_CATEGORY,
  BODYSUITS_CATEGORY,
  OVERSHIRTS_CATEGORY,
  BOTTOMS_MAIN_CATEGORY,
  SKINNY_JEANS_CATEGORY,
  SLIM_JEANS_CATEGORY,
  STRAIGHT_JEANS_CATEGORY,
  PANTS_CATEGORY,
  TROUSERS_CATEGORY,
  MINI_SKIRTS_CATEGORY,
  MAXI_SKIRTS_CATEGORY,
  DRESSES_OVERALLS_MAIN_CATEGORY,
  OVERALLS_CATEGORY,
  BLAZERS_CATEGORY,
  OUTERWEAR_MAIN_CATEGORY,
  SUITS_CATEGORY,
  SUITS_MAIN_CATEGORY,
  BEACHWEAR_CATEGORY,
  BEACHWEAR_SWIMWEAR_MAIN_CATEGORY,
  UNDERWEAR_CATEGORY,
  SOCKS_CATEGORY,
  STRAPLESS_CATEGORY,
  UNDERWEAR_LINGERIE_MAIN_CATEGORY,
  OVERSIZE_CATEGORY,
  SPECIAL_FIT_MAIN_CATEGORY,
  TRAINERS_CATEGORY,
  SNEAKERS_CATEGORY,
  BOOTS_CATEGORY,
  SANDALS_CATEGORY,
  FLIP_FLOPS_CATEGORY,
  SLIPPERS_CATEGORY,
  ESPADRILLES_CATEGORY,
  ELEGANT_SHOES_CATEGORY,
  OXFORD_SHOES_CATEGORY,
  BACKPACKS_CATEGORY,
  LAPTOP_BAGS_CATEGORY,
  SIDE_BAGS_CATEGORY,
  TRAVEL_BAGS_CATEGORY,
  POUCH_BAGS_CATEGORY,
  POUCHES_CATEGORY,
  BAGS_MAIN_CATEGORY,
  WALLETS_CATEGORY,
  BELTS_CATEGORY,
  CARD_HOLDERS_CATEGORY,
  WALLETS_LEATHER_MAIN_CATEGORY,
  BUCKET_HATS_CATEGORY,
  HEADWEAR_MAIN_CATEGORY,
  SUNGLASSES_CATEGORY,
  EYEWEAR_MAIN_CATEGORY,
  NECKLACES_CATEGORY,
  BRACELETS_CATEGORY,
  RINGS_CATEGORY,
  JEWELRY_CATEGORY,
  JEWELRY_MAIN_CATEGORY,
  GLOVES_CATEGORY,
  SCARVES_CATEGORY,
  HANDKERCHIEFS_CATEGORY,
  OTHER_ACCESSORIES_MAIN_CATEGORY,
  BY_BRAND_CATEGORY,
  RUNNING_CATEGORY,
  SPORT_CATEGORY,
  SPORT_MAIN_CATEGORY,
  WELLNESS_CATEGORY,
  BEAUTY_CATEGORY,
  PERFUMES_CATEGORY,
  HOME_CATEGORY,
  HOME_WELLNESS_MAIN_CATEGORY,
  GIFTS_CATEGORY,
  GIFTS_MAIN_CATEGORY
} from '../category.constants';

export interface ParsedFilters {
  colors: string[];
  categories: string[];
  brands: string[];
  maxPrice: number | null;
  minPrice: number | null;
  keywords: string[];
  gender: string | null;
  isOnSale?: string;
  sources?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly brandService: BrandService,
    private readonly categoryService: CategoryService,
    private readonly colorService: ColorService,
  ) {}

  private COLOR_KEYWORDS = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple',
    'orange', 'brown', 'grey', 'gray', 'beige', 'navy', 'cream', 'khaki',
    'burgundy', 'silver', 'gold', 'multi', 'mauve', 'teal', 'coral', 'mint', 'lavender'
  ];

  private CATEGORY_SYNONYMS = {
    [T_SHIRTS_CATEGORY]: ['t-shirt', 'tshirt', 'tee', 't shirt', 'tank top', 'vest'],
    [SHIRTS_CATEGORY]: ['shirt', 'blouse', 'button down', 'button-up', 'dress shirt'],
    [JEANS_CATEGORY]: ['jeans', 'denim', 'pants', 'trousers'],
    [JACKETS_COATS_CATEGORY]: ['jacket', 'coat', 'blazer', 'suit jacket', 'jackets', 'coats', 'outerwear'],
    [DRESSES_CATEGORY]: ['dress', 'gown', 'frock', 'dresses'],
    [MOCCASINS_CATEGORY]: ['moccasin', 'moccasins'],
    [SHOES_MAIN_CATEGORY]: ['shoes', 'footwear', 'sneakers', 'trainers', 'boots', 'sandals'],
    [ACCESSORIES_MAIN_CATEGORY]: ['accessories', 'jewelry', 'watch', 'sunglasses', 'bag', 'hat', 'hats', 'belt', 'scarf', 'gloves', 'accessory'],
    [BOXERS_CATEGORY]: ['boxer', 'boxers', 'boxer shorts'],
    [POLO_SHIRTS_CATEGORY]: ['polo shirt', 'polo shirts', 'polo', 'collared shirt'],
    [JOGGERS_CATEGORY]: ['joggers', 'sweatpants', 'track pants', 'jogger'],
    [SWIMWEAR_CATEGORY]: ['swimwear', 'bikini', 'swimsuit', 'one piece', 'two piece', 'trunks', 'boardshorts'],
    [SNICKERS_CATEGORY]: ['snickers', 'sneakers'],
    [HATS_CATEGORY]: ['hat', 'hats', 'cap', 'caps', 'beanie', 'beret', 'bucket hat'],
    [BAGS_CATEGORY]: ['bag', 'bags', 'backpack', 'handbag', 'purse', 'tote', 'duffle', 'shoulder bag'],
    [SKIRTS_CATEGORY]: ['skirt', 'skirts', 'mini skirt', 'midi skirt', 'maxi skirt'],
    [SHORTS_CATEGORY]: ['shorts', 'bermuda', 'cutoffs', 'hot pants'],
    [LINGERIE_CATEGORY]: ['lingerie', 'nightwear', 'bra', 'panties', 'underwear', 'sleepwear', 'pyjamas', 'pajamas', 'nightgown', 'camisole', 'slip'],
    [TOPS_MAIN_CATEGORY]: ['top', 'tops', 'blouse', 'tank', 'camisole', 'crop top', 'tube top'],
    [CLOTHING_MAIN_CATEGORY]: ['clothing', 'apparel', 'garment', 'outfit', 'clothes', 'wear'],
    [TANKS_CATEGORY]: ['tank', 'tank top', 'sleeveless', 'vest'],
    [SWEATERS_CATEGORY]: ['sweater', 'sweaters', 'jumper', 'pullover'],
    [KNITWEAR_CATEGORY]: ['knitwear', 'knit', 'knitted', 'cardigan'],
    [BODYSUITS_CATEGORY]: ['bodysuit', 'bodysuits'],
    [OVERSHIRTS_CATEGORY]: ['overshirt', 'overshirts'],
    [BOTTOMS_MAIN_CATEGORY]: ['bottoms', 'pants', 'trousers', 'shorts', 'jeans'],
    [SKINNY_JEANS_CATEGORY]: ['skinny jeans'],
    [SLIM_JEANS_CATEGORY]: ['slim jeans'],
    [STRAIGHT_JEANS_CATEGORY]: ['straight jeans'],
    [PANTS_CATEGORY]: ['pants', 'trousers', 'slacks'],
    [TROUSERS_CATEGORY]: ['trousers', 'pants'],
    [MINI_SKIRTS_CATEGORY]: ['mini skirt', 'mini skirts'],
    [MAXI_SKIRTS_CATEGORY]: ['maxi skirt', 'maxi skirts'],
    [DRESSES_OVERALLS_MAIN_CATEGORY]: ['dresses and overalls', 'dress', 'overall'],
    [OVERALLS_CATEGORY]: ['overalls', 'dungarees', 'jumpsuit'],
    [BLAZERS_CATEGORY]: ['blazer', 'blazers'],
    [OUTERWEAR_MAIN_CATEGORY]: ['outerwear', 'coats', 'jackets'],
    [SUITS_CATEGORY]: ['suit', 'suits'],
    [BEACHWEAR_CATEGORY]: ['beachwear', 'beach outfit'],
    [BEACHWEAR_SWIMWEAR_MAIN_CATEGORY]: ['beachwear', 'swimwear'],
    [UNDERWEAR_CATEGORY]: ['underwear', 'undergarment', 'briefs'],
    [SOCKS_CATEGORY]: ['sock', 'socks'],
    [STRAPLESS_CATEGORY]: ['strapless'],
    [UNDERWEAR_LINGERIE_MAIN_CATEGORY]: ['underwear', 'lingerie'],
    [OVERSIZE_CATEGORY]: ['oversize', 'oversized'],
    [SPECIAL_FIT_MAIN_CATEGORY]: ['special fit', 'plus size'],
    [TRAINERS_CATEGORY]: ['trainer', 'trainers', 'sneaker', 'sneakers'],
    [SNEAKERS_CATEGORY]: ['sneaker', 'sneakers'],
    [BOOTS_CATEGORY]: ['boot', 'boots'],
    [SANDALS_CATEGORY]: ['sandal', 'sandals'],
    [FLIP_FLOPS_CATEGORY]: ['flip flop', 'flip flops', 'thong sandal'],
    [SLIPPERS_CATEGORY]: ['slipper', 'slippers', 'house shoes'],
    [ESPADRILLES_CATEGORY]: ['espadrille', 'espadrilles'],
    [ELEGANT_SHOES_CATEGORY]: ['elegant shoes', 'dress shoes'],
    [OXFORD_SHOES_CATEGORY]: ['oxford', 'oxford shoes'],
    [BACKPACKS_CATEGORY]: ['backpack', 'backpacks', 'rucksack'],
    [LAPTOP_BAGS_CATEGORY]: ['laptop bag', 'laptop case', 'computer bag'],
    [SIDE_BAGS_CATEGORY]: ['side bag', 'side bags', 'crossbody'],
    [TRAVEL_BAGS_CATEGORY]: ['travel bag', 'travel bags', 'duffle'],
    [POUCH_BAGS_CATEGORY]: ['pouch bag', 'pouch bags'],
    [POUCHES_CATEGORY]: ['pouch', 'pouches', 'fanny pack', 'belt bag'],
    [WALLETS_CATEGORY]: ['wallet', 'wallets', 'billfold'],
    [BELTS_CATEGORY]: ['belt', 'belts'],
    [CARD_HOLDERS_CATEGORY]: ['card holder', 'card holders'],
    [WALLETS_LEATHER_MAIN_CATEGORY]: ['leather wallet', 'wallets and leather'],
    [BUCKET_HATS_CATEGORY]: ['bucket hat', 'bucket hats'],
    [HEADWEAR_MAIN_CATEGORY]: ['headwear', 'hats'],
    [SUNGLASSES_CATEGORY]: ['sunglasses', 'shades'],
    [EYEWEAR_MAIN_CATEGORY]: ['eyewear', 'glasses'],
    [NECKLACES_CATEGORY]: ['necklace', 'necklaces'],
    [BRACELETS_CATEGORY]: ['bracelet', 'bracelets'],
    [RINGS_CATEGORY]: ['ring', 'rings'],
    [JEWELRY_CATEGORY]: ['jewelry', 'jewellery', 'accessory'],
    [GLOVES_CATEGORY]: ['glove', 'gloves'],
    [SCARVES_CATEGORY]: ['scarf', 'scarves'],
    [HANDKERCHIEFS_CATEGORY]: ['handkerchief', 'handkerchiefs', 'pocket square'],
    [OTHER_ACCESSORIES_MAIN_CATEGORY]: ['other', 'miscellaneous'],
    [BY_BRAND_CATEGORY]: ['by brand', 'brand'],
    [RUNNING_CATEGORY]: ['running', 'run'],
    [SPORT_CATEGORY]: ['sport', 'sports', 'athletic'],
    [WELLNESS_CATEGORY]: ['wellness', 'body', 'self care'],
    [BEAUTY_CATEGORY]: ['beauty', 'cosmetics'],
    [PERFUMES_CATEGORY]: ['perfume', 'perfumes', 'fragrance'],
    [HOME_CATEGORY]: ['home', 'household'],
    [HOME_WELLNESS_MAIN_CATEGORY]: ['home and wellness'],
    [GIFTS_CATEGORY]: ['gift', 'gifts', 'present'],
  };

  private BRAND_SYNONYMS = {
    'tommy hilfiger': ['tommy hilfiger', 'tommy h', 'hilfiger', 'של טומי', 'טומי ה', 'טומי הילפיגר', 'הילפיגר'],
    'calvin klein': ['calvin klein', 'calvin', 'klein', 'קלווין ק', 'קלוין ק', 'קלווין קליין', 'קלוין קליין'],
    'polo ralph lauren': ['polo ralph lauren', 'polo', 'ralph lauren', 'ראלף ל', 'פולו ראלף', 'פולו', 'ראלף לורן', 'פולו ראלף לורן'],
    "levi's": ["levi's", 'levis', 'levi','ליוויס', 'ליויס', 'ליווייס', 'לוי׳ס'],
    'nike': ['nike', 'נייק', 'נייקי'],
    'adidas': ['adidas', 'אדידס', 'אדידאס'],
    'converse': ['converse', 'אול-סטאר', 'אולסטאר', 'אול סטאר', 'קונברס', 'קונברס אולסטאר'],
    'jordan': ['jordan', 'ג׳ורדן', 'גורדן', 'ג׳ורדאן', "ג׳ורד"],
    'asos design': ["asos d","אסוס די"],
    'new balance': ['new balance', 'newbalance', 'ניובלאנס', 'ניו באלאנס', 'ניו בלאנס', 'ניו באלנס'],
    'champion': ['champion', 'צ׳מפיון', 'צמפיון'],
    'lacoste': ['lacoste', 'לקוסט', 'לאקוסט'],
    'hollister': ['hollister', 'הוליסטר'],
    'abercrombie': ['abercrombie', 'abercrombie and fitch', 'a&f', 'אברקרומבי', 'אברקרומבי אנד פיץ׳'],
    'allsaints': ['allsaints', 'all saints', 'אולסיינטס', 'אול סיינטס'],
    'ellesse': ['ellesse', 'אלסה'],
    'new era': ['new era', 'newera', 'ניו ארה', 'ניוארה'],
    'collusion': ['collusion', 'קולוז׳ן', 'קולוזן'],
    'skims': ['סקימס']
  };

  private HEBREW_CATEGORY_SYNONYMS = {
    [T_SHIRTS_CATEGORY]: ['חולצה', 'חולצות', 'טי שירט', 'טי-שירט', 'טישרט', 'טי שירטים', 'טי-שירטים'],
    [SHIRTS_CATEGORY]: ['חולצה', 'חולצות', 'חולצה מכופתרת', 'חולצות מכופתרות', 'חולצה אלגנט', 'חולצות אלגנט'],
    [JEANS_CATEGORY]: ['ג׳ינס', 'גינס', 'ג׳ינסים', 'גינסים', 'דנים', 'מכנס ג׳ינס', 'מכנסי ג׳ינס'],
    [JACKETS_COATS_CATEGORY]: ['מעיל', 'מעילים', 'ג׳קט', 'ג׳קטים', 'ז׳קט', 'ז׳קטים'],
    [DRESSES_CATEGORY]: ['שמלה', 'שמלות'],
    [MOCCASINS_CATEGORY]: ['מוקסין', 'מוקסינים'],
    [SHOES_MAIN_CATEGORY]: ['נעל', 'נעליים', 'סניקרס', 'סניקרסים', 'נעלי ספורט', 'נעלי עור', 'נעלי גברים', 'נעלי נשים', 'מגף', 'מגפיים', 'סנדל', 'סנדלים'],
    [ACCESSORIES_MAIN_CATEGORY]: ['אביזרים', 'אקססוריז', 'אביזר', 'שעון', 'שעונים', 'תיק', 'תיקים', 'כובע', 'כובעים', 'משקפיים', 'משקפי שמש', 'צמיד', 'צמידים', 'שרשרת', 'שרשראות', 'עגיל', 'עגילים', 'טבעת', 'טבעות', 'חגורה', 'חגורות', 'ארנק', 'ארנקים'],
    [BOXERS_CATEGORY]: ['בוקסר', 'בוקסרים'],
    [POLO_SHIRTS_CATEGORY]: ['פולו', 'חולצת פולו', 'חולצות פולו'],
    [JOGGERS_CATEGORY]: ['ג׳וגר', 'ג׳וגרים', 'מכנסי ג׳וגר'],
    [SWIMWEAR_CATEGORY]: ['בגד ים', 'בגדי ים', 'ביקיני', 'בגד-ים', 'בגד חוף'],
    [SNICKERS_CATEGORY]: ['סניקרס'],
    [HATS_CATEGORY]: ['כובע', 'כובעים'],
    [BAGS_CATEGORY]: ['תיק', 'תיקים'],
    [SKIRTS_CATEGORY]: ['חצאית', 'חצאיות'],
    [SHORTS_CATEGORY]: ['מכנסיים קצרים', 'שורטס'],
    [LINGERIE_CATEGORY]: ['לנז׳רי', 'הלבשה תחתונה', 'פיג׳מה', 'פיג׳מות'],
    [TOPS_MAIN_CATEGORY]: ['חולצות', 'טופים'],
    [CLOTHING_MAIN_CATEGORY]: ['בגדים'],
    [TANKS_CATEGORY]: ['גופיה', 'גופיות'],
    [SWEATERS_CATEGORY]: ['סוודר', 'סוודרים'],
    [KNITWEAR_CATEGORY]: ['סריג', 'סריגים'],
    [BODYSUITS_CATEGORY]: ['בגד גוף', 'בגדי גוף'],
    [OVERSHIRTS_CATEGORY]: ['אוברשירט', 'אוברשירטים'],
    [BOTTOMS_MAIN_CATEGORY]: ['מכנסיים', 'תחתונים'],
    [SKINNY_JEANS_CATEGORY]: ['סקיני ג׳ינס', 'ג׳ינס סקיני'],
    [SLIM_JEANS_CATEGORY]: ['סלים ג׳ינס', 'ג׳ינס סלים'],
    [STRAIGHT_JEANS_CATEGORY]: ['סטרייט ג׳ינס', 'ג׳ינס סטרייט'],
    [PANTS_CATEGORY]: ['מכנסיים'],
    [TROUSERS_CATEGORY]: ['מכנסי בד'],
    [MINI_SKIRTS_CATEGORY]: ['חצאית מיני', 'חצאיות מיני'],
    [MAXI_SKIRTS_CATEGORY]: ['חצאית מקסי', 'חצאיות מקסי'],
    [DRESSES_OVERALLS_MAIN_CATEGORY]: ['שמלות ואוברולים'],
    [OVERALLS_CATEGORY]: ['אוברול', 'אוברולים'],
    [BLAZERS_CATEGORY]: ['בלייזר', 'בלייזרים'],
    [OUTERWEAR_MAIN_CATEGORY]: ['הלבשת חוץ', 'מעילים'],
    [SUITS_CATEGORY]: ['חליפה', 'חליפות'],
    [BEACHWEAR_CATEGORY]: ['בגד חוף', 'בגדי חוף'],
    [BEACHWEAR_SWIMWEAR_MAIN_CATEGORY]: ['בגדי ים וחוף'],
    [UNDERWEAR_CATEGORY]: ['הלבשה תחתונה'],
    [SOCKS_CATEGORY]: ['גרב', 'גרביים'],
    [STRAPLESS_CATEGORY]: ['סטרפלס'],
    [UNDERWEAR_LINGERIE_MAIN_CATEGORY]: ['הלבשה תחתונה ולנז׳רי'],
    [OVERSIZE_CATEGORY]: ['אוברסייז'],
    [SPECIAL_FIT_MAIN_CATEGORY]: ['מידות מיוחדות'],
    [TRAINERS_CATEGORY]: ['נעלי ספורט', 'טריינרס'],
    [SNEAKERS_CATEGORY]: ['סניקרס'],
    [BOOTS_CATEGORY]: ['מגף', 'מגפיים'],
    [SANDALS_CATEGORY]: ['סנדל', 'סנדלים'],
    [FLIP_FLOPS_CATEGORY]: ['כפכפים', 'כפכפי אצבע', 'כפכף'],
    [SLIPPERS_CATEGORY]: ['נעלי בית'],
    [ESPADRILLES_CATEGORY]: ['אספדריל', 'אספדרילים'],
    [ELEGANT_SHOES_CATEGORY]: ['נעליים אלגנטיות'],
    [OXFORD_SHOES_CATEGORY]: ['נעלי אוקספורד'],
    [BACKPACKS_CATEGORY]: ['תיק גב', 'תיקי גב'],
    [LAPTOP_BAGS_CATEGORY]: ['תיק לפטופ', 'תיקי לפטופ'],
    [SIDE_BAGS_CATEGORY]: ['תיק צד', 'תיקי צד'],
    [TRAVEL_BAGS_CATEGORY]: ['תיק נסיעה', 'תיקי נסיעה'],
    [POUCH_BAGS_CATEGORY]: ['פאוץ׳', 'פאוצ׳ים'],
    [POUCHES_CATEGORY]: ['פאוץ׳', 'פאוצ׳ים'],
    [WALLETS_CATEGORY]: ['ארנק', 'ארנקים'],
    [BELTS_CATEGORY]: ['חגורה', 'חגורות'],
    [CARD_HOLDERS_CATEGORY]: ['מחזיק כרטיסים', 'מחזיקי כרטיסים'],
    [WALLETS_LEATHER_MAIN_CATEGORY]: ['ארנקים ועור'],
    [BUCKET_HATS_CATEGORY]: ['כובע באקט', 'כובעי באקט'],
    [HEADWEAR_MAIN_CATEGORY]: ['כובעים', 'אביזרי ראש'],
    [SUNGLASSES_CATEGORY]: ['משקפי שמש'],
    [EYEWEAR_MAIN_CATEGORY]: ['משקפיים'],
    [NECKLACES_CATEGORY]: ['שרשרת', 'שרשראות'],
    [BRACELETS_CATEGORY]: ['צמיד', 'צמידים'],
    [RINGS_CATEGORY]: ['טבעת', 'טבעות'],
    [JEWELRY_CATEGORY]: ['תכשיט', 'תכשיטים'],
    [GLOVES_CATEGORY]: ['כפפה', 'כפפות'],
    [SCARVES_CATEGORY]: ['צעיף', 'צעיפים'],
    [HANDKERCHIEFS_CATEGORY]: ['מטפחת', 'מטפחות'],
    [OTHER_ACCESSORIES_MAIN_CATEGORY]: ['אחר'],
    [BY_BRAND_CATEGORY]: ['לפי מותג'],
    [RUNNING_CATEGORY]: ['ריצה'],
    [SPORT_CATEGORY]: ['ספורט'],
    [WELLNESS_CATEGORY]: ['וולנס', 'גוף'],
    [BEAUTY_CATEGORY]: ['יופי', 'ביוטי'],
    [PERFUMES_CATEGORY]: ['בושם', 'בשמים'],
    [HOME_CATEGORY]: ['בית'],
    [HOME_WELLNESS_MAIN_CATEGORY]: ['בית ווולנס'],
    [GIFTS_CATEGORY]: ['מתנה', 'מתנות'],
  };

  private HEBREW_COLOR_SYNONYMS = {
    'red': ['אדום', 'אדומה', 'אדומים', 'אדומות'],
    'black': ['שחור', 'שחורה', 'שחורים', 'שחורות'],
    'white': ['לבן', 'לבנה', 'לבנים', 'לבנות'],
    'blue': ['כחול', 'כחולה', 'כחולים', 'כחולות'],
    'green': ['ירוק', 'ירוקה', 'ירוקים', 'ירוקות'],
    'yellow': ['צהוב', 'צהובה', 'צהובים', 'צהובות'],
    'pink': ['ורוד', 'ורודה', 'ורודים', 'ורודות'],
    'purple': ['סגול', 'סגולה', 'סגולים', 'סגולות'],
    'orange': ['כתום', 'כתומה', 'כתומים', 'כתומות'],
    'brown': ['חום', 'חומה', 'חומים', 'חומות'],
    'grey': ['אפור', 'אפורה', 'אפורים', 'אפורות', 'אפרפר'],
    'gray': ['אפור', 'אפורה', 'אפורים', 'אפורות', 'אפרפר'],
    'beige': ['בז׳', 'בז', 'בזים', 'בזות'],
    'navy': ['נייבי', 'כחול כהה'],
    'cream': ['קרם', 'שמנת'],
    'khaki': ['חאקי'],
    'burgundy': ['בורדו'],
    'silver': ['כסף', 'כסופה', 'כסופים', 'כסופות'],
    'gold': ['זהב', 'זהובה', 'זהובים', 'זהובות'],
    'multi': ['צבעוני', 'צבעונית', 'צבעוניים', 'צבעוניות', 'מולטי'],
    'mauve': ['סגלגל', 'סגלגלה', 'סגלגלים', 'סגלגלות'],
    'teal': ['טורקיז'],
    'coral': ['אלמוג', 'קורל'],
    'mint': ['מנטה'],
    'lavender': ['לבנדר', 'לוונדר', 'לונדר'],
    'stone': ['אבן']
  };

  // --- Hebrew price extraction ---
  private extractHebrewPrice(lowerQuery: string): { minPrice: number | null, maxPrice: number | null } {
    const hebrewPricePatterns = [
      { regex: /עד\s*(\d+)\s*(?:ש["׳]?(?:ח|קלים)?)/, type: 'max' },
      { regex: /בין\s*(\d+)\s*ל-?\s*(\d+)/, type: 'range' },
      { regex: /מקס(?:ימום|׳)?\s*(\d+)/, type: 'max' },
      { regex: /לפחות\s*(\d+)/, type: 'min' },
      { regex: /החל מ\s*(\d+)/, type: 'min' },
      { regex: /לא יותר מ\s*(\d+)/, type: 'max' },
      { regex: /יותר מ-?\s*(\d+)/, type: 'min' }, // NEW: 'יותר מ200' or 'יותר מ-200'
      { regex: /מינימום\s*(\d+)/, type: 'min' }, // NEW: 'מינימום 200'
    ];
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    for (const pat of hebrewPricePatterns) {
      const m = lowerQuery.match(pat.regex);
      if (m) {
        if (pat.type === 'max') maxPrice = parseInt(m[1]);
        if (pat.type === 'min') minPrice = parseInt(m[1]);
        if (pat.type === 'range') {
          minPrice = parseInt(m[1]);
          maxPrice = parseInt(m[2]);
        }
        break;
      }
    }
    return { minPrice, maxPrice };
  }

  // --- English price extraction ---
  private extractEnglishPrice(lowerQuery: string): { minPrice: number | null, maxPrice: number | null } {
    let minPrice: number | null = null;
    let maxPrice: number | null = null;
    const priceMatches = Array.from(lowerQuery.matchAll(/(\d+)\s*(?:ils?|shekel|₪|dollar|usd|\$|euro|eur|€)?/g));
    priceMatches.forEach(match => {
      const price = parseInt(match[1]);
      // Get context around the match (15 chars before and after)
      const before = lowerQuery.slice(Math.max(0, (match.index || 0) - 15), match.index);
      const after = lowerQuery.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 15);
      const context = before + after;
      if (/not\s*(over|above|more)/.test(context)) {
        maxPrice = price;
      } else if (/min(imum)?|over|above|from|more/.test(context)) {
        minPrice = price;
      } else if (/max(imum)?|under|below|less/.test(context)) {
        maxPrice = price;
      } else if (!maxPrice) {
        // Default to maxPrice if not set
        maxPrice = price;
      } else if (!minPrice) {
        // If maxPrice is set, assign to minPrice
        minPrice = price;
      }
    });
    // Validation: if both minPrice and maxPrice are set and max < min, swap them
    if (minPrice !== null && maxPrice !== null && maxPrice < minPrice) {
      const tmp = minPrice;
      minPrice = maxPrice;
      maxPrice = tmp;
    }
    return { minPrice, maxPrice };
  }

  // --- Hebrew category extraction ---
  private extractHebrewCategories(lowerQuery: string, dbCategories: string[]): string[] {
    const foundCategories = new Set<string>();
    Object.entries(this.HEBREW_CATEGORY_SYNONYMS).forEach(([cat, syns]) => {
      if (!dbCategories.includes(cat.toLowerCase())) return;
      if (syns.some(h => lowerQuery.includes(h))) foundCategories.add(cat);
    });
    return Array.from(foundCategories);
  }

  // --- English category extraction ---
  private extractEnglishCategories(lowerQuery: string, dbCategories: string[]): string[] {
    const foundCategories = new Set<string>();
    dbCategories.forEach(category => {
      if (lowerQuery.includes(category)) {
        foundCategories.add(ucfirst(category));
      }
    });
    Object.entries(this.CATEGORY_SYNONYMS).forEach(([category, synonyms]) => {
      if (!dbCategories.includes(category.toLowerCase())) return;
      synonyms.forEach(synonym => {
        let testQuery = lowerQuery;
        if (synonym === 'shirt' || synonym === 'shirts') {
          ['t-shirt', 'tshirt', 't shirt'].forEach(ts => {
            testQuery = testQuery.replace(new RegExp(ts, 'g'), '');
          });
        }
        if (testQuery.includes(synonym)) {
          foundCategories.add(category);
        }
      });
    });
    return Array.from(foundCategories);
  }

  // --- Hebrew color extraction ---
  private extractHebrewColors(lowerQuery: string, dbColors: string[]): string[] {
    const foundColors = new Set<string>();
    Object.entries(this.HEBREW_COLOR_SYNONYMS).forEach(([color, syns]) => {
      if (!dbColors.includes(color.toLowerCase())) return;
      if (syns.some(h => lowerQuery.includes(h))) foundColors.add(ucfirst(color));
    });
    return Array.from(foundColors);
  }

  // --- English color extraction ---
  private extractEnglishColors(lowerQuery: string, dbColors: string[]): string[] {
    const foundColors = new Set<string>();
    dbColors.forEach(color => {
      if (lowerQuery.includes(color)) {
        foundColors.add(ucfirst(color));
      }
    });
    this.COLOR_KEYWORDS.forEach(color => {
      if (lowerQuery.includes(color)) {
        foundColors.add(ucfirst(color));
      }
    });
    return Array.from(foundColors);
  }

  async parseSearchQuery(query: string): Promise<ParsedFilters> {
    const filters: ParsedFilters = {
      colors: [],
      categories: [],
      brands: [],
      maxPrice: null,
      minPrice: null,
      keywords: [],
      gender: null,
      isOnSale: null,
      sources: [],
    };
    const lowerQuery = query.toLowerCase();

    // Fetch all DB values for brands, categories, colors
    const [brandsRes, categoriesRes, colorsRes] = await Promise.all([
      this.brandService.findAll(0, 1000),
      this.categoryService.findAll(0, 1000, ''),
      this.colorService.findAll(0, 1000),
    ]);
    const dbBrands = (brandsRes.data || []).map((b: any) => b.name.toLowerCase());
    const dbCategories = (categoriesRes.data || []).map((c: any) => c.name.toLowerCase());
    const dbColors = (colorsRes.data || []).map((c: any) => c.name.toLowerCase());

    // --- Price extraction ---
    let priceResult = this.extractHebrewPrice(lowerQuery);
    if (priceResult.minPrice === null && priceResult.maxPrice === null) {
      priceResult = this.extractEnglishPrice(lowerQuery);
    }
    filters.minPrice = priceResult.minPrice;
    filters.maxPrice = priceResult.maxPrice;

    // --- Category extraction ---
    let categories = this.extractHebrewCategories(lowerQuery, dbCategories);
    if (!categories.length) {
      categories = this.extractEnglishCategories(lowerQuery, dbCategories);
    }
    filters.categories = categories;

    // --- Color extraction ---
    let colors = this.extractHebrewColors(lowerQuery, dbColors);
    if (!colors.length) {
      colors = this.extractEnglishColors(lowerQuery, dbColors);
    }
    filters.colors = colors;

    // Extract brands
    const foundBrands = new Set<string>();
    // Normalize function for brand matching
    function normalizeBrandStr(str: string) {
      return str.replace(/&/g, 'and').replace(/\band\b/g, 'and').replace(/\s+/g, ' ').trim();
    }
    const normalizedQuery = lowerQuery.replace(/&/g, 'and').replace(/\band\b/g, 'and').replace(/\s+/g, ' ').trim();
    dbBrands.forEach(brand => {
      if (normalizedQuery.includes(normalizeBrandStr(brand))) {
        foundBrands.add(ucfirst(brand));
      }
    });
    Object.entries(this.BRAND_SYNONYMS).forEach(([brand, synonyms]) => {
      if (!dbBrands.includes(brand.toLowerCase())) return;
      synonyms.forEach(synonym => {
        if (normalizedQuery.includes(normalizeBrandStr(synonym))) {
          foundBrands.add(normalizeBrandName(ucfirst(brand)));
        }
      });
    });
    filters.brands = Array.from(foundBrands).filter(Boolean);

    // Extract gender
    if (lowerQuery.includes('men') || lowerQuery.includes('male')) {
      filters.gender = 'Men';
    } else if (lowerQuery.includes('women') || lowerQuery.includes('female')) {
      filters.gender = 'Women';
    }

    // Extract general keywords (words that aren't colors, prices, or categories or brands)
    const words = query.toLowerCase().split(/\s+/);
    const foundKeywords = new Set<string>();
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (
        cleanWord.length > 2 &&
        !filters.colors.includes(cleanWord) &&
        !filters.categories.includes(cleanWord) &&
        !filters.brands.includes(cleanWord) &&
        isNaN(Number(cleanWord)) === false &&
        !['at', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'with', 'for', 'to', 'of', 'by', 'from', 'under', 'below', 'above', 'over', 'max', 'maximum', 'min', 'minimum', 'price', 'cost', 'ils', 'shekel', 'dollar', 'euro', 'usd', 'eur'].includes(cleanWord)
      ) {
        foundKeywords.add(cleanWord);
      }
    });
    filters.keywords = Array.from(foundKeywords);

    // --- Sale/Not On Sale detection ---
    if (
      lowerQuery.includes('במבצע') ||
      lowerQuery.includes('במחיר מבצע') ||
      /\bsale\b/.test(lowerQuery)
    ) {
      filters.isOnSale = 'Yes';
    } else if (/\b(not on sale|לא במבצע|במחיר מלא)\b/.test(lowerQuery)) {
      filters.isOnSale = 'False';
    }

    // --- Source detection ---
    const sourceKeywords = [
      { key: 'Factory54', patterns: [/\bfactory\b/, /\bfactory54\b/, /factory 54/, /פקטורי/] },
      { key: 'Terminalx', patterns: [/\bterminal\b/, /\bterminalx\b/, /terminal x/, /טרמינל/, /טרמינל איקס/] },
      { key: 'Asos', patterns: [/\basos\b/, /אסוס/] },
      { key: 'ItayBrands', patterns: [/\itay b\b/, /איתי בר/] },
      { key: 'Zara', patterns: [/\zara\b/, /זארה/] },

    ];
    filters.sources = sourceKeywords
      .filter(src => src.patterns.some(pat => pat.test(lowerQuery)))
      .map(src => src.key);

    return filters;
  }
} 