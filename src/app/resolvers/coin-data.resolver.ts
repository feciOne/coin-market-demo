import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Crypto } from '../models/crypto.model';
import { CryptoService } from '../services/crypto/crypto.service';

@Injectable({
  providedIn: 'root',
})
export class CoinDataResolver implements Resolve<Crypto.Item[]> {
  constructor(private cryptoService: CryptoService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Crypto.Item[]> {
    const idParam = route.paramMap.get('id');
    const id = idParam ? idParam : 'bitcoin';
    sessionStorage.setItem('coinId', id);

    return this.cryptoService.getCoinsMarketData(id).pipe(
      tap((data) => {
        this.cryptoService.selected = data[0].id;
        this.cryptoService.selectedCoin.next(data[0]);
      })
    );
  }
}
