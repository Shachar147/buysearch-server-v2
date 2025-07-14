// Category configuration for normalization and hierarchy
// =====================================================

export interface CategoryConfig {
  id: string;
  name: string;
  englishSynonyms: string[];
  hebrewSynonyms: string[];
  parents?: string[]; // array of parent ids
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  // Accessories
  { id: "accessories", name: "Accessories", englishSynonyms: ["Accessory", "Accessories"], hebrewSynonyms: ["אקססוריז"] },
  { id: "bags", name: "Bags", englishSynonyms: ["Bag", "Bags", "Backpack", "Purse", "Tote"], hebrewSynonyms: ["תיק", "תיקים"], parents: ["accessories"] },
  { id: "belts", name: "Belts", englishSynonyms: ["Belt", "Belts"], hebrewSynonyms: ["חגורה", "חגורות"], parents: ["accessories"] },
  { id: "socks", name: "Socks", englishSynonyms: ["Sock", "Socks"], hebrewSynonyms: ["גרב", "גרביים"], parents: ["accessories", "footwear", "shoes"] },
  { id: "hats", name: "Hats", englishSynonyms: ["Hat", "Hats", "Cap", "Caps", "Beanie", "Beret"], hebrewSynonyms: ["כובע", "כובעים", "ברט", "כובעי מצחיה"], parents: ["accessories"] },

  // Footwear
  { id: "footwear", name: "Footwear", englishSynonyms: ["Footwear"], hebrewSynonyms: ["הנעלה"] },
  { id: "shoes", name: "Shoes", englishSynonyms: ["Shoe", "Shoes", "Sneaker", "Sneakers"], hebrewSynonyms: ["נעל", "נעליים"], parents: ["footwear"] },
  // --- Shoe subcategories ---
  { id: "trainers", name: "Trainers", englishSynonyms: ["Trainer", "Trainers", "Sneaker", "Sneakers", "Athletic Shoes"], hebrewSynonyms: ["נעלי ספורט"], parents: ["shoes", "footwear"] },
  { id: "running-trainers", name: "Running Trainers", englishSynonyms: ["Running Trainer", "Running Trainers", "Running Shoes"], hebrewSynonyms: ["נעלי ריצה"], parents: ["trainers", "shoes", "footwear"] },
  { id: "sandals", name: "Sandals", englishSynonyms: ["Sandal", "Sandals"], hebrewSynonyms: ["סנדל", "סנדלים"], parents: ["shoes", "footwear"] },
  { id: "sliders-flipflops", name: "Sliders & Flip flops", englishSynonyms: ["Slider", "Sliders", "Flip flop", "Flip flops", "Flip-flop", "Flip-flops"], hebrewSynonyms: ["כפכף", "כפכפים"], parents: ["shoes", "footwear"] },
  { id: "boots", name: "Boots", englishSynonyms: ["Boot", "Boots"], hebrewSynonyms: ["מגף", "מגפיים"], parents: ["shoes", "footwear"] },
  { id: "loafers", name: "Loafers", englishSynonyms: ["Loafer", "Loafers"], hebrewSynonyms: ["מוקסין", "מוקסינים"], parents: ["shoes", "footwear"] },
  { id: "slippers", name: "Slippers", englishSynonyms: ["Slipper", "Slippers"], hebrewSynonyms: ["נעלי בית"], parents: ["shoes", "footwear"] },

  // Clothing
  { id: "clothing", name: "Clothing", englishSynonyms: ["Clothing", "Apparel", "Garment", "Garments"], hebrewSynonyms: ["ביגוד", "לבוש"] },
  { id: "shirts", name: "Shirts", englishSynonyms: ["Shirt", "Shirts", "Blouse", "Blouses", "Button-down"], hebrewSynonyms: ["חולצה", "חולצות"], parents: ["clothing"] },
  { id: "tshirts", name: "T-Shirts", englishSynonyms: ["T-Shirt", "T-Shirts", "Tee", "Tees"], hebrewSynonyms: ["טי שירט", "טי-שירט", "חולצת טי"], parents: ["clothing"] },
  { id: "jeans", name: "Jeans", englishSynonyms: ["Jean", "Jeans", "Denim"], hebrewSynonyms: ["ג'ינס", "דנים"], parents: ["clothing", "pants"] },
  { id: "pants", name: "Pants", englishSynonyms: ["Pant", "Pants", "Trousers", "Slacks"], hebrewSynonyms: ["מכנס", "מכנסיים"], parents: ["clothing"] },
  { id: "shorts", name: "Shorts", englishSynonyms: ["Short", "Shorts"], hebrewSynonyms: ["שורט", "שורטים"], parents: ["clothing"] },
  { id: "dresses", name: "Dresses", englishSynonyms: ["Dress", "Dresses"], hebrewSynonyms: ["שמלה", "שמלות"], parents: ["clothing"] },
  { id: "skirts", name: "Skirts", englishSynonyms: ["Skirt", "Skirts"], hebrewSynonyms: ["חצאית", "חצאיות"], parents: ["clothing"] },

  // Outerwear
  { id: "outerwear", name: "Outerwear", englishSynonyms: ["Outerwear", "Jacket", "Jackets", "Coat", "Coats", "Blazer", "Blazers"], hebrewSynonyms: ["מעיל", "מעילים", "ז'קט", "ז'קטים"] },
  { id: "jackets", name: "Jackets", englishSynonyms: ["Jacket", "Jackets"], hebrewSynonyms: ["ז'קט", "ז'קטים"], parents: ["outerwear"] },
  { id: "coats", name: "Coats", englishSynonyms: ["Coat", "Coats"], hebrewSynonyms: ["מעיל", "מעילים"], parents: ["outerwear"] },

  // Underwear
  { id: "underwear", name: "Underwear", englishSynonyms: ["Underwear", "Brief", "Briefs", "Boxer", "Boxers", "Panty", "Panties"], hebrewSynonyms: ["תחתון", "תחתונים", "בוקסר", "בוקסרים"], parents: ["clothing"] },
  { id: "bras", name: "Bras", englishSynonyms: ["Bra", "Bras"], hebrewSynonyms: ["חזיה", "חזיות"], parents: ["underwear"] },
  { id: "lingerie", name: "Lingerie", englishSynonyms: ["Lingerie"], hebrewSynonyms: ["הלבשה תחתונה"], parents: ["underwear"] },

  // Swimwear
  { id: "swimwear", name: "Swimwear", englishSynonyms: ["Swimwear", "Swimsuit", "Swimsuits", "Bikini", "Bikinis", "Trunks"], hebrewSynonyms: ["בגד ים", "בגדי ים", "ביקיני", "טרנקס"], parents: ["clothing"] },

  // Jewelry
  { id: "jewelry", name: "Jewelry", englishSynonyms: ["Jewelry", "Jewellery", "Ring", "Rings", "Necklace", "Necklaces", "Bracelet", "Bracelets", "Earring", "Earrings"], hebrewSynonyms: ["תכשיט", "תכשיטים", "טבעת", "טבעות", "שרשרת", "שרשראות", "צמיד", "צמידים", "עגיל", "עגילים"] },

  // Sportswear
  { id: "sportswear", name: "Sportswear", englishSynonyms: ["Sportswear", "Activewear", "Gymwear", "Athletic Wear"], hebrewSynonyms: ["בגדי ספורט", "ספורט"] },

  // Suits
  { id: "suits", name: "Suits", englishSynonyms: ["Suit", "Suits"], hebrewSynonyms: ["חליפה", "חליפות"], parents: ["clothing"] },
]; 