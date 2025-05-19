export const first = (
    results: any,
    formatter: (val: any) => string
  ): string => {
    if (Array.isArray(results) && results.length > 0) {
      return formatter(results[0]);
    }
    return formatter(results);
  };
  
  export const join = (
    results: any,
    formatter: (val: any) => string,
    delimiter: string = ', '
  ): string => {
    if (Array.isArray(results)) {
      return results.map(formatter).join(delimiter);
    }
    return formatter(results);
  };
  

  