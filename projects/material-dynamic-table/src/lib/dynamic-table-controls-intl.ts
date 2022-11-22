import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {Subject} from 'rxjs';

@Injectable()
export class DynamicTableControlsIntl implements MatPaginatorIntl {
  readonly changes: Subject<void>;
  firstPageLabel: string;
  itemsPerPageLabel: string;
  lastPageLabel: string;
  nextPageLabel: string;
  previousPageLabel: string;
  resetFilterLabel: string;

  constructor() {
    this.changes = new Subject<void>();
    this.firstPageLabel = 'First page';
    this.itemsPerPageLabel = 'Items per page';
    this.lastPageLabel = 'Last page';
    this.nextPageLabel = 'Next page';
    this.previousPageLabel = 'Previous page';
    this.resetFilterLabel = 'Reset filters';
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Page 1 of 1';
    }

    return `Page ${page + 1} of ${Math.ceil(length / pageSize)}`;
  }
}
