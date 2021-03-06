import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Crypto, LoadingTypes } from '../../models/crypto.model';
import { CurrencyService } from '../currency/currency.service';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  retry,
  switchMap,
  take,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private _apiUrl = environment.cryptoApiUrl;
  private _selectedCoin: Crypto.Item | undefined = undefined;
  private _selectedCurrency = '';
  private _prevCurrency = 'USD';
  private _page = 1;
  selectedCoin = new BehaviorSubject<Crypto.Item>({} as Crypto.Item);
  listBackup: Crypto.Item[] = [];
  list = new BehaviorSubject<Crypto.Item[]>([]);

  set selected(data: string | Crypto.Item) {
    const id = typeof data === 'string' ? data : data.id;

    this._selectedCoin = this.listBackup.find(
      (coin: Crypto.Item) => coin.id === id
    );
    this.selectedCoin.next(
      this._selectedCoin ? this._selectedCoin : ({} as Crypto.Item)
    );
  }

  get selected(): Crypto.Item {
    return this._selectedCoin ? this._selectedCoin : ({} as Crypto.Item);
  }

  get selectedCurrency() {
    return this._selectedCurrency;
  }

  constructor(
    private currencyService: CurrencyService,
    private httpClient: HttpClient
  ) {
    currencyService.selectedCurrency
      .pipe(
        tap((currency) => {
          this._prevCurrency = this._selectedCurrency;
          this._selectedCurrency = currency;
        }),
        switchMap(() =>
          this.listBackup.length > 0
            ? this.getCoinsMarketData(this.getLastCoinsId())
            : this.getCoinList('RESET')
        )
      )
      .subscribe((data: Crypto.Item[]) => {
        const coin = data.find((item) => item.id === this._selectedCoin?.id);

        if (data.length > 1) {
          this.list.next(data);
          this.listBackup = data;
        }

        this.selectedCoin.next(coin ? coin : data[0]);
      });
  }

  getCoinList(
    loadingType: LoadingTypes = 'CACHE'
  ): Observable<Crypto.Item[]> {
    this._page =
      loadingType === 'MORE'
        ? ++this._page
        : loadingType === 'RESET'
        ? 1
        : this._page;

    const params = new HttpParams()
      .set('vs_currency', this._selectedCurrency)
      .set('order', 'market_cap_desc')
      .set('per_page', 250)
      .set('page', this._page);

    if (loadingType === 'CACHE' && this.listBackup.length > 0) {
      return of(this.listBackup);
    } else {
      return this.httpClient
        .get<Crypto.Item[]>(this._apiUrl + '/coins/markets', { params })
        .pipe(
          take(1),
          retry(1),
          catchError(({ error }: HttpErrorResponse) => {
            if (error.error === 'invalid vs_currency') {
              alert(
                `${this._selectedCurrency} exchange is not available for ${this._selectedCoin?.name}`
              );
              this.currencyService.selectedCurrency.next(this._prevCurrency);
            }

            return of(this.listBackup);
          })
        );
    }
  }

  getCoinsMarketData(id: string): Observable<Crypto.Item[]> {
    const lastId = this.getLastCoinsId();
    id = lastId ? lastId : id;
    const selected = this.listBackup.find((item) => item.id === id);
    const params = new HttpParams()
      .set('vs_currency', this._selectedCurrency)
      .set('ids', selected ? selected.id : (typeof this.selected === 'string' && this.selected) ? this.selected : id );

    return this.httpClient
      .get<Crypto.Item[]>(this._apiUrl + '/coins/markets', { params })
      .pipe(take(1), retry(1));
  }

  private getLastCoinsId(): string {
    const lastId = sessionStorage.getItem('coinId');

    return lastId ? lastId : '';
  }
}
