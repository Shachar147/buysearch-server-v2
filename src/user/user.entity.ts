import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { MinLength } from 'class-validator';

@Entity('users')
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MinLength(4)
  username: string;

  @Column()
  @MinLength(8)
  passwordHash: string;

  @Column()
  salt: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'int', default: 0 })
  totalSearches: number;
} 