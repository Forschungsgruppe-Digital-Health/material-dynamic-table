import {DynamicTableControlsIntl} from '../../projects/material-dynamic-table/src/lib/dynamic-table-controls-intl';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class GermanDynamicTableControlsIntl implements DynamicTableControlsIntl {
  readonly changes: Subject<void>;
  firstPageLabel: string;
  itemsPerPageLabel: string;
  lastPageLabel: string;
  nextPageLabel: string;
  previousPageLabel: string;
  resetFilterLabel: string;

  constructor() {
    this.changes = new Subject<void>();
    this.firstPageLabel = 'Erste Seite';
    this.itemsPerPageLabel = 'Einträge pro Seite';
    this.lastPageLabel = 'Letzte Seite';
    this.nextPageLabel = 'Nächste Seite';
    this.previousPageLabel = 'Vorherige Seite';
    this.resetFilterLabel = 'Filter zurücksetzen';
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Seite 1 von 1';
    }

    return `Seite ${page + 1} von ${Math.ceil(length / pageSize)}`;
  }
}
