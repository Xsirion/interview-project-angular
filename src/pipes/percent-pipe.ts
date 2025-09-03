import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percent',
})
export class PercentPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null || value === undefined) return '0,00%';
    return value.toFixed(2).replace('.', ',') + '%';
  }
}
