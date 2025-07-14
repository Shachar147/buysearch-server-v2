import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, Index, Unique, ManyToOne, OneToMany } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity('categories')
@Unique(['name', 'gender'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  @Index()
  gender: string;

  // --- Hierarchy ---
  @ManyToOne(() => Category, category => category.children, { nullable: true, onDelete: 'SET NULL' })
  parent?: Category;

  @Column({ nullable: true })
  parentId?: number;

  @OneToMany(() => Category, category => category.parent)
  children?: Category[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => Product, product => product.categories)
  products: Product[];
} 