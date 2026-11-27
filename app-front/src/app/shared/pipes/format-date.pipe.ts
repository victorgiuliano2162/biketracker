import { Pipe, PipeTransform } from '@angular/core';

export type DateFormatStyle = 'short' | 'long';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, style: DateFormatStyle = 'short'): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: style === 'long' ? 'long' : 'short',
      year: 'numeric',
    });
  }
}
