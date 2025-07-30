import { EntityRepository, Repository } from 'typeorm';
import { PriceHistory } from './price-history.entity';

@EntityRepository(PriceHistory)
export class PriceHistoryRepository extends Repository<PriceHistory> {}
