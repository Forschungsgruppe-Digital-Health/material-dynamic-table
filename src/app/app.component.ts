import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Breakpoints} from '@angular/cdk/layout';
import {MatPaginatorIntl} from '@angular/material/paginator';

import {ColumnConfig, ControlsPosition, DynamicTableComponent, DynamicTableControlsIntl} from 'material-dynamic-table';
import {DateFilter} from './filters/date-filter/date-filter.model';
import {FilteredDataSource} from './data-source/filtered-data-source';
import {GermanDynamicTableControlsIntl} from './german-dynamic-table-controls-intl';
import {Product} from './product';
import {TextFilter} from './filters/text-filter/text-filter.model';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

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
  columns = new BehaviorSubject(largerDeviceColumnConfig);
  showFilters = true;
  showCustomIcons = true;

  data: Product[] = [
    {
      product: 'Mouse',
      description: 'Fast and wireless',
      receivedOn: new Date('2018-01-02T11:05:53.212Z'),
      created: new Date('2015-04-22T18:12:21.111Z')
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

  dataSource = new FilteredDataSource<Product>(this.data);

  breakpointChanges: { name: string, mediaQuery: string}[];

  constructor(
    private _iconRegistry: MatIconRegistry,
    private _sanitizer: DomSanitizer
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
  }

  ngAfterViewInit(): void {
    this.dynamicTable.breakpointChanges.subscribe(breakpointChanges => {
      this.breakpointChanges = breakpointChanges;

      if (breakpointChanges.find(breakpointChange => breakpointChange.mediaQuery === Breakpoints.Small)) {
        this.columns.next(smallerDeviceColumnConfig);
      }

      if (breakpointChanges.find(breakpointChange => breakpointChange.mediaQuery === Breakpoints.Medium)) {
        this.columns.next(largerDeviceColumnConfig);
      }
      this.locale.next(moment.locale());
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

  toggleIcons() {
    return (this.showCustomIcons = !this.showCustomIcons);
  }

  toggleLocale() {
    this.locale.next(moment.locale() === 'en' ? 'de' : 'en');
  }
}
