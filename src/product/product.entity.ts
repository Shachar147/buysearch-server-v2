import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import { Brand } from '../brand/brand.entity';
import { Category } from '../category/category.entity';
import { Color } from '../color/color.entity';
import { Source } from '../source/source.entity';

@Entity('products')
@Index('idx_product_search_text', { synchronize: false }) // This is a placeholder for TypeORM, see note below
export class Product {
  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column({ unique: true })
  url: string;

  @Column('simple-array')
  images: string[];

  @Column()
  isSellingFast: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ nullable: true })
  @Index()
  salePercent: number;

  @Column()
  currency: string;

  @Index()
  @Column()
  gender: string;

  // GIN index for search_text should be created via migration:
  // CREATE INDEX idx_product_search_text ON products USING GIN (to_tsvector('simple', search_text));
  @Column({ type: 'text', nullable: true })
  search_text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationships
  @Index()
  @ManyToOne(() => Brand, brand => brand.products)
  brand: Brand;

  @Index()
  @ManyToOne(() => Source, source => source.products)
  source: Source;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' }
  })
  categories: Category[];

  @ManyToMany(() => Color, color => color.products)
  @JoinTable({
    name: 'product_colors',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'colorId', referencedColumnName: 'id' }
  })
  colors: Color[];
} 