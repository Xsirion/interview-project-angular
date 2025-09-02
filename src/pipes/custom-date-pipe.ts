import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
})
export class CustomDatePipe implements PipeTransform {
  transform(lastUpdateTime: string): string {
    const date = new Date(lastUpdateTime);
    return date.toLocaleTimeString('pl-PL');
  }
}
