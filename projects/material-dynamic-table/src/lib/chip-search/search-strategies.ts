import moment from 'moment';
import { FhirPath } from 'fhir';

export interface SearchStrategy {
    apply(filter: any): any;
    match(cellValue: any, filter: any): boolean; 
    cellType?: string;
}
 
export class TextSearchStrategy implements SearchStrategy {
  // Bereitet den Filter vor (apply) – bleibt wie gehabt
  apply(filter: any): any {
    return { column: filter.column, value: filter.value.toLowerCase() };
  }

  // Vergleicht den Zellwert mit dem Filter
  match(cellValue: any, filter: any): boolean {
    const cellString = cellValue ? cellValue.toString().toLowerCase() : '';
    return cellString.includes(filter.value);
  }
}

export class DateSearchStrategy implements SearchStrategy {
  apply(filter: any): any {
    const displayFormat = this.resolveDisplayFormat(filter.options);
    return {
      column: filter.column,
      value: String(filter.value).trim().toLowerCase(),
      displayFormat: displayFormat,
      type: 'date',
      yearOnly: this.isYearSearch(filter.value, displayFormat)
    };
  }

  match(cellValue: any, filter: any): boolean {
    try {
      // 1. Parse the original cell value into a date
      const date = this.parseDate(cellValue);
      if (!date) return false;

      // 2. Format the date using the display format
      const formattedDate = moment(date).format(filter.displayFormat).toLowerCase();

      // 3. Check if the filter value is included in the formatted date
      return formattedDate.includes(filter.value);
    } catch (e) {
      console.error('Error in DateSearchStrategy.match:', e);
      return false;
    }
  }

  private parseDate(value: any): Date | null {
    if (!value) return null;

    
    // Use moment.js to parse the date
    const parsedDate = moment(value, moment.ISO_8601, true);
    return parsedDate.isValid() ? parsedDate.toDate() : null;
  }

  private resolveDisplayFormat(options: any): string {
    // Default to 'YYYY/MM/DD' if no specific format is provided
    return options?.displayFormat || 'YYYY/MM/DD';
  }

  private isYearSearch(value: string, displayFormat: string): boolean {
    // Check if the search value is only a year (e.g., "2015")
    return displayFormat === 'YYYY' && /^\d{4}$/.test(value);
  }
}

export class MomentSearchStrategy implements SearchStrategy {

  apply(filter: any): any {
    const format = filter.format || 'LLLL';
    return {
      column: filter.column,
      value: filter.value.toLowerCase().trim(),
      format: format,
      type: 'moment'
    };
  }

  match(cellValue: any, filter: any): boolean {
    const m = moment(cellValue);
    if (!m.isValid()) {
      console.warn('Ungültiger Moment-Wert:', cellValue);
      return false;
    }
    
    const activeLocale = moment.locale() || 'en';
    const format = filter.format || 'LLLL';
    const searchTerm = filter.value.toLowerCase().trim();
    
    const formatted = m.locale(activeLocale).format(format).toLowerCase();
    console.log('Formatted value:', formatted, '| Search term:', searchTerm);
    
    if (formatted.includes(searchTerm)) {
      return true;
    }
    
    // Zusätzlich: explizite Prüfung des vollen Wochentags
    const fullWeekday = m.locale(activeLocale).format('dddd').toLowerCase();
    if (fullWeekday.includes(searchTerm)) {
      return true;
    }
    
    // Optionaler Fallback: Falls activeLocale nicht "en" ist
    if (activeLocale !== 'en') {
      const englishFormatted = m.locale('en').format(format).toLowerCase();
      if (englishFormatted.includes(searchTerm)) {
        return true;
      }
      const englishWeekday = m.locale('en').format('dddd').toLowerCase();
      if (englishWeekday.includes(searchTerm)) {
        return true;
      }
    }
    
    return false;
  }
}

export class FhirSearchStrategy implements SearchStrategy {
  apply(filter: any): any { // filter ist hier mergedFilter aus updateFilter
    return {
      column: filter.column,
      value: String(filter.value).toLowerCase().trim(),
      fhirPath: filter.fhirPath, // Wichtig: fhirPath beibehalten!
      type: 'fhir' // Sicherstellen, dass der Typ korrekt ist
    };
  }

  match(cellValue: any, filter: any): boolean {
    // Diese cellValue wird von filterPredicate (siehe Schritt 3) bereits ausgewertet sein.
    // filter.value ist der Suchbegriff, bereits in Kleinbuchstaben.
    if (cellValue == null) {
      return false;
    }

    const arr: string[] = Array.isArray(cellValue)
      ? cellValue.map(v => String(v).toLowerCase()) // Werte aus fhirPath hier in Kleinbuchstaben umwandeln
      : [String(cellValue).toLowerCase()];
    const term = filter.value; // Ist bereits in Kleinbuchstaben durch apply()

    return arr.some(text => text.includes(term));
  }
}