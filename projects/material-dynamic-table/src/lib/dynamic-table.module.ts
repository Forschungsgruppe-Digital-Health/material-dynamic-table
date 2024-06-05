import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicTableControlsIntl } from './dynamic-table-controls-intl';
import {
  DynamicTableComponent,
  DynamicTableResetFilterIconDirective,
  DynamicTableSetColumnFilterIconDirective
} from './dynamic-table.component';
import { CellService } from './table-cell/cell-types/cell.service';
import { ColumnFilterService } from './table-cell/cell-types/column-filter.service';
import { DateCellComponent } from './table-cell/cell-types/date-cell.component';
import { MomentCellComponent } from './table-cell/cell-types/moment-cell.component';
import { TextCellComponent } from './table-cell/cell-types/text-cell.component';
import { CellDirective } from './table-cell/cell.directive';
import { TableCellComponent } from './table-cell/table-cell.component';

export { ColumnConfig } from './column-config.model';
export { ColumnFilter } from './column-filter.model';
export { ControlsPosition } from './controls-position.model';
export { DynamicTableControlsIntl } from './dynamic-table-controls-intl';
export { FilterDescription } from './filter-description';
export { CellComponent } from './table-cell/cell-types/cell.component';
export { CellDirective, CellService, ColumnFilterService };

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
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule
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
