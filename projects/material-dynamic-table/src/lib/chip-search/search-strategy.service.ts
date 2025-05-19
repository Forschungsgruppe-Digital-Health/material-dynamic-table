import { SearchStrategy, DateSearchStrategy, TextSearchStrategy, MomentSearchStrategy, FhirSearchStrategy } from './search-strategies';

export class SearchStrategyService {
  private strategies: { [key: string]: SearchStrategy } = {};

  constructor() {
    this.registerStrategy('text', new TextSearchStrategy());
    this.registerStrategy('date', new DateSearchStrategy());
    this.registerStrategy('moment', new MomentSearchStrategy());
    this.registerStrategy('fhir', new FhirSearchStrategy());
  }

  public registerStrategy(cellType: string, strategy: SearchStrategy): void {
    this.strategies[cellType] = strategy;
  }

  public getStrategy(cellType: string): SearchStrategy {
    return this.strategies[cellType] || this.strategies['text'];
  }
}
  