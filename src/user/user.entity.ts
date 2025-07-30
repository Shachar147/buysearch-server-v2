import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { MinLength } from 'class-validator';

@Entity('users')
@Unique(['username'])
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MinLength(4)
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  @MinLength(8)
  passwordHash: string;

  @Column({ nullable: true })
  salt: string;

  // Google OAuth fields
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  googleEmail: string;

  @Column({ nullable: true })
  googleName: string;

  @Column({ nullable: true })
  googlePicture: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'int', default: 0 })
  totalSearches: number;
}
