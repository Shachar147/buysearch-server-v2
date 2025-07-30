import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Color } from './color.entity';
import { PAGINATION_LIMIT } from '../consts';
import { Color as ColorEnum } from '../color.constants';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private colorsRepository: Repository<Color>,
  ) {}

  async findAll(offset = 0, limit = PAGINATION_LIMIT): Promise<any> {
    const [data, total] = await this.colorsRepository.findAndCount({
      where: { isActive: true },
      skip: offset,
      take: limit,
      order: { id: 'ASC' },
    });
    return {
      total,
      offset,
      limit,
      hasNextPage: offset + limit < total,
      data,
    };
  }

  async findOne(id: number): Promise<Color> {
    return this.colorsRepository.findOne({ where: { id, isActive: true } });
  }

  async findByName(name: string): Promise<Color | null> {
    return this.colorsRepository.findOne({ where: { name, isActive: true } });
  }

  async create(createColorDto: Partial<Color>): Promise<Color> {
    const color = this.colorsRepository.create(createColorDto);
    return this.colorsRepository.save(color);
  }

  async update(id: number, updateColorDto: Partial<Color>): Promise<Color> {
    await this.colorsRepository.update(id, updateColorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.colorsRepository.update(id, { isActive: false });
  }

  async upsert(name: string): Promise<Color> {
    let color = await this.findByName(name);
    
    if (!color) {
      color = await this.create({ name });
    }
    
    return color;
  }

  async findByNames(names: string[]): Promise<Color[]> {
    return this.colorsRepository
      .createQueryBuilder('color')
      .where('color.isActive = true')
      .andWhere('LOWER(color.name) IN (:...names)', { names: names.map(n => n.toLowerCase()) })
      .getMany();
  }

  async findByNameOrNames(nameOrNames: string): Promise<Color[]> {
    const names = nameOrNames.split(',').map(n => n.trim()).filter(Boolean);
    return this.findByNames(names);
  }

  async upsertManyOld(names: string[]): Promise<Color[]> {
    const colors: Color[] = [];
    
    for (const name of names) {
      const color = await this.upsert(name) ;
      colors.push(color);
    }
    
    return colors;
  }

  async upsertMany(colors: string[]): Promise<Color[]> {
    const colorObjects: Partial<Color>[] = colors.map(color =>
      ({ name: color }),
    );
  
    await this.colorsRepository.upsert(colorObjects, ['name']);
  
    const names = colorObjects.map(c => c.name).filter(Boolean);
    return this.colorsRepository.find({
      where: { name: In(names) },
    });
  }
  
  public async findAllNoPagination(): Promise<Color[]> {
    return this.colorsRepository.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  async analyzeNonStandardColors() {
    // Get all colors from database
    const allColors = await this.colorsRepository.find({ 
      where: { isActive: true },
      relations: ['products', 'products.source']
    });

    const standardColors = Object.values(ColorEnum);
    const nonStandardColors: any[] = [];

    for (const color of allColors) {
      // Check if color name is not in the standard enum
      if (!standardColors.includes(color.name as ColorEnum)) {
        const products = color.products || [];
        const sourceCounts: { [key: string]: number } = {};
        
        // Count products by source
        products.forEach(product => {
          const sourceName = product.source?.name || 'Unknown';
          sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;
        });

        // Suggest a standard color name based on similarity
        const suggestedColor = this.suggestStandardColor(color.name);

        nonStandardColors.push({
          nonStandardColorName: color.name,
          amountOfProducts: products.length,
          sources: sourceCounts,
          suggestedName: suggestedColor
        });
      }
    }

    // Sort by amount of products (descending)
    return nonStandardColors.sort((a, b) => b.amountOfProducts - a.amountOfProducts);
  }

  private suggestStandardColor(colorName: string): string {
    const lowerColorName = colorName.toLowerCase();
    const standardColors = Object.values(ColorEnum);

    // Direct matches
    for (const standardColor of standardColors) {
      if (lowerColorName.includes(standardColor.toLowerCase())) {
        return standardColor;
      }
    }

    // Check for common color keywords
    const colorKeywords: { [key: string]: string } = {
      'red': 'Red',
      'blue': 'Blue',
      'green': 'Green',
      'yellow': 'Yellow',
      'pink': 'Pink',
      'purple': 'Purple',
      'orange': 'Orange',
      'brown': 'Brown',
      'grey': 'Grey',
      'gray': 'Grey',
      'black': 'Black',
      'white': 'White',
      'beige': 'Beige',
      'navy': 'Navy',
      'olive': 'Olive',
      'khaki': 'Khaki',
      'camel': 'Camel',
      'mustard': 'Mustard',
      'coral': 'Coral',
      'salmon': 'Salmon',
      'bordeaux': 'Bordeaux',
      'lavender': 'Lavender',
      'lilac': 'Lilac',
      'charcoal': 'Charcoal',
      'ivory': 'Ivory',
      'cream': 'Cream',
      'taupe': 'Taupe',
      'gold': 'Gold',
      'silver': 'Silver',
      'copper': 'Copper',
      'emerald': 'Emerald',
      'rose': 'Rose',
      'tan': 'Tan',
      'nude': 'Nude',
      'bronze': 'Bronze',
      'mocha': 'Mocha',
      'stone': 'Stone',
      'denim': 'Denim',
      'striped': 'Striped',
      'floral': 'Floral',
      'checked': 'Checked',
      'plaid': 'Plaid',
      'camouflage': 'Camouflage',
      'leopard': 'Leopard',
      'zebra': 'Zebra',
      'polka': 'Polka Dot',
      'pinstripe': 'Pinstripe',
      'shiny': 'Shiny',
      'glitter': 'Glitter',
      'metallic': 'Metallic',
      'multicolor': 'Multicolor',
      'transparent': 'Transparent'
    };

    for (const [keyword, standardColor] of Object.entries(colorKeywords)) {
      if (lowerColorName.includes(keyword)) {
        return standardColor;
      }
    }

    return 'Unknown';
  }
} 