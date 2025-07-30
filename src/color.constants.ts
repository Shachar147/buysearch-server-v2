// 🎨 Color constants for clothing search engine
// =============================================================

// --- Color Enum ---
export enum Color {
  // Basic Colors
  BLACK = "Black",
  WHITE = "White",
  RED = "Red",
  BLUE = "Blue",
  GREEN = "Green",
  YELLOW = "Yellow",
  PINK = "Pink",
  PURPLE = "Purple",
  ORANGE = "Orange",
  BROWN = "Brown",
  GREY = "Grey",
  BEIGE = "Beige",

  // Shades and Fashion Variants
  NAVY = "Navy",
  LIGHT_BLUE = "Light Blue",
  SKY_BLUE = "Sky Blue",
  DARK_BLUE = "Dark Blue",
  ROYAL_BLUE = "Royal Blue", // distinct and common in fashion.
  SAGE = "Sage", // trendy muted green, popular in fashion/home.
  TURQUOISE = "Turquoise",
  MINT = "Mint",
  OLIVE = "Olive",
  KHAKI = "Khaki",
  CAMEL = "Camel",
  MUSTARD = "Mustard",
  CORAL = "Coral",
  SALMON = "Salmon",
  BORDEAUX = "Bordeaux",
  LAVENDER = "Lavender",
  LILAC = "Lilac",
  CHARCOAL = "Charcoal",
  IVORY = "Ivory",
  OFFWHITE = "Off White",
  CREAM = "Cream",
  TAUPE = "Taupe",
  GOLD = "Gold",
  SILVER = "Silver",
  COPPER = "Copper",
  EMERLAD = "Emerlad", // jewel-tone green, elegant and very common.
  BABY_PINK = "Baby Pink", // a specific and recognizable shade of light pink.
  ROSE = "Rose", // frequently used color name in fashion.
  TAN = "Tan", // a neutral brown, common in fashion.
  NUDE = "Nude", // essential for undergarments and fashion basics.
  BRONZE = "Bronze", // distinct from gold and copper; good addition.
  MOCHA = "Mocha",
  STONE = "Stone",
  INDIGO = "Indigo",

  // patterns - These are patterns, not colors, but very useful for a fashion filter system.
  STRIPED = "Stripped", 
  FLORAL = "Floral", 
  CHECKED = "Checked", 
  PLAID = "Plaid", 
  CAMOUFLAGE = "Camouflage", 
  LEOPARD = "Leopard", 
  ZEBRA = "Zebra",
  POLKA_DOT = "Polka Dot",
  PINSTRIPE = "Pinstripe",

  // finishes - Finishes, not colors, but often shown as filters.
  // SHINY = "Shiny",
  // GLITTER = "Glitter",

  // Again, not true "colors", but valuable for filtering fabric appearance.
  DENIM = "Denim",
  LIGHT_DENIM = "Light Denim",
  DARK_DENIM = "Dark Denim",
  WASHED_DENIM = "Washed Denim",
  RIPPED_DENIM = "Ripped Denim",

  // Multi and Misc
  MULTICOLOR = "Multicolor",
  METALLIC = "Metallic",
  TRANSPARENT = "Transparent",
};

export const colorNameToColor: Record<Color, string> = {
  // Basic Colors
  [Color.BLACK]: '#000000',
  [Color.WHITE]: '#FFFFFF',
  [Color.RED]: '#FF0000',
  [Color.BLUE]: '#0000FF',
  [Color.GREEN]: '#008000',
  [Color.YELLOW]: '#FFFF00',
  [Color.PINK]: '#FFC0CB',
  [Color.PURPLE]: '#800080',
  [Color.ORANGE]: '#FFA500',
  [Color.BROWN]: '#A52A2A',
  [Color.GREY]: '#808080',
  [Color.BEIGE]: '#F5F5DC',

  // Shades and Fashion Variants
  [Color.NAVY]: '#000080',
  [Color.LIGHT_BLUE]: '#ADD8E6',
  [Color.SKY_BLUE]: '#87CEEB',
  [Color.DARK_BLUE]: '#00008B',
  [Color.ROYAL_BLUE]: '#4169E1',
  [Color.SAGE]: '#B2AC88',
  [Color.TURQUOISE]: '#40E0D0',
  [Color.MINT]: '#98FF98',
  [Color.OLIVE]: '#808000',
  [Color.KHAKI]: '#F0E68C',
  [Color.CAMEL]: '#C19A6B',
  [Color.MUSTARD]: '#FFDB58',
  [Color.CORAL]: '#FF7F50',
  [Color.SALMON]: '#FA8072',
  [Color.BORDEAUX]: '#800020',
  [Color.LAVENDER]: '#E6E6FA',
  [Color.LILAC]: '#C8A2C8',
  [Color.CHARCOAL]: '#36454F',
  [Color.IVORY]: '#FFFFF0',
  [Color.OFFWHITE]: '#F0F0F0',
  [Color.CREAM]: '#FFFDD0',
  [Color.TAUPE]: '#483C32',
  [Color.GOLD]: '#FFD700',
  [Color.SILVER]: '#C0C0C0',
  [Color.COPPER]: '#B87333',
  [Color.EMERLAD]: '#50C878',
  [Color.BABY_PINK]: '#F4C2C2',
  [Color.ROSE]: '#FF007F',
  [Color.TAN]: '#D2B48C',
  [Color.NUDE]: '#FAD6BF',
  [Color.BRONZE]: '#CD7F32',
  [Color.INDIGO]: '#4B0082',

  // Patterns (approximate or symbolic)
  [Color.STRIPED]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/stripped.jpeg', // light grey placeholder
  [Color.FLORAL]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/floral.jpg',
  [Color.CHECKED]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/checked.jpeg', // dark grey
  [Color.PLAID]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/plaid.jpg', // firebrick red (common in plaid)
  [Color.CAMOUFLAGE]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/camouflage.jpg', // army green
  [Color.LEOPARD]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/leopard.jpeg', // goldenrod
  [Color.ZEBRA]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/zebra.jpeg', // white (symbolic)
  [Color.POLKA_DOT]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/polka-dot.jpg', // peach puff
  [Color.PINSTRIPE]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/pinstripe.avif', // slate gray


  // // Finishes
  // [Color.SHINY]: '#E5E4E2', // platinum
  // [Color.GLITTER]: '#D4AF37', // glittery gold


  // Denim Variants
  [Color.DENIM]: '#1560BD',
  [Color.LIGHT_DENIM]: '#A9C6E8',
  [Color.DARK_DENIM]: '#2B3856',
  [Color.WASHED_DENIM]: '#7FB2F0',
  [Color.RIPPED_DENIM]: '#87AFC7',

  // Misc
  [Color.MULTICOLOR]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/multicolor.jpg', // neutral placeholder
  [Color.METALLIC]: '#B0B0B0',
  [Color.TRANSPARENT]: 'https://buysearch.s3.eu-north-1.amazonaws.com/colors/transparent.png',
  [Color.MOCHA]: "#967969",
  [Color.STONE]: "#888C8D"
};

export const colorGroups = {
    reds: [Color.RED, Color.BORDEAUX, Color.CORAL, Color.SALMON, Color.ROSE],
    pinks: [Color.PINK, Color.BABY_PINK],
    oranges: [Color.ORANGE, Color.MUSTARD, Color.BRONZE, Color.COPPER],
    yellows: [Color.YELLOW, Color.GOLD],
    greens: [Color.GREEN, Color.SAGE, Color.TURQUOISE, Color.MINT, Color.OLIVE, Color.EMERLAD],
    blues: [Color.BLUE, Color.NAVY, Color.LIGHT_BLUE, Color.SKY_BLUE, Color.DARK_BLUE, Color.ROYAL_BLUE],
    purples: [Color.PURPLE, Color.LAVENDER, Color.LILAC, Color.INDIGO],
    neutrals: [Color.BLACK, Color.WHITE, Color.GREY, Color.CHARCOAL, Color.BEIGE, Color.IVORY, Color.OFFWHITE, Color.CREAM, Color.TAUPE, Color.STONE],
    browns: [Color.BROWN, Color.KHAKI, Color.CAMEL, Color.TAN, Color.NUDE, Color.MOCHA],
    denims: [Color.DENIM, Color.LIGHT_DENIM, Color.DARK_DENIM, Color.WASHED_DENIM, Color.RIPPED_DENIM],
    patterns: [Color.STRIPED, Color.FLORAL, Color.CHECKED, Color.PLAID, Color.CAMOUFLAGE, Color.LEOPARD, Color.ZEBRA, Color.POLKA_DOT, Color.PINSTRIPE],
    // finishes: [Color.SHINY, Color.GLITTER, Color.METALLIC],
    special: [Color.MULTICOLOR, Color.TRANSPARENT]
}

// Type for color synonyms
export type ColorSynonyms = {
  [K in Color]: { en: string[]; he: string[] }
};

/**
 * Maps scraped/found color keywords (English or Hebrew) to one or more canonical Color enum values.
 * Used to normalize free-text or scraped colors to the internal enum(s).
 */
export const COLOR_NORMALIZATION_MAP: Record<string, (Color|string)[]> = {
  // Basic Colors
  'black': [Color.BLACK],
  'שחור': [Color.BLACK],
  'white': [Color.WHITE],
  'לבן': [Color.WHITE],
  'red': [Color.RED],
  'אדום': [Color.RED],
  'blue': [Color.BLUE],
  'כחול': [Color.BLUE],
  'green': [Color.GREEN],
  'ירוק': [Color.GREEN],
  'yellow': [Color.YELLOW],
  'צהוב': [Color.YELLOW],
  'pink': [Color.PINK],
  'purple': [Color.PURPLE],
  'סגול': [Color.PURPLE],
  'orange': [Color.ORANGE],
  'כתום': [Color.ORANGE],
  'brown': [Color.BROWN],
  'חום': [Color.BROWN],
  'חמרה': [Color.BROWN],
  'grey': [Color.GREY],
  'gray': [Color.GREY],
  'אפור': [Color.GREY],
  'beige': [Color.BEIGE],
  'בז': [Color.BEIGE],

  // Shades and Fashion Variants
  'navy': [Color.NAVY],
  'navy blue': [Color.NAVY],
  'כחול כהה': [Color.NAVY],
  'light blue': [Color.LIGHT_BLUE],
  'כחול בהיר': [Color.LIGHT_BLUE],
  'sky blue': [Color.SKY_BLUE],
  'כחול שמיים': [Color.SKY_BLUE],
  'שמנת': [Color.CREAM],
  'dark blue': [Color.DARK_BLUE],
  'royal blue': [Color.ROYAL_BLUE],
  'sage': [Color.SAGE],
  'teal': [Color.TURQUOISE],
  'turquoise': [Color.TURQUOISE],
  'mint': [Color.MINT],
  'olive': [Color.OLIVE],
  'זית': [Color.OLIVE],
  'khaki': [Color.KHAKI],
  'קאקי': [Color.KHAKI],
  'camel': [Color.CAMEL],
  'גמל': [Color.CAMEL],
  'mustard': [Color.MUSTARD],
  'חרדל': [Color.MUSTARD],
  'coral': [Color.CORAL],
  'קורל': [Color.CORAL],
  'salmon': [Color.SALMON],
  'burgundy': [Color.BORDEAUX],
  'בורגונדי': [Color.BORDEAUX],
  'בורדו': [Color.BORDEAUX],
  'bordeaux': [Color.BORDEAUX],
  'dark red': [Color.BORDEAUX],
  'maroon': [Color.BORDEAUX],
  'lavender': [Color.LAVENDER],
  'לילך': [Color.LAVENDER],
  'lilac': [Color.LILAC],
  'charcoal': [Color.CHARCOAL],
  'ivory': [Color.IVORY],
  'שנהב': [Color.IVORY],
  'off white': [Color.OFFWHITE],
  'off-white': [Color.OFFWHITE],
  'offwhite': [Color.OFFWHITE],
  'אוף וייט': [Color.OFFWHITE],
  'אופייט': [Color.OFFWHITE],
  'אוף ויט': [Color.OFFWHITE],
  'אופויט': [Color.OFFWHITE],
  'אופ וייט': [Color.OFFWHITE],
  'cream': [Color.CREAM],
  'קרם': [Color.CREAM],
  'taupe': [Color.TAUPE],
  'gold': [Color.GOLD],
  'זהב': [Color.GOLD],
  'silver': [Color.SILVER],
  'כסף': [Color.SILVER],
  'copper': [Color.COPPER],
  'נחושת': [Color.COPPER],
  'emerald': [Color.EMERLAD],
  'אמרלד': [Color.EMERLAD],
  'baby pink': [Color.BABY_PINK],
  'ורוד בהיר': [Color.BABY_PINK],
  'rose': [Color.ROSE],
  'ורוד': [Color.PINK], // Hebrew for pink
  'tan': [Color.TAN],
  'nude': [Color.NUDE],
  'עירום': [Color.NUDE],
  'bronze': [Color.BRONZE],
  'ארד': [Color.BRONZE],

  // Patterns
  'striped': [Color.STRIPED],
  'פסים': [Color.STRIPED],
  'floral': [Color.FLORAL],
  'פרחוני': [Color.FLORAL],
  'checked': [Color.CHECKED],
  'משבצות': [Color.CHECKED],
  'plaid': [Color.PLAID],
  'קפלן': [Color.PLAID],
  'camouflage': [Color.CAMOUFLAGE],
  'הסוואה': [Color.CAMOUFLAGE],
  'leopard': [Color.LEOPARD],
  'נמר': [Color.LEOPARD],
  'zebra': [Color.ZEBRA],
  'זברה': [Color.ZEBRA],
  'polka dot': [Color.POLKA_DOT],
  'נקודות': [Color.POLKA_DOT],
  'pinstripe': [Color.PINSTRIPE],
  'פסים דקים': [Color.PINSTRIPE],

  // Finishes
  // 'shiny': [Color.SHINY],
  // 'מבריק': [Color.SHINY],
  // 'glitter': [Color.GLITTER],
  // 'נצנצים': [Color.GLITTER],

  // Denim
  'denim': [Color.DENIM],
  'דנים': [Color.DENIM],
  'light denim': [Color.LIGHT_DENIM],
  'dark denim': [Color.DARK_DENIM],
  'washed denim': [Color.WASHED_DENIM],
  'ripped denim': [Color.RIPPED_DENIM],

  // Misc
  'multicolor': [Color.MULTICOLOR],
  'רב צבעוני': [Color.MULTICOLOR],
  'metallic': [Color.METALLIC],
  'מתכתי': [Color.METALLIC],
  'transparent': [Color.TRANSPARENT],
  'שקוף': [Color.TRANSPARENT],

  'מוקה': [Color.MOCHA],
  'mocha': [Color.MOCHA],
  'stone': [Color.STONE],
  'אבן': [Color.STONE],
  "בז'": [Color.BEIGE],
  "בז׳": [Color.BEIGE],
  'ניוד': [Color.NUDE],
  'ירוק כהה': [Color.GREEN],
  'קאמל': [Color.CAMEL],
  'ורוד עתיק': [Color.PINK],
  'פיסטוק בהיר': [Color.GREEN],
  'תכלת בהיר': [Color.LIGHT_BLUE],
  'פיסטוק': [Color.GREEN],
  'אמבר': [Color.YELLOW],
  'ונילה': [Color.WHITE],
  'שמפניה': [Color.BRONZE],
  'שמפנייה': [Color.BRONZE],
  'טאופ': [Color.TAUPE],
  'מוקה בהיר': [Color.MOCHA],
  'טרקוטה': [Color.RED],
  'team navy blue 2': [Color.NAVY],
  'navy blue stripe': [Color.NAVY, Color.STRIPED],
  'red and navy blue': [Color.RED, Color.NAVY],
  'navy blue print': [Color.NAVY],
  'navy blue dot': [Color.NAVY, Color.POLKA_DOT],
  'navy blue pattern': [Color.NAVY],
  'white and navy blue': [Color.WHITE, Color.NAVY],
  'navy blue floral': [Color.NAVY, Color.FLORAL],
  'navy blue and cream': [Color.NAVY, Color.CREAM],
  'navy blue / red stripe': [Color.NAVY, Color.RED, Color.STRIPED],
  'navy blue check': [Color.NAVY, Color.CHECKED],
  'navy blue plaid': [Color.NAVY, Color.PLAID],
  'navy blue and red': [Color.NAVY, Color.RED],
  'navy blue and heather gray stripe': [Color.NAVY, Color.GREY, Color.STRIPED],
  'navy blue/heather gray': [Color.NAVY, Color.GREY],
};

/**
 * Search keywords for each color in English and Hebrew
 */
export const COLOR_SEARCH_KEYWORDS_MAP: ColorSynonyms = {
  [Color.BLACK]: {
    en: ['black', 'ebony', 'onyx', 'coal', 'jet'],
    he: ['שחור', 'שחורה', 'שחורים', 'שחורות', 'שחרחר']
  },
  [Color.WHITE]: {
    en: ['white', 'ivory', 'cream', 'off-white', 'bone', 'vanilla'],
    he: ['לבן', 'לבנה', 'לבנים', 'לבנות', 'שנהב', ' שמנת', 'לבנבן', ' וניל', 'ונילה']
  },
  [Color.RED]: {
    en: ['red', 'crimson', 'scarlet', 'ruby', 'cherry'],
    he: ['אדום', 'אדומה', 'אדומים', 'אדומות', 'ארגמן', 'אדמדם', 'טרקוטה']
  },
  [Color.BLUE]: {
    en: ['blue', 'azure', 'cobalt', 'sapphire'],
    he: ['כחול', 'כחולה', 'כחולים', 'כחולות', 'תכלת', 'כחלחל']
  },
  [Color.GREEN]: {
    en: ['green', 'emerald', 'jade', 'forest', 'mint', 'pistachio'],
    he: ['ירוק', 'ירוקה', 'ירוקים', 'ירוקות', 'אמרלד', 'ירקרק', 'פיסטוק']
  },
  [Color.YELLOW]: {
    en: ['yellow', 'golden', 'amber', 'lemon', 'canary'],
    he: ['צהוב', 'צהובה', 'צהובים', 'צהובות', 'צהבהב', ' אמבר']
  },
  [Color.PINK]: {
    en: ['pink', 'rose', 'blush', 'fuchsia', 'magenta'],
    he: ['ורוד', 'ורודה', 'ורודים', 'ורודות', 'ורוד בהיר', 'ורדרד']
  },
  [Color.PURPLE]: {
    en: ['purple', 'violet', 'lavender', 'plum', 'amethyst'],
    he: ['סגול', 'סגולה', 'סגולים', 'סגולות', 'לילך', 'סגלגל']
  },
  [Color.ORANGE]: {
    en: ['orange', 'tangerine', 'peach', 'coral', 'apricot'],
    he: ['כתום', 'כתומה', 'כתומים', 'כתומות', 'אפרסק', 'כתמתם']
  },
  [Color.BROWN]: {
    en: ['brown', 'chocolate', 'coffee', 'caramel'],
    he: ['חום', 'חומה', 'חומים', 'חומות', 'שוקולד']
  },
  [Color.MOCHA]: {
    en: ['mocha', 'coffee'],
    he: [' מוקה', 'מוקה-בהיר'],
  },
  [Color.STONE]: {
    en: ['stone', 'grey', 'gray', 'silver', 'charcoal', 'slate'],
    he: ['אבן', 'אפור', 'אפורה', 'אפורים', 'אפורות', 'כסף']
  },
  [Color.GREY]: {
    en: ['grey', 'gray', 'silver', 'charcoal', 'slate'],
    he: ['אפור', 'אפורה', 'אפורים', 'אפורות', 'כסף', 'אפרפר']
  },
  [Color.BEIGE]: {
    en: ['beige', 'tan', 'nude', 'cream', 'ecru'],
    he: ['בז',]
  },
  [Color.NAVY]: {
    en: ['navy', 'navy blue', 'marine', 'midnight blue'],
    he: ['כחול כהה', 'כחול ימי', 'כחול חצות', 'כחול רויאלי', 'כחול מלכותי', 'כחול רויאל']
  },
  [Color.LIGHT_BLUE]: {
    en: ['light blue', 'sky blue', 'baby blue', 'powder blue'],
    he: ['כחול בהיר', 'כחול שמיים', 'כחול תינוק', 'כחלחל', 'תכלת']
  },
  [Color.SKY_BLUE]: {
    en: ['sky blue', 'azure', 'celestial blue'],
    he: ['כחול שמיים', 'תכלת', 'כחול שמימי']
  },
  [Color.DARK_BLUE]: {
    en: ['dark blue', 'midnight', 'royal blue'],
    he: ['כחול כהה', 'כחול חצות', 'כחול מלכותי']
  },
  [Color.ROYAL_BLUE]: {
    en: ['royal blue', 'cobalt blue'],
    he: ['כחול מלכותי', 'כחול קובלט']
  },
  [Color.SAGE]: {
    en: ['sage', 'sage green', 'muted green'],
    he: ['מרווה', 'ירוק מרווה', 'ירוק עמום']
  },
  [Color.TURQUOISE]: {
    en: ['turquoise', 'aqua', 'cyan', 'teal', 'teal blue', 'blue green'],
    he: ['טורקיז', 'אקווה', 'ציאן', 'טורקיז כהה', 'כחול ירוק']
  },
  [Color.MINT]: {
    en: ['mint', 'mint green', 'pastel green'],
    he: ['מנטה', 'ירוק מנטה', 'ירוק פסטל']
  },
  [Color.OLIVE]: {
    en: ['olive', 'olive green', 'army green'],
    he: ['זית', 'ירוק זית', 'ירוק צבאי', 'ירקרק']
  },
  [Color.KHAKI]: {
    en: ['khaki', 'beige green', 'military'],
    he: ['קאקי', 'בז ירוק', 'צבאי']
  },
  [Color.CAMEL]: {
    en: ['camel', 'beige brown'],
    he: ['חום בהיר', 'בז חום', 'קאמל']
  },
  [Color.MUSTARD]: {
    en: ['mustard', 'yellow brown', 'golden yellow'],
    he: ['חרדל', 'צהוב חום', 'צהוב זהוב']
  },
  [Color.CORAL]: {
    en: ['coral', 'salmon pink', 'peach'],
    he: ['קורל', 'ורוד סלמון', 'אפרסק']
  },
  [Color.SALMON]: {
    en: ['salmon', 'pink orange', 'peach pink'],
    he: ['סלמון', 'כתום ורוד', 'אפרסק ורוד']
  },
  [Color.BORDEAUX]: {
    en: ['burgundy', 'wine', 'maroon', 'deep red', 'bordeaux', 'dark red', 'deep red', 'red'],
    he: ['בורגונדי', 'יין', 'אדום כהה', 'בורדו']
  },
  [Color.LAVENDER]: {
    en: ['lavender', 'light purple', 'lilac'],
    he: ['לילך', 'סגול בהיר', 'לילך', 'סגלגל']
  },
  [Color.LILAC]: {
    en: ['lilac', 'light purple', 'lavender'],
    he: ['לילך', 'סגול בהיר', 'לילך', 'סגלגל']
  },
  [Color.CHARCOAL]: {
    en: ['charcoal', 'dark grey', 'slate'],
    he: ['פחם', 'אפור כהה', 'צפחה']
  },
  [Color.IVORY]: {
    en: ['ivory', 'cream'],
    he: ['שנהב', 'לבן עמום', 'קרם']
  },
  [Color.OFFWHITE]: {
    en: ['off white', 'off-white', 'offwhite'],
    he: ['אוף וייט', 'אופייט', 'אופ וייט', 'אופויט', 'אוף ויט', 'לבן עמום', 'לבן דהוי', 'לבנבן', 'לבן בהיר'],
  },
  [Color.CREAM]: {
    en: ['cream', 'off white', 'ivory'],
    he: ['קרם', 'לבן עמום', 'שנהב', 'לבנבן']
  },
  [Color.TAUPE]: {
    en: ['taupe', 'grey brown', 'mushroom'],
    he: ['אפור חום', 'צבע פטרייה', 'טאופ', 'צבע פטריה']
  },
  [Color.GOLD]: {
    en: ['gold', 'golden', 'yellow gold'],
    he: ['זהב', 'זהוב', 'צהוב זהב']
  },
  [Color.SILVER]: {
    en: ['silver', 'metallic grey', 'platinum'],
    he: ['צבע כסף', 'אפור מתכתי', 'פלטינה', 'כסוף', 'אפרפר']
  },
  [Color.COPPER]: {
    en: ['copper', 'orange brown', 'rust'],
    he: ['נחושת', 'כתום חום', 'חלודה']
  },
  [Color.EMERLAD]: {
    en: ['emerald', 'green', 'jade'],
    he: ['אמרלד', 'ירוק', 'ירקרק']
  },
  [Color.BABY_PINK]: {
    en: ['baby pink', 'light pink', 'pastel pink'],
    he: ['ורוד בהיר', 'ורוד פסטל', 'ורוד בייבי', 'ורוד ביבי']
  },
  [Color.ROSE]: {
    en: ['rose', 'pink', 'blush'],
    he: ['ורוד', 'סומק']
  },
  [Color.TAN]: {
    en: [' tan ', 'beige', 'nude'],
    he: ['חום בהיר', 'בז', 'עירום']
  },
  [Color.NUDE]: {
    en: ['nude', 'beige', 'skin tone'],
    he: ['עירום', 'בז', 'גוון עור']
  },
  [Color.BRONZE]: {
    en: ['bronze', 'brown gold', 'copper brown'],
    he: ['ארד', 'חום זהב', 'נחושת חום', 'שמפניה', 'שמפנייה']
  },
  [Color.STRIPED]: {
    en: ['striped', 'stripes', 'pinstripe'],
    he: ['פסים', 'פסים דקים']
  },
  [Color.FLORAL]: {
    en: ['floral', 'flower', 'flowered'],
    he: ['פרחוני', 'פרחים']
  },
  [Color.CHECKED]: {
    en: ['checked', 'check', 'gingham'],
    he: ['משבצות', 'גינגהם']
  },
  [Color.PLAID]: {
    en: ['plaid', 'tartan', 'checkered'],
    he: ['קפלן', 'טאטן', 'משבצות']
  },
  [Color.CAMOUFLAGE]: {
    en: ['camouflage', 'camo', 'military'],
    he: ['הסוואה', 'קאמו', 'צבאי']
  },
  [Color.LEOPARD]: {
    en: ['leopard', 'animal print', 'wild'],
    he: ['נמר', 'פרינט חיות', 'פראי']
  },
  [Color.ZEBRA]: {
    en: ['zebra', 'animal print', 'black and white'],
    he: ['זברה', 'פרינט חיות', 'שחור לבן']
  },
  [Color.POLKA_DOT]: {
    en: ['polka dot', 'dots', 'spotted'],
    he: ['נקודות', 'מנוקד']
  },
  [Color.PINSTRIPE]: {
    en: ['pinstripe', 'thin stripes', 'striped'],
    he: ['פסים דקים', 'פסים']
  },
  // [Color.SHINY]: {
  //   en: ['shiny', 'glossy', 'metallic'],
  //   he: ['מבריק', 'מתכתי']
  // },
  // [Color.GLITTER]: {
  //   en: ['glitter', 'sparkly', 'sequin'],
  //   he: ['נצנצים', 'מנצנץ', 'פאייטים']
  // },
  [Color.DENIM]: {
    en: ['denim', 'jeans', 'blue denim'],
    he: ['דנים', 'גינס', 'דנים כחול']
  },
  [Color.LIGHT_DENIM]: {
    en: ['light denim', 'washed denim', 'light blue denim'],
    he: ['דנים בהיר', 'דנים כבוס', 'דנים כחול בהיר']
  },
  [Color.DARK_DENIM]: {
    en: ['dark denim', 'indigo denim', 'dark blue denim'],
    he: ['דנים כהה', 'דנים אינדיגו', 'דנים כחול כהה']
  },
  [Color.WASHED_DENIM]: {
    en: ['washed denim', 'distressed denim', 'vintage denim'],
    he: ['דנים כבוס', 'דנים שחוק', 'דנים וינטג']
  },
  [Color.RIPPED_DENIM]: {
    en: ['ripped denim', 'distressed denim', 'torn denim'],
    he: ['דנים קרוע', 'דנים שחוק', 'דנים קרוע']
  },
  [Color.MULTICOLOR]: {
    en: ['multicolor', 'colorful', 'rainbow'],
    he: ['רב צבעוני', 'צבעוני', 'קשת']
  },
  [Color.METALLIC]: {
    en: ['metallic', 'shiny', 'foil'],
    he: ['מתכתי', 'מבריק', 'נייר כסף']
  },
  [Color.TRANSPARENT]: {
    en: ['transparent', 'clear', 'see through'],
    he: ['שקוף']
  },
  [Color.INDIGO]: {
    en: ['indigo', 'dark purple', 'deep purple'],
    he: ['אינדיגו', 'סגול כהה']
  }
};

// Build keyword to color mapping
export const COLOR_KEYWORD_TO_COLOR: Record<string, Color> = {};

// Populate the keyword mapping
Object.entries(COLOR_SEARCH_KEYWORDS_MAP).forEach(([color, synonyms]) => {
  const colorEnum = color as Color;
  [...synonyms.en, ...synonyms.he].forEach(syn => {
    COLOR_KEYWORD_TO_COLOR[syn.toLowerCase()] = colorEnum;
  });
});

// Colors to ignore (not actual colors or too generic)
export const COLORS_TO_IGNORE = new Set([
  "ג'ינג'ר",
  "ג׳ינג׳ר",
  'דמוי-עץ', // ?
  'דמוי עץ',
  'טבעי',
  'color',
  'צבע',
  'multicolor',
  'רב צבעוני',
  'colorful',
  'צבעוני',
  'pattern',
  'דוגמה',
  'design',
  'עיצוב',
  'print',
  'הדפסה',
  'solid',
  'אחיד',
  'plain',
  'פשוט',
  'basic',
  'בסיסי',
  'classic',
  'קלאסי',
  'trendy',
  'אופנתי',
  'fashion',
  'אופנה',
  'style',
  'סטייל',
  'new',
  'חדש',
  'sale',
  'מבצע',
  'discount',
  'הנחה',
  'limited',
  'מוגבל',
  'exclusive',
  'אקסקלוסיבי',
  'premium',
  'פרימיום',
  'luxury',
  'יוקרה',
  'vintage',
  'וינטג',
  'retro',
  'רטרו',
  'modern',
  'מודרני',
  'contemporary',
  'עכשווי',
  'traditional',
  'מסורתי',
  'ethnic',
  'אתני',
  'bohemian',
  'בוהמי',
  'minimalist',
  'מינימליסטי',
  'elegant',
  'אלגנטי',
  'casual',
  'קזואל',
  'formal',
  'פורמלי',
  'sporty',
  'ספורטיבי',
  'romantic',
  'רומנטי',
  'sexy',
  'סקסי',
  'cute',
  'חמוד',
  'cool',
  'מגניב',
  'hot',
  'חם',
  'warm',
  'חם',
  'cool',
  'קר',
  'bright',
  'בהיר',
  'dark',
  'כהה',
  'light',
  'בהיר',
  'deep',
  'עמוק',
  'rich',
  'עשיר',
  'soft',
  'רך',
  'bold',
  'מודגש',
  'subtle',
  'עדין',
  'muted',
  'עמום',
  'vibrant',
  'חי',
  'pastel',
  'פסטל',
  'neon',
  'ניאון',
  'matte',
  'מט',
  'glossy',
  'מבריק',
  'satin',
  'סאטן',
  'velvet',
  'קטיפה',
  'silk',
  'משי',
  'cotton',
  'כותנה',
  'wool',
  'צמר',
  'leather',
  'עור',
  'suede',
  'סאד',
  'denim',
  'דנים',
  'linen',
  'פשתן',
  'polyester',
  'פוליאסטר',
  'acrylic',
  'אקריליק',
  'cashmere',
  'קשמיר',
  'angora',
  'אנגורה',
  'mohair',
  'מוהר',
  'alpaca',
  'אלפקה',
  'merino',
  'מרינו',
  'fleece',
  'פליס',
  'jersey',
  'גרסי',
  'rib',
  'צלעות',
  'cable',
  'כבל',
  'lace',
  'תחרה',
  'mesh',
  'רשת',
  'knit',
  'סריג',
  'woven',
  'ארוג',
  'embroidered',
  'רקמה',
  'printed',
  'מודפס',
  'painted',
  'צבוע',
  'dyed',
  'צבוע',
  'bleached',
  'מולבן',
  'distressed',
  'שחוק',
  'faded',
  'דהוי',
  'worn',
  'בלוי',
  'new',
  'חדש',
  'fresh',
  'טרי',
  'clean',
  'נקי',
  'dirty',
  'מלוכלך',
  'stained',
  'מוכתם',
  'torn',
  'קרוע',
  'ripped',
  'קרוע',
  'hole',
  'חור',
  'holes',
  'חורים',
  'damaged',
  'פגום',
  'perfect',
  'מושלם',
  'flawless',
  'ללא פגמים',
  'brand new',
  'חדש לגמרי',
  'used',
  'משומש',
  'second hand',
  'יד שנייה',
  'vintage',
  'וינטג',
  'antique',
  'עתיק',
  'rare',
  'נדיר',
  'unique',
  'ייחודי',
  'one of a kind',
  'יחיד מסוגו',
  'limited edition',
  'מהדורה מוגבלת',
  'exclusive',
  'אקסקלוסיבי',
  'premium',
  'פרימיום',
  'luxury',
  'יוקרה',
  'high end',
  'גבוה',
  'designer',
  'מעצב',
  'branded',
  'מותג',
  'generic',
  'גנרי',
  'no brand',
  'ללא מותג',
  'unbranded',
  'ללא מותג',
  'original',
  'מקורי',
  'authentic',
  'אותנטי',
  'genuine',
  'אמיתי',
  'real',
  'אמיתי',
  'fake',
  'מזויף',
  'counterfeit',
  'מזויף',
  'replica',
  'רפליקה',
  'copy',
  'עותק',
  'imitation',
  'חיקוי',
  'similar',
  'דומה',
  'alike',
  'דומה',
  'matching',
  'תואם',
  'coordinated',
  'מתואם',
  'complementary',
  'משלים',
  'contrasting',
  'מנוגד',
  'opposite',
  'הפוך',
  'different',
  'שונה',
  'same',
  'זהה',
  'identical',
  'זהה',
  'similar',
  'דומה',
  'alike',
  'דומה',
  'matching',
  'תואם',
  'coordinated',
  'מתואם',
  'complementary',
  'משלים',
  'contrasting',
  'מנוגד',
  'opposite',
  'הפוך',
  'different',
  'שונה',
  'same',
  'זהה',
  'identical',
  'זהה',
]);

// --- Color Extraction and Normalization Functions ---

/**
 * Extract colors from a product title using keyword matching and normalization
 * @param title Product title
 * @param apiColors Colors from API (optional)
 * @param source Source name for logging (optional)
 * @returns Array of normalized color names that exist in the Color enum
 */
export function extractColors(title: string, apiColors: string[] = [], source?: string): string[] {
  if (!title) return [];
  
  const lowerTitle = title.toLowerCase();
  const colorsSet = new Set<string>();
  
  // Add API colors first (if provided)
  if (apiColors.length > 0) {
    apiColors.forEach(color => {
      const normalized = normalizeColor(color, source);
      if (normalized) colorsSet.add(normalized);
    });
  }
  
  // Add keyword-based detection from title
  Object.keys(COLOR_NORMALIZATION_MAP).forEach(keyword => {
    if (lowerTitle.includes(` ${keyword.toLowerCase()}`) || lowerTitle.includes(`${keyword.toLowerCase()} `) || lowerTitle == keyword.toLowerCase()) {
      const mappedColors = COLOR_NORMALIZATION_MAP[keyword];
      mappedColors.forEach(color => {
        if (typeof color === 'string' && Object.values(Color).includes(color as Color)) {
          colorsSet.add(color);
        }
      });
    }
  });

  Object.keys(COLOR_SEARCH_KEYWORDS_MAP).forEach((color) => {
    const synonyms = [...COLOR_SEARCH_KEYWORDS_MAP[color].he, ...COLOR_SEARCH_KEYWORDS_MAP[color].en];
    synonyms.forEach(synonym => {
      if (lowerTitle.includes(synonym.toLowerCase())) {
        colorsSet.add(color);
      }
    });
  });
  
  return Array.from(colorsSet).filter(color => color && !COLORS_TO_IGNORE.has(color.toLowerCase()));
}

/**
 * Normalize a color name to a Color enum value
 * @param colorName The color name to normalize
 * @param source Source name for logging (optional)
 * @returns Normalized color name or null if not found
 */
export function normalizeColor(colorName: string, source?: string): string | null {
  if (!colorName) return null;
  
  const normalizedName = colorName.trim().toLowerCase();
  
  // Check if it's already a valid enum value
  if (Object.values(Color).includes(colorName as Color)) {
    return colorName;
  }
  
  // Check normalization map
  const mappedColors = COLOR_NORMALIZATION_MAP[normalizedName];
  if (mappedColors && mappedColors.length > 0) {
    const firstColor = mappedColors[0];
    if (typeof firstColor === 'string' && Object.values(Color).includes(firstColor as Color)) {
      return firstColor;
    }
  }
  
  // Check keyword mapping
  const keywordColor = COLOR_KEYWORD_TO_COLOR[normalizedName];
  if (keywordColor && Object.values(Color).includes(keywordColor)) {
    return keywordColor;
  }

  // Hebrew color mappings
  const hebrewColorMappings = [
    { hebrew: "ורוד", color: Color.PINK },
    { hebrew: "שחור", color: Color.BLACK },
    { hebrew: "אדום", color: Color.RED },
    { hebrew: "לבן", color: Color.WHITE },
    { hebrew: "כחול", color: Color.BLUE },
    { hebrew: "ירוק", color: Color.GREEN },
    { hebrew: "צהוב", color: Color.YELLOW },
    { hebrew: "סגול", color: Color.PURPLE },
    { hebrew: "כתום", color: Color.ORANGE },
    { hebrew: "חום", color: Color.BROWN },
    { hebrew: "אפור", color: Color.GREY },
    { hebrew: "בז", color: Color.BEIGE }
  ];

  for (const mapping of hebrewColorMappings) {
    if (normalizedName.includes(mapping.hebrew)) {
      return mapping.color;
    }
  }
  
  // Log warning for missing color mapping
  if (source && !COLORS_TO_IGNORE.has(normalizedName)) {
    console.warn(`\x1b[93m⚠️  [${source}] Missing color mapping: "${colorName}" - please add to COLOR_NORMALIZATION_MAP\x1b[0m`);
  }
  
  return null;
}

/**
 * Convert Hebrew color names to English color names
 * @param hebrewColors Array of Hebrew color names
 * @param source Source name for logging (optional)
 * @returns Array of English color names that exist in the Color enum
 */
export function convertHebrewColors(hebrewColors: string[], source?: string): string[] {
  const englishColors = new Set<string>();
  
  hebrewColors.forEach(hebrewColor => {
    const normalizedHebrew = hebrewColor.trim().toLowerCase();
    
    // Check normalization map for Hebrew keywords
    const mappedColors = COLOR_NORMALIZATION_MAP[normalizedHebrew];
    if (mappedColors && mappedColors.length > 0) {
      const firstColor = mappedColors[0];
      if (typeof firstColor === 'string' && Object.values(Color).includes(firstColor as Color)) {
        englishColors.add(firstColor);
        return;
      }
    }
    
    // Check keyword mapping
    const keywordColor = COLOR_KEYWORD_TO_COLOR[normalizedHebrew];
    if (keywordColor && Object.values(Color).includes(keywordColor)) {
      englishColors.add(keywordColor);
      return;
    }
    
    // Hebrew color mappings
    const hebrewColorMappings = [
      { hebrew: "ורוד", color: Color.PINK },
      { hebrew: "שחור", color: Color.BLACK },
      { hebrew: "אדום", color: Color.RED },
      { hebrew: "לבן", color: Color.WHITE },
      { hebrew: "כחול", color: Color.BLUE },
      { hebrew: "ירוק", color: Color.GREEN },
      { hebrew: "צהוב", color: Color.YELLOW },
      { hebrew: "סגול", color: Color.PURPLE },
      { hebrew: "כתום", color: Color.ORANGE },
      { hebrew: "חום", color: Color.BROWN },
      { hebrew: "אפור", color: Color.GREY },
      { hebrew: "בז", color: Color.BEIGE }
    ];

    let hebrewColorFound = false;
    for (const mapping of hebrewColorMappings) {
      if (normalizedHebrew.includes(mapping.hebrew)) {
        englishColors.add(mapping.color);
        hebrewColorFound = true;
        break;
      }
    }

    if (!hebrewColorFound) {
      // Log warning for missing Hebrew color mapping
      if (source && !COLORS_TO_IGNORE.has(normalizedHebrew)) {
        console.warn(`\x1b[93m⚠️  [${source}] Missing Hebrew color mapping: "${hebrewColor}" - please add to COLOR_NORMALIZATION_MAP\x1b[0m`);
      }
    }
  });
  
  return Array.from(englishColors);
}

/**
 * Enhanced color extraction that handles both Hebrew and English colors
 * @param title Product title
 * @param apiColors Colors from API
 * @param source Source name for logging (optional)
 * @returns Array of normalized color names that exist in the Color enum
 */
export function extractColorsWithHebrew(title: string, apiColors: string[], source?: string): string[] {
  // First, convert any Hebrew colors from API
  const convertedApiColors = convertHebrewColors(apiColors, source);
  
  // Then extract colors from title (this already handles English)
  const titleColors = extractColors(title, [], source);
  
  // Combine both sets
  const allColors = new Set([...convertedApiColors, ...titleColors]);
  
  return Array.from(allColors).filter(color => color && !COLORS_TO_IGNORE.has(color.toLowerCase()));
}

/**
 * Get all color keywords for search functionality
 * @returns Array of all color keywords (English and Hebrew)
 */
export function getAllColorKeywords(): string[] {
  const keywords = new Set<string>();
  
  // Add all normalization map keys
  Object.keys(COLOR_NORMALIZATION_MAP).forEach(key => keywords.add(key));
  
  // Add all keyword mapping keys
  Object.keys(COLOR_KEYWORD_TO_COLOR).forEach(key => keywords.add(key));
  
  return Array.from(keywords);
}

/**
 * Get color synonyms for search functionality
 * @returns Object with color synonyms for English and Hebrew
 */
export function getColorSynonyms(): Record<string, { en: string[], he: string[] }> {
  return COLOR_SEARCH_KEYWORDS_MAP;
}