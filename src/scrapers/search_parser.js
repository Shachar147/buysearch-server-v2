// search_parser.js - Parse free text search queries into structured filters
// =============================================================

const COLOR_KEYWORDS = [
  "black", "white", "red", "blue", "green", "yellow", "pink", "purple", 
  "orange", "brown", "grey", "gray", "beige", "navy", "cream", "khaki", 
  "burgundy", "silver", "gold", "multi", "mauve", "teal", "coral", "mint", "lavender"
];

const PRICE_PATTERNS = [
  /(\d+)\s*(?:ils?|shekel|₪)/i,           // "100 ils", "50 shekel", "75₪"
  /(\d+)\s*(?:dollar|usd|\$)/i,           // "50 dollar", "25 usd", "$30"
  /(\d+)\s*(?:euro|eur|€)/i,              // "40 euro", "35 eur", "€45"
  /price\s*(?:under|below|less\s+than|max|maximum)\s*(\d+)/i,  // "price under 100"
  /(\d+)\s*(?:and\s+)?under/i,            // "100 and under"
  /max\s*(\d+)/i,                         // "max 100"
  /under\s*(\d+)/i,                       // "under 100"
  /below\s*(\d+)/i,                       // "below 100"
  /less\s+than\s*(\d+)/i,                 // "less than 100"
];

const CATEGORY_SYNONYMS = {
  // Clothing
  "t-shirts": ["t-shirt", "tshirt", "tee", "t shirt", "tank top", "vest"],
  "shirts": ["shirt", "blouse", "button down", "button-up", "dress shirt"],
  "jeans": ["jeans", "denim", "pants", "trousers"],
  "jacket": ["jacket", "coat", "blazer", "suit jacket"],
  "dress": ["dress", "gown", "frock"],
  "shoes": ["shoes", "footwear", "sneakers", "trainers", "boots", "sandals"],
  "accessories": ["accessories", "jewelry", "watch", "sunglasses", "bag", "hat"],
  
  // Brands
  "tommy hilfiger": ["tommy hilfiger", "tommy h", "hilfiger"],
  "calvin klein": ["calvin klein", "calvin", "klein"],
  "polo ralph lauren": ["polo ralph lauren", "polo", "ralph lauren"],
  "levi's": ["levi's", "levis", "levi"],
  "nike": ["nike"],
  "adidas": ["adidas"],
  "converse": ["converse"],
  "jordan": ["jordan"],
  "new balance": ["new balance", "newbalance"],
  "champion": ["champion"],
  "lacoste": ["lacoste"],
  "hollister": ["hollister"],
  "abercrombie": ["abercrombie", "abercrombie and fitch", "a&f"],
  "allsaints": ["allsaints", "all saints"],
  "ellesse": ["ellesse"],
  "new era": ["new era", "newera"],
  "collusion": ["collusion"]
};

function parseSearchQuery(query) {
  const filters = {
    colors: [],
    categories: [],
    brands: [],
    maxPrice: null,
    minPrice: null,
    keywords: [],
    gender: null
  };

  const lowerQuery = query.toLowerCase();
  
  // Extract colors
  COLOR_KEYWORDS.forEach(color => {
    if (lowerQuery.includes(color)) {
      filters.colors.push(color);
    }
  });

  // Extract price information (support both min and max in a single query)
  const priceMatches = Array.from(lowerQuery.matchAll(/(\d+)\s*(?:ils?|shekel|₪|dollar|usd|\$|euro|eur|€)?/g));
  priceMatches.forEach(match => {
    const price = parseInt(match[1]);
    // Get context around the match (15 chars before and after)
    const before = lowerQuery.slice(Math.max(0, match.index - 15), match.index);
    const after = lowerQuery.slice(match.index + match[0].length, match.index + match[0].length + 15);
    const context = before + after;
    if (/not\s*(over|above|more)/.test(context)) {
      filters.maxPrice = price;
    } else if (/min(imum)?|over|above|more/.test(context)) {
      filters.minPrice = price;
    } else if (/max(imum)?|under|below|less/.test(context)) {
      filters.maxPrice = price;
    } else if (!filters.maxPrice) {
      // Default to maxPrice if not set
      filters.maxPrice = price;
    } else if (!filters.minPrice) {
      // If maxPrice is set, assign to minPrice
      filters.minPrice = price;
    }
  });

  // Extract categories and brands
  const foundCategories = new Set();
  const foundBrands = new Set();
  
  Object.entries(CATEGORY_SYNONYMS).forEach(([category, synonyms]) => {
    synonyms.forEach(synonym => {
      let testQuery = lowerQuery;
      // Exclude t-shirt variants before matching 'shirt' or 'shirts'
      if (synonym === 'shirt' || synonym === 'shirts') {
        ["t-shirt", "tshirt", "t shirt"].forEach(ts => {
          testQuery = testQuery.replace(new RegExp(ts, 'g'), '');
        });
      }
      if (testQuery.includes(synonym)) {
        // Check if it's likely a brand (capitalized in original query or known brand)
        const originalWords = query.split(' ');
        const isBrand = originalWords.some(word => 
          word.toLowerCase() === synonym && 
          word[0] === word[0].toUpperCase()
        ) || ['tommy hilfiger', 'calvin klein', 'polo ralph lauren', 'levi\'s', 'nike', 'adidas', 'converse', 'jordan', 'new balance', 'champion', 'lacoste', 'hollister', 'abercrombie', 'allsaints', 'ellesse', 'new era', 'collusion'].includes(category);
        if (isBrand) {
          foundBrands.add(category);
        } else {
          foundCategories.add(category);
        }
      }
    });
  });
  
  filters.categories = Array.from(foundCategories);
  filters.brands = Array.from(foundBrands);

  // Extract gender
  if (lowerQuery.includes('men') || lowerQuery.includes('male')) {
    filters.gender = 'Men';
  } else if (lowerQuery.includes('women') || lowerQuery.includes('female')) {
    filters.gender = 'Women';
  }

  // Extract general keywords (words that aren't colors, prices, or categories)
  const words = query.toLowerCase().split(/\s+/);
  const foundKeywords = new Set();
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 2 && 
        !filters.colors.includes(cleanWord) &&
        !filters.categories.includes(cleanWord) &&
        !filters.brands.includes(cleanWord) &&
        !isNaN(cleanWord) === false &&
        !['at', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'with', 'for', 'to', 'of', 'by', 'from', 'under', 'below', 'above', 'over', 'max', 'maximum', 'min', 'minimum', 'price', 'cost', 'ils', 'shekel', 'dollar', 'euro', 'usd', 'eur'].includes(cleanWord)) {
      foundKeywords.add(cleanWord);
    }
  });
  
  filters.keywords = Array.from(foundKeywords);

  return filters;
}

// Test function
function testParser() {
  const testQueries = [
    "black t-shirt at 100ils max",
    "tommy hilfiger jeans under 200 shekel",
    "red nike shoes max 300",
    "calvin klein white shirt",
    "men's black jacket under 500",
    "levi's blue jeans",
    "polo ralph lauren shirt max 150",
    "converse white sneakers",
    "abercrombie t-shirt black",
    "new balance grey trainers under 400"
  ];

  console.log("Testing search parser:\n");
  testQueries.forEach(query => {
    const filters = parseSearchQuery(query);
    console.log(`Query: "${query}"`);
    console.log("Filters:", JSON.stringify(filters, null, 2));
    console.log("---");
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseSearchQuery, testParser };
}

// Run tests if called directly
if (require.main === module) {
  testParser();
} 