import 'jquery';

declare global {
  interface JQuery {
    select2(options?: any): JQuery;
    select2(method: string, ...args: any[]): JQuery;
  }
}

export {};
