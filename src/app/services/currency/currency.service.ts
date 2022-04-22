import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Currency } from '../../models/currency.model';
import { BehaviorSubject, retry, take } from 'rxjs';

export const defaultCurrency = 'USD';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private _apiUrl = environment.currencyApiUrl;
  selectedCurrency = new BehaviorSubject<string>(defaultCurrency);
  listBackup: Currency.Item[] = [];
  list = new BehaviorSubject<Currency.Item[]>([]);

  constructor(private httpClient: HttpClient) {}

  getCurrencyList(): void {
    if (this.listBackup.length === 0) {
      this.httpClient
        .get<Currency.DataResponse>(this._apiUrl + '/currencies')
        .pipe(take(1), retry(2))
        .subscribe((data: Currency.DataResponse) => {
          this.list.next(data.data);
        });
    } else {
      this.list.next(this.listBackup);
    }
  }
}
