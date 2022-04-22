import { Pipe, PipeTransform } from '@angular/core';
import { CryptoService } from '../services/crypto/crypto.service';

@Pipe({
  name: 'myCurrency',
})
export class MyCurrencyPipe implements PipeTransform {
  constructor(private cryptoService: CryptoService) {}

  transform(value: number): string {
    if (!value) return '';

    return `${value} ${this.cryptoService.selectedCurrency}`;
  }
}
