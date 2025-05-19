import { Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ColumnConfig,
  ControlsPosition,
  ChipSearchToggle,
  DateFilter,
  DynamicTableComponent,
  DynamicTableControlsIntl,
  FilteredDataSource,
  TextFilter,
  join,
  first
} from 'material-dynamic-table';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { GermanDynamicTableControlsIntl } from './german-dynamic-table-controls-intl';
import { Product } from './product';
import { Patient } from './patient';
import { FormControl } from '@angular/forms';

const smallerDeviceColumnConfig: ColumnConfig[] = [
  {
    name: 'product',
    displayName: 'Product',
    type: 'string',
    sticky: 'start'
  },
  {
    name: 'receivedOn',
    displayName: 'Recieved On',
    type: 'moment',
    options: {
      sourceFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      targetFormat: 'L'
    }
  },
  {
    name: '',
    type: 'options',
    sticky: 'end',
    sort: false
  }
];

const largerDeviceColumnConfig: ColumnConfig[] = [
  {
    name: 'product',
    displayName: 'Product',
    type: 'string',
    sticky: 'start'
  },
  {
    name: 'description',
    displayName: 'Description',
    type: 'string',
    sort: false
  },
  {
    name: 'receivedOn',
    displayName: 'Recieved On',
    type: 'moment',
    options: {
      targetFormat: 'LLLL'
    }
  },
  {
    name: 'created',
    displayName: 'Created Date',
    type: 'date',
    options: {
      dateFormat: 'shortDate'
    }
  },
  {
    name: '',
    type: 'options',
    sticky: 'end',
    sort: false
  },
];

const patientColumnConfig: ColumnConfig[] = [
  {
    name: 'firstName',
    displayName: 'FHIR Example - Vorname',
    type: 'fhir',
    options: {
      fhirPath: 'name.given',
      display: (results, formatter) => {
        return join(results, formatter, '/') //for custom delimiter
      }
    }
  },
  {
    name: 'familyName',
    displayName: 'FHIR Example - Nachname',
    type: 'fhir',
    options: {
      fhirPath: 'name.family',
      formatter: (value: any): string => value,
      display: join //standard delimiter is ", "
    }
  },
  {
    name: 'birthdate',
    displayName: 'FHIR Example - Geburtsdatum',
    type: 'fhir',
    options: {
      fhirPath: 'birthDate',
      formatter: (value: any): string => moment(value).format('LL'), //display: (dateString: string): string => moment(dateString).from(„YYYY-MM-DD“).format(„LLL“)
    }
  }
];

const PRODUCT_DATA: Product[] = [
  {
    product: 'Mouse',
    description: 'Fast and wireless',
    receivedOn: new Date('2018-01-02T11:05:53.212Z'),
    created: new Date('2015-04-22T18:12:21.111Z'),
  },
  {
    product: 'Keyboard',
    description: 'Loud and Mechanical',
    receivedOn: new Date('2018-06-09T12:08:23.511Z'),
    created: new Date('2015-03-11T11:44:11.431Z')
  },
  {
    product: 'Laser',
    description: 'It\'s bright',
    receivedOn: new Date('2017-05-22T18:25:43.511Z'),
    created: new Date('2015-04-21T17:15:23.111Z')
  },
  {
    product: 'Baby food',
    description: 'It\'s good for you',
    receivedOn: new Date('2017-08-26T18:25:43.511Z'),
    created: new Date('2016-01-01T01:25:13.055Z')
  },
  {
    product: 'Coffee',
    description: 'Prepared from roasted coffee beans',
    receivedOn: new Date('2015-04-16T23:52:23.565Z'),
    created: new Date('2016-12-21T21:05:03.253Z')
  },
  {
    product: 'Cheese',
    description: 'A dairy product',
    receivedOn: new Date('2017-11-06T21:22:53.542Z'),
    created: new Date('2014-02-11T11:34:12.442Z')
  },
  {
    product: 'Floppy disk',
    description: 'It belongs in a museum',
    receivedOn: new Date('2015-10-12T11:12:42.621Z'),
    created: new Date('2013-03-12T21:54:31.221Z')
  },
  {
    product: 'Fan',
    description: 'It will blow you away',
    receivedOn: new Date('2014-05-04T01:22:35.412Z'),
    created: new Date('2014-03-18T23:14:18.426Z')
  }
];

@Component({
  selector: 'ld-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: GermanDynamicTableControlsIntl
    },
    {
      provide: DynamicTableControlsIntl,
      useClass: GermanDynamicTableControlsIntl
    }
  ]
})
export class AppComponent implements AfterViewInit {

  @ViewChild(DynamicTableComponent) dynamicTable: DynamicTableComponent;

  locale = new BehaviorSubject('en');
  title = 'material-dynamic-table-demo';
  controlsPosition = ControlsPosition.BOTTOM;
  chipSearchToggle = ChipSearchToggle.ENABLE;
  columns = new BehaviorSubject(patientColumnConfig);
  showFilters = true;
  showSearch = true;
  showCustomIcons = true;

  tableControl = new FormControl<'patient' | 'product'>('patient');
  delimiterControl = new FormControl(', ');

  productDataSource = new FilteredDataSource<Product>(PRODUCT_DATA);
  patientDataSource = new FilteredDataSource<Patient>([]);
  dataSource: FilteredDataSource<any>;

  breakpointChanges: { name: string, mediaQuery: string}[];

  constructor(
    private _iconRegistry: MatIconRegistry,
    private _sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    this._iconRegistry.addSvgIconInNamespace(
      'custom',
      'filter',
      this._sanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
    );
    this._iconRegistry.addSvgIconInNamespace(
      'custom',
      'hatch-filter',
      this._sanitizer.bypassSecurityTrustResourceUrl('assets/icons/hatch-filter.svg')
    );
    this.dataSource = this.productDataSource;
    this.columns.next(largerDeviceColumnConfig);

    this.http.get<Patient>('assets/patient.json').subscribe(data => {
      this.patientDataSource.data = [data];
    });
  }

  ngAfterViewInit(): void {
    this.dynamicTable.breakpointChanges.subscribe(breakpointChanges => {
      this.breakpointChanges = breakpointChanges;
  
      if (this.tableControl.value === 'patient') {
        this.columns.next(patientColumnConfig);
      } else {
        if (breakpointChanges.find(b => b.mediaQuery === Breakpoints.Small)) {
          this.columns.next(smallerDeviceColumnConfig);
        }
        if (breakpointChanges.find(b => b.mediaQuery === Breakpoints.Medium)) {
          this.columns.next(largerDeviceColumnConfig);
        }
      }
  
      this.locale.next(moment.locale());
    });
  
    this.tableControl.valueChanges.subscribe(value => {
      this.dataSource = value === 'patient'
        ? this.patientDataSource
        : this.productDataSource;
  
      if (value === 'patient') {
        this.columns.next(patientColumnConfig);
      } else {
        if (this.breakpointChanges?.find(b => b.mediaQuery === Breakpoints.Small)) {
          this.columns.next(smallerDeviceColumnConfig);
        } else {
          this.columns.next(largerDeviceColumnConfig);
        }
      }
    });
  
    this.locale.subscribe(locale => {
      moment.locale(locale);
    });
  }
       
  
  clearFilters() {
    this.dynamicTable.clearFilters();
  }

  setFilter() {
    const createdColumnName = 'created';
    const appliedFilter = this.dynamicTable.getFilter(createdColumnName);
    if (!appliedFilter) {
      const filter = new DateFilter(createdColumnName);
      filter.fromDate = new Date(2015, 1, 1);
      filter.toDate = new Date(2015, 12, 31);

      this.dynamicTable.setFilter(createdColumnName, filter);
    } else {
      const columnName = 'description';
      const filter = new TextFilter(columnName);
      filter.value = 'Loud';

      this.dynamicTable.setFilter(columnName, filter);
    }
  }

  onRowClick(row: any) {
    console.log(row);
  }

  toggleShowFilters() {
    return (this.showFilters = !this.showFilters);
  }

  toggleShowSearch() {
    return (this.showSearch = !this.showSearch);
  }

  toggleIcons() {
    return (this.showCustomIcons = !this.showCustomIcons);
  }

  toggleLocale() {
    this.locale.next(moment.locale() === 'en' ? 'de' : 'en');
  }

  currentTable: 'product' | 'patient' = 'product';

  switchTables() {
    if (this.currentTable === 'product') {
      this.dataSource = this.patientDataSource;
      this.columns.next(patientColumnConfig);
      this.currentTable = 'patient';
    } else {
      this.dataSource = this.productDataSource;
      this.columns.next(largerDeviceColumnConfig);
      this.currentTable = 'product';
    }

    // Filter- und Such-UI zurücksetzen
    this.dynamicTable.searchValue = '';
    (this.dynamicTable.dataSource as any).filter = '';
    this.dynamicTable.activeFilters = [];
    (this.dynamicTable.dataSource as any).filters = [];
  }
}