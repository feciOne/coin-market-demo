import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { Currency } from '../../models/currency.model';
import {
  CurrencyService,
  defaultCurrency,
} from '../../services/currency/currency.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit, OnDestroy {
  selectedCurrency = defaultCurrency;
  currencyList: Currency.Item[] = [];
  destroy$ = new Subject<boolean>();

  constructor(
    private currencyService: CurrencyService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currencyService.getCurrencyList();

    this.currencyService.list
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Currency.Item[]) => {
        this.currencyList = data;
        this.cdRef.detectChanges();
      });
  }

  currencyChanged(): void {
    this.currencyService.selectedCurrency.next(this.selectedCurrency);
    this.currencyService.selectedCurrency
      .pipe(take(2))
      .subscribe((currency) => {
        this.selectedCurrency = currency;
        this.cdRef.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
