# BuySearch v3 - Backend Server

A NestJS-based backend server for the BuySearch product aggregation platform. This server handles product scraping, data management, and API endpoints for the frontend application.

## 🚀 Features

- **Product Scraping**: Automated scraping from multiple e-commerce sources
- **Smart Search**: Full-text search with PostgreSQL using GIN indexes
- **Product Management**: CRUD operations for products, brands, categories, colors, and sources
- **User Features**: Favorites, saved filters, price history tracking
- **Admin Dashboard**: Status monitoring and scraper management
- **Cron Jobs**: Automated scraping schedules

## 📁 Project Structure

```
server/
├── src/
│   ├── scrapers/          # Web scraping modules
│   │   ├── base/          # Base scraper classes and utilities
│   │   ├── asos_scraper.ts
│   │   ├── nike_scraper.ts
│   │   └── ...            # Other source-specific scrapers
│   ├── product/           # Product management
│   ├── brand/             # Brand management
│   ├── category/          # Category management
│   ├── color/             # Color management
│   ├── source/            # Source management
│   ├── auth/              # Authentication
│   ├── favourites/        # User favorites
│   ├── saved-filter/      # Saved filter sets
│   ├── search/            # Search functionality
│   └── price-history/     # Price tracking
├── scripts/               # Utility scripts
└── test/                  # Tests
```

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file with your database configuration:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=development
   ```

3. **Database setup:**
   ```bash
   # Run migrations (if using TypeORM migrations)
   npm run migration:run
   
   # Or sync database schema
   npm run start:dev
   ```

## 🔧 Available Scripts

### Development
```bash
npm run start:dev          # Start development server with hot reload
npm run build              # Build the application
npm run start:prod         # Start production server
npm run test               # Run tests
npm run test:e2e           # Run end-to-end tests
```

### Scraping Scripts
```bash
npm run scrape:all         # Scrape all active sources* 
                           # (better not use it since it run all simoultaniosly - 
                           # run the cron instead)
npm run scrape:asos        # Scrape ASOS specifically
npm run scrape:nike        # Scrape Nike specifically
# ... other source-specific scripts
```

### Utility Scripts
```bash
npm run check:categories   # Check database categories vs enum
npm run update:search-text # Update search_text column for all products
npm run cron:start         # Start the cron service that will run scrapers 
                           # based on oldest updateAt to newest.
```

## 🕷️ Web Scraping

### Scraping All Sources
```bash
npm run scrape:all
```
This command runs all active scrapers in sequence. Running all sources at the same time. Note that it can exhaust the database, and your CPU so not recommended. it was useful when I had small amount of scrapers.

### Scraping Specific Sources
```bash
npm run scrape:asos        # Scrape ASOS
npm run scrape:nike        # Scrape Nike
npm run scrape:adidas      # Scrape Adidas
npm run scrape:zara        # Scrape Zara
# ... etc for other sources
```

Each scraper:
- Fetches products from the source website
- Normalizes data (categories, colors, prices)
- Upserts products into the database
- Updates price history if prices changed
- Generates search_text for full-text search

### Adding New Scrapers
1. Create a new scraper file in `src/scrapers/`
2. Extend the `BaseScraper` class
3. Implement the required methods:
   - `scrape()`: Main scraping logic
   - `parseProduct()`: Parse individual product data
4. Add the scraper to the cron service configuration (update "scraper_path" on Sources db table)
5. (optional) add it to package.json with dedicated specific command like `scrape:NewScraper` so you could run `npm run scrape:NewScraper`

## 🔍 Smart Search System

### Search Text Generation
The system automatically generates `search_text` for products by concatenating:
- Product title
- Brand name
- Source name
- Category names
- Color names

This enables efficient full-text search using PostgreSQL GIN indexes.

### Updating Search Text
```bash
npm run update:search-text
```
This script:
- Updates the `search_text` column for all existing products
- Processes products in batches of 1000 for performance
- Shows progress with ETA and timing information
- Uses bulk updates for efficiency

**Example output:**
```
🚀 Starting search_text update script...
📊 Getting total product count...
📈 Found 260000 products to update in batches of 1000...
🔄 Processing batch 1 (offset: 0)...
📥 Fetched 1000 products in 245ms
⚡ Updated 1000 products in 156ms
📊 Progress: 1000/260000 products (0.4%)
⏱️  Elapsed: 45s | ETA: 180s
```

## 📊 Category Management

### Checking Categories
```bash
npm run check:categories
```
This script:
- Compares database categories with the `Category` enum
- Identifies categories that exist in DB but not in enum
- Normalizes product categories using the enum values
- Shows which categories will become empty after normalization

**Options:**
```bash
npm run check:categories --fix    # Apply fixes and normalize categories
```

**Example output:**
```
Categories in DB but missing from Category enum (excluding brands):
- "Dresses & Overalls"
- "T-Shirts & Tops"

Products that would change: 1500
Categories that will become empty: 2
```

## ⏰ Cron Service

### Starting the Cron Service
```bash
npm run cron:start
```

The cron service:
- Runs every 15 minutes (unless in production mode, where it skips)
- Checks all available scrapers and active sources
- **Prevents source exhaustion** by skipping any source that was scraped in the last 24 hours
- Ensures no more than a set number of scrapers (default: 1) run in parallel
- Starts the oldest eligible scraper if a slot is available
- Streams logs from each scraper process in real time
- Manages and cancels old in-progress sessions
- Logs all actions, errors, and scraper results for monitoring and debugging

### Monitoring
- Check scraper status via the admin dashboard (`/status`)
- View scraping history in the database
- Monitor logs for errors and performance

## 🗄️ Database Schema

### Key Tables
- **products**: Main product data with search_text column
- **brands**: Product brands
- **categories**: Product categories
- **colors**: Product colors
- **sources**: Scraping sources
- **product_categories**: Many-to-many relationship
- **product_colors**: Many-to-many relationship
- **scraping_history**: Scraper execution logs
- **price_history**: Product price changes over time

### Search Optimization
- **GIN Index**: `idx_product_search_text` on `to_tsvector('simple', search_text)`
- **Full-text search**: Uses PostgreSQL's built-in text search capabilities
- **Similarity matching**: Supports fuzzy search and typo tolerance

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes for admin functions
- User favorites and saved filters

## 📈 Performance Features

- **Bulk Operations**: Efficient batch processing for large datasets
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connection management

## 🐛 Troubleshooting

### Common Issues

1. **Scraper Timeouts**: Increase timeout values in scraper configuration
2. **Database Connection**: Check DATABASE_URL and SSL settings
3. **Memory Issues**: Reduce batch sizes for large datasets

### Logs
- Application logs: `npm run start:dev`
- Cron service logs: `npm run cron:start`
- Database logs: Check PostgreSQL logs