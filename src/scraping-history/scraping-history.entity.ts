import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ScrapingType {
  MANUAL = 'manual',
  AUTO = 'auto'
}

export enum ScrapingStatus {
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

@Entity('scraping_history')
export class ScrapingHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  scraper: string;

  @Column({ 
    type: 'enum', 
    enum: ScrapingType,
    default: ScrapingType.MANUAL 
  })
  type: ScrapingType;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ 
    type: 'enum', 
    enum: ScrapingStatus,
    default: ScrapingStatus.IN_PROGRESS 
  })
  status: ScrapingStatus;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  totalSeconds: number;

  @Column({ type: 'int', default: 0 })
  createdItems: number;

  @Column({ type: 'int', default: 0 })
  updatedItems: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 