import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { Crypto } from '../models/crypto.model';
import { CryptoService } from '../services/crypto/crypto.service';

@Injectable({
  providedIn: 'root',
})
export class CoinDataResolver implements Resolve<Crypto.Item[]> {
  constructor(private cryptoService: CryptoService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Crypto.Item[]> {
    const symbol = route.paramMap.get('symbol');

    return this.cryptoService.getCoinList().pipe(
      tap((data) => {
        this.cryptoService.list.next(data);
        this.cryptoService.listBackup = data;
      }),
      switchMap(() =>
        this.cryptoService.getCoinsMarketData(symbol).pipe(
          tap((data) => {
            this.cryptoService.selected = data[0];
          })
        )
      )
    );
  }
}
