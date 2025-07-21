import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import { Brand } from '../brand/brand.entity';
import { Category } from '../category/category.entity';
import { Color } from '../color/color.entity';
import { Source } from '../source/source.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('idx_product_title')
  @Column()
  title: string;

  @Column({ unique: true })
  url: string;

  @Column('simple-array')
  images: string[];

  @Index('idx_product_is_selling_fast')
  @Column()
  isSellingFast: boolean;

  @Index('idx_product_price')
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Index('idx_product_old_price')
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ nullable: true })
  @Index()
  salePercent: number;

  @Index('idx_product_currency')
  @Column()
  currency: string;

  @Index()
  @Column()
  gender: string;

  @Index('idx_product_created_at')
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Index('idx_product_updated_at')
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