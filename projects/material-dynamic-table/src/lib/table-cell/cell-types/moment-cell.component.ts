import {Component, Input, OnInit} from '@angular/core';
import {CellComponent} from './cell.component';
import {ColumnConfig} from '../../column-config.model';
// @ts-ignore
import moment from 'moment';

@Component({
  selector: 'mdt-moment-cell',
  template: '{{ getLocalizedMoment() }}'
})
export class MomentCellComponent implements CellComponent, OnInit {

  @Input() column: ColumnConfig;
  @Input() row: any;

  sourceFormat: string;
  targetFormat: string;

  constructor() {
    this.sourceFormat = moment.HTML5_FMT.DATETIME_LOCAL_MS;
    this.targetFormat = moment.HTML5_FMT.DATETIME_LOCAL;
  }

  ngOnInit() {
    // Set cell options
    const options = this.column.options;

    if (options) {
      if (options.sourceFormat) {
        this.sourceFormat = options.sourceFormat;
      }

      if (options.targetFormat) {
        this.targetFormat = options.targetFormat;
      }
    }
  }

  getLocalizedMoment() {
    return moment(
      this.row[this.column.name],
      this.sourceFormat,
      moment.locale()
    ).format(this.targetFormat);
  }
}
