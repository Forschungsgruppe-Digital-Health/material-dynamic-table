import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

export { CellComponent } from './table-cell/cell-types/cell.component';
export { CellService, CellDirective, ColumnFilterService };
export { ColumnConfig } from './column-config.model';
export { ColumnFilter } from './column-filter.model';
export { ControlsPosition } from './controls-position.model';
export { DynamicTableControlsIntl } from './dynamic-table-controls-intl';
export { FilterDescription } from './filter-description';
import { CellDirective } from './table-cell/cell.directive';
import { CellService } from './table-cell/cell-types/cell.service';
import { ColumnFilterService } from './table-cell/cell-types/column-filter.service';
import { DateCellComponent } from './table-cell/cell-types/date-cell.component';
import {
  DynamicTableComponent,
  DynamicTableResetFilterIconDirective,
  DynamicTableSetColumnFilterIconDirective
} from './dynamic-table.component';
import { DynamicTableControlsIntl } from './dynamic-table-controls-intl';
import { TableCellComponent } from './table-cell/table-cell.component';
import { TextCellComponent } from './table-cell/cell-types/text-cell.component';
import {LayoutModule} from '@angular/cdk/layout';
import {MomentCellComponent} from './table-cell/cell-types/moment-cell.component';

@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule
  ],
  declarations: [
    DynamicTableComponent,
    DynamicTableResetFilterIconDirective,
    DynamicTableSetColumnFilterIconDirective,
    TableCellComponent,
    CellDirective,
    TextCellComponent,
    DateCellComponent,
    MomentCellComponent
  ],
  exports: [
    DynamicTableComponent,
    DynamicTableResetFilterIconDirective,
    DynamicTableSetColumnFilterIconDirective
  ],
  entryComponents: [
    TextCellComponent,
    DateCellComponent,
    MomentCellComponent
  ],
  providers: [
    CellService,
    ColumnFilterService,
    {
      provide: MatPaginatorIntl,
      useClass: DynamicTableControlsIntl,

    },
    {
      provide: DynamicTableControlsIntl,
      useClass: DynamicTableControlsIntl,
    }
  ]
})
export class DynamicTableModule {
  constructor(private readonly cellService: CellService) {
    cellService.registerCell('string', TextCellComponent);
    cellService.registerCell('date', DateCellComponent);
    cellService.registerCell('moment', MomentCellComponent);
  }
}
