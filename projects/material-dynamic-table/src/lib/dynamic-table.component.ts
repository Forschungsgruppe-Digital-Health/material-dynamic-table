import {
  AfterViewInit,
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, of } from 'rxjs';
import { ColumnConfig } from './column-config.model';
import { ColumnFilter } from './column-filter.model';
import { ControlsPosition } from './controls-position.model';
import { DynamicTableControlsIntl } from './dynamic-table-controls-intl';
import { ColumnFilterService } from './table-cell/cell-types/column-filter.service';

@Directive({
  selector: 'ng-template[mdtSetColumnFilterIcon]'
})
export class DynamicTableSetColumnFilterIconDirective {}

@Directive({
  selector: 'ng-template[mdtResetFilterIcon]'
})
export class DynamicTableResetFilterIconDirective {}

@Component({
  selector: 'mdt-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, AfterViewInit {

  @Input() caption: string;
  @Input() columns: ColumnConfig[] | Observable<ColumnConfig[]>;
  @Input() controlsPosition: ControlsPosition = ControlsPosition.BOTTOM;
  @Input() dataSource: MatTableDataSource<any>;
  @Input() paginator: MatPaginator;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [20, 50, 100];
  @Input() searchFieldPlaceholder = "Search term";
  @Input() showFirstLastButton = false;
  @Input() showFilters = true;
  @Input() showSearch = true;
  @Input() sortDirection: SortDirection = 'asc';
  @Input() stickyHeader = false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() breakpointChanges: Observable<{ name: string, mediaQuery: string}[]>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) private _internalPaginator: MatPaginator;

  @ContentChild(DynamicTableResetFilterIconDirective, { read: TemplateRef })
  customResetFilterIconTpl?: TemplateRef<any>;
  @ContentChild(DynamicTableSetColumnFilterIconDirective, { read: TemplateRef })
  customSetColumnFilterIconTpl?: TemplateRef<any>;

  controlsPositions = {
    bottom: ControlsPosition.BOTTOM,
    top: ControlsPosition.TOP
  };
  preparedColumns: ColumnConfig[];
  displayedColumns: string[];
  searchValue: string = '';
  selectedColumn: string;
  activeFilters: { column: string, value: string }[] = [];

  private _appliedFilters: { [key: string]: any; };
  private _breakpointChangesSubject: Subject<{ name: string, mediaQuery: string }[]>;

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly columnFilterService: ColumnFilterService,
    private readonly dialog: MatDialog,
    readonly dynamicTableControlsIntl: DynamicTableControlsIntl
  ) {
    this._appliedFilters = {};
    this._breakpointChangesSubject = new Subject<{ name: string, mediaQuery: string }[]>();
    this.breakpointChanges = this._breakpointChangesSubject.asObservable();
  }

  ngOnInit() {
    if (this.dataSource == null) {
      throw Error('DynamicTable must be provided with data source.');
    }

    if (this.columns == null) {
      throw Error('DynamicTable must be provided with column definitions.');
    }

    if (this.columns instanceof Array) {
      this.columns = of(this.columns);
    }

    //Handles global search and column filters
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      try {
        const activeFilters = JSON.parse(filter);
        return activeFilters.every((f: any) => {
          if (f.column === 'all') {
            //Search across all properties
            return Object.values(data)
              .join(' ')
              .toLowerCase()
              .includes(f.value.toLowerCase());
          } else {
            //Search only in the specified column
            const cellValue = data[f.column];
            return cellValue
              ? cellValue.toString().toLowerCase().includes(f.value.toLowerCase())
              : false;
          }
        });
      } catch (e) {
        //If no JSON is available, global search across all columns
        return Object.values(data)
          .join(' ')
          .toLowerCase()
          .includes(filter);
      }
    };

    this.columns.subscribe(columns => {
      this.preparedColumns = columns
        // Assign index based column name if non is given
        .map((column, index) => {
          column.name = column.name || 'col' + index;
          return column;
        });

      // Set column to display
      this.displayedColumns = this.preparedColumns.map((column, index) => column.name);

      // Conditionally reset filters
      if (this.hasSetFilter()) {
        this.clearFilters();
      }
    });

    this.breakpointObserver
      // Register media queries for all available breakpoints
      .observe(Object.keys(Breakpoints).map(name => Breakpoints[name]))
      // Subscribe to breakpoint changes regarding all available breakpoints
      .subscribe(breakpointState => this._breakpointChangesSubject.next(
          Object.keys(breakpointState.breakpoints)
          // Filter actual breakpoint changes (set to value 'true')
          .filter(mediaQuery => breakpointState.breakpoints[mediaQuery])
          // Determine breakpoint name and create object of name and media query as change
          .map(mediaQuery => {
            const name = Object.keys(Breakpoints).find(b => Breakpoints[b] === mediaQuery);
            if (name) {
              return {
                name: name,
                mediaQuery: Breakpoints[name]
              };
            }

            throw Error(`Processing breakpoint changes with media query '${mediaQuery}' fails using breakpoint name ${name}`);
          })
      ))  ;
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
    return this._appliedFilters && (Object.keys(this._appliedFilters).length > 0);
  }

  canFilter(column: ColumnConfig) {
    return this.columnFilterService.getFilter(column.type) != null;
  }

  isFiltered(column: ColumnConfig) {
    return this._appliedFilters[column.name];
  }

  getFilterDescription(column: ColumnConfig) {
    const filter = this._appliedFilters[column.name];
    if (!filter || !filter.getDescription) {
      return null;
    }

    return filter.getDescription();
  }

  filter(column: ColumnConfig) {
    const filter = this.columnFilterService.getFilter(column.type);

    if (filter) {
      const dialogConfig = new MatDialogConfig();
      const columnFilter = new ColumnFilter();
      columnFilter.column = column;

      if (this._appliedFilters[column.name]) {
        columnFilter.filter = Object.create(this._appliedFilters[column.name]);
      }

      dialogConfig.data = columnFilter;

      const dialogRef = this.dialog.open(filter, dialogConfig);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this._appliedFilters[column.name] = result;
        } else if (result === '') {
          delete this._appliedFilters[column.name];
        }

        if (result || result === '') {
          this.updateDataSource();
        }
      });
    }
  }

  clearFilters() {
    this._appliedFilters = {};
    this.updateDataSource();
  }

  protected updateDataSource() {
    const dataSource = this.dataSource as any;
    dataSource.filters = this.getFilters();
  }

  getFilters() {
    const filters = this._appliedFilters;
    return Object.keys(filters).map((key) => filters[key]);
  }

  getFilter(columnName: string): any {
    const filterColumn = this.getColumnByName(columnName);

    if (!filterColumn) {
      throw Error(`Column with name '${columnName}' does not exist.`);
    }

    return this._appliedFilters[filterColumn.name];
  }

  setFilter(columnName: string, filter: any) {
    const filterColumn = this.getColumnByName(columnName);

    if (!filterColumn) {
      throw Error(`Cannot set filter for a column. Column with name '${columnName}' does not exist.`);
    }

    this._appliedFilters[filterColumn.name] = filter;
    this.updateDataSource();
  }

  private getColumnByName(columnName: string): ColumnConfig | undefined {
    return this.preparedColumns.find(c =>
      (c.name ? c.name.toLowerCase() : c.name) === (columnName ? columnName.toLowerCase() : columnName)
    );
  }

  onRowClick(row: any) {
    this.rowClick.next(row);
  }

  //wird durch addFilter() und updateFilter() ersetzt
  search(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value;
    if (searchValue) {
      this.dataSource.filter = searchValue.trim().toLowerCase();
    }
  }

  //chip-based filter
  addFilter() {
    if (this.searchValue) {
      const chipColumn = this.selectedColumn ? this.selectedColumn : 'all';
      this.activeFilters.push({
        column: chipColumn,
        value: this.searchValue
      });
      //clear search input
      this.searchValue = '';
      this.updateFilter();
    }
  }

  removeFilter(filterToRemove: any) {
    this.activeFilters = this.activeFilters.filter(
      filter => filter !== filterToRemove
    );
    this.updateFilter();
  }

  //Updates DataSource filters based on active chips
  updateFilter() {
    if (this.activeFilters.length > 0) {
      this.dataSource.filter = JSON.stringify(this.activeFilters);
    } else {
      //If no chips exist, the global search is used
      this.dataSource.filter = this.searchValue.trim().toLowerCase();
    }
  }
  
}
