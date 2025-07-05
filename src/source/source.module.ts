import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceController } from './source.controller';
import { SourceService } from './source.service';
import { Source } from './source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Source])],
  controllers: [SourceController],
  providers: [SourceService],
  exports: [SourceService],
})
export class SourceModule {} 