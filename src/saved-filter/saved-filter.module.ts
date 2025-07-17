import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedFilter } from './saved-filter.entity';
import { SavedFilterService } from './saved-filter.service';
import { SavedFilterController } from './saved-filter.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedFilter]), AuthModule],
  providers: [SavedFilterService],
  controllers: [SavedFilterController],
  exports: [SavedFilterService],
})
export class SavedFilterModule {} 