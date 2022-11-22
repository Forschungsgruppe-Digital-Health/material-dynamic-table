import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

import {DataSource} from '@angular/cdk/table';
import {ColumnConfig} from './column-config.model';
import {ColumnFilter} from './column-filter.model';
import {ControlsPosition} from './controls-position.model';
import {ColumnFilterService} from './table-cell/cell-types/column-filter.service';
import {DynamicTableControlsIntl} from './dynamic-table-controls-intl';

@Component({
  selector: 'mdt-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, AfterViewInit {

  @Input() columns: ColumnConfig[];
  @Input() dataSource: DataSource<any>;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [20, 50, 100];
  @Input() showFirstLastButton = false;
  @Input() showFilters = true;
  @Input() stickyHeader = false;
  @Input() paginator: MatPaginator;
  @Input() controlsPosition: ControlsPosition = ControlsPosition.BOTTOM;

  @Output() rowClick = new EventEmitter<any>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) private _internalPaginator: MatPaginator;

  controlsPositions = {
    bottom: ControlsPosition.BOTTOM,
    top: ControlsPosition.TOP
  };

  displayedColumns: string[];

  private appliedFilters: { [key: string]: any; } = {};

  constructor(
    private readonly columnFilterService: ColumnFilterService,
    private readonly dialog: MatDialog,
    readonly dynamicTableControlsIntl: DynamicTableControlsIntl
  ) {}

  ngOnInit() {
    if (this.dataSource == null) {
      throw Error('DynamicTable must be provided with data source.');
    }
    if (this.columns == null) {
      throw Error('DynamicTable must be provided with column definitions.');
    }

    this.columns.forEach((column, index) => column.name = this.prepareColumnName(column.name, index));
    this.displayedColumns = this.columns.map((column, index) => column.name);
  }

  ngAfterViewInit() {
    if (this.paginator === undefined) {
      this.paginator = this._internalPaginator;
    }

    const dataSource = this.dataSource as any;
    dataSource.sort = this.sort;
    dataSource.paginator = this.paginator;
  }

  isUsingInternalPaginator() {
    return this.paginator === this._internalPaginator;
  }

  hasSetFilter() {
    return this.appliedFilters && (Object.keys(this.appliedFilters).length > 0);
  }

  canFilter(column: ColumnConfig) {
    return this.columnFilterService.getFilter(column.type) != null;
  }

  isFiltered(column: ColumnConfig) {
    return this.appliedFilters[column.name];
  }

  getFilterDescription(column: ColumnConfig) {
    const filter = this.appliedFilters[column.name];
    if (!filter || !filter.getDescription) {
      return null;
    }

    return filter.getDescription();
  }

  prepareColumnName(name: string | undefined, columnNumber: number) {
    return name || 'col' + columnNumber;
  }

  filter(column: ColumnConfig) {
    const filter = this.columnFilterService.getFilter(column.type);

    if (filter) {
      const dialogConfig = new MatDialogConfig();
      const columnFilter = new ColumnFilter();
      columnFilter.column = column;

      if (this.appliedFilters[column.name]) {
        columnFilter.filter = Object.create(this.appliedFilters[column.name]);
      }

      dialogConfig.data = columnFilter;

      const dialogRef = this.dialog.open(filter, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.appliedFilters[column.name] = result;
        } else if (result === '') {
          delete this.appliedFilters[column.name];
        }

        if (result || result === '') {
          this.updateDataSource();
        }
      });
    }
  }

  clearFilters() {
    this.appliedFilters = {};
    this.updateDataSource();
  }

  protected updateDataSource() {
    const dataSource = this.dataSource as any;
    dataSource.filters = this.getFilters();
  }

  getFilters() {
    const filters = this.appliedFilters;
    return Object.keys(filters).map((key) => filters[key]);
  }

  getFilter(columnName: string): any {
    const filterColumn = this.getColumnByName(columnName);

    if (!filterColumn) {
      throw Error(`Column with name '${columnName}' does not exist.`);
    }

    return this.appliedFilters[filterColumn.name];
  }

  setFilter(columnName: string, filter: any) {
    const filterColumn = this.getColumnByName(columnName);

    if (!filterColumn) {
      throw Error(`Cannot set filter for a column. Column with name '${columnName}' does not exist.`);
    }

    this.appliedFilters[filterColumn.name] = filter;
    this.updateDataSource();
  }

  private getColumnByName(columnName: string): ColumnConfig | undefined {
    return this.columns.find(c =>
      (c.name ? c.name.toLowerCase() : c.name) === (columnName ? columnName.toLowerCase() : columnName)
    );
  }

  onRowClick(row: any) {
    this.rowClick.next(row);
  }
}
