import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  distinctUntilChanged,
  interval,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Crypto } from '../../models/crypto.model';
import { CryptoService } from '../../services/crypto/crypto.service';

@Component({
  selector: 'app-coin-info',
  templateUrl: './coin-info.component.html',
  styleUrls: ['./coin-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoinInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  data!: Crypto.Item;
  destroy$ = new Subject<boolean>();

  constructor(
    private cryptoService: CryptoService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cryptoService.selectedCoin
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((coinData) => {
        this.data = coinData;
        this.cdRef.detectChanges();
      });
  }

  ngAfterViewInit(): void {
    interval(10000)
      .pipe(
        switchMap(() =>
          this.cryptoService.getCoinsMarketData(this.data.id)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((coinData) => {
        this.data = coinData[0];
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();

    sessionStorage.removeItem('coinId');
  }
}
