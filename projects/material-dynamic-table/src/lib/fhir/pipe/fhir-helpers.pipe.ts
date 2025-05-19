import { Pipe, PipeTransform } from '@angular/core';
import { FhirResource } from 'fhir/r4';
import * as fhirpath from "fhirpath";

type Formatter = (value: any) => any;

@Pipe({
  name: 'fhirHelpers'
})
export class FhirHelpersPipe<T extends FhirResource> implements PipeTransform {
  transform(resource: T | T[], fhirPath: string, formatter: Formatter): string {
    if (typeof formatter === "function") {
      if (Array.isArray(resource)) {
        return resource.map(resource => this.evaluate(resource, fhirPath, formatter)).join();
      }

      return this.evaluate(resource, fhirPath, formatter);
    }

    console.debug(`Cannot format resource (${Array.isArray(resource) ? resource[0].resourceType : resource.resourceType}) on FHIR path "${fhirPath}". No valid formatting function is given.`);
    return "";
  }

  private evaluate(resource: T, fhirPath: string, formatter: Formatter): string {
    if (fhirPath) {
      const value = fhirpath.evaluate(resource, fhirPath);

      if (value && Array.isArray(value) && (value.length > 0)) {
        return formatter(value[0]);
      }
    }

    return formatter(resource);
  }
}
