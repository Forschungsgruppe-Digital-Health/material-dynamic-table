import { Component, Input } from '@angular/core';
import { ColumnConfig } from '../../column-config.model';
import { FhirResource } from 'fhir/r4';
import * as fhirpath from 'fhirpath';
import * as moment from 'moment';

@Component({
  selector: 'app-fhir-resource-cell',
  template: '{{ getValue() }}'
})
export class FhirResourceCellComponent<T extends FhirResource> {
  @Input() column: ColumnConfig;
  @Input() row: T;

  /**  
   * Wird bei jeder Change Detection aufgerufen  
   * – nutzt always aktuellen moment.locale()  
   */
  getValue(): string {
    const opt = this.column.options || {};
    // 1) FHIRPath auswerten
    const results = opt.fhirPath
      ? fhirpath.evaluate(this.row, opt.fhirPath)
      : [];

    // 2) raw value extrahieren
    const raw = Array.isArray(results) ? results[0] : results;

    // 3) custom formatter oder Default
    const formattedRaw = opt.formatter
      ? opt.formatter(raw)
      : String(raw);
    // 5) custom display callback übersteuert alles
    if (opt.display) {
      return opt.display(results, (v: any) => String(v));
    }

    return formattedRaw;
  }
}
