import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  MatSelectionList,
  MatSelectionListChange,
} from '@angular/material/list';
import { NavigationEnd, Router } from '@angular/router';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { Crypto } from 'src/app/models/crypto.model';
import { CryptoService } from '../../services/crypto/crypto.service';

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoinListComponent implements OnInit, OnDestroy {
  @ViewChild('listEl', { static: true }) listEl!: MatSelectionList;
  @ViewChild('scrollEl', { static: true }) scrollEl!: CdkScrollable;

  private _lockLoading = false;
  coinList: Crypto.Item[] = [];
  destroy$ = new Subject<boolean>();

  constructor(
    private cryptoService: CryptoService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cryptoService.list
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: Crypto.Item[]) => {
        this.coinList = data;
        this.cdRef.detectChanges();
      });

    // Auto de/selection when routing home or reload
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((e) => {
      if (e instanceof NavigationEnd) {
        e.url === '/' ? this.listEl.deselectAll() : this.selectItemByUrl(e.url);
      }
    });

    // Scrolling logic
    this.scrollEl
      .elementScrolled()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const toEnd = this.scrollEl.measureScrollOffset('bottom');

        if (!this._lockLoading && toEnd < 500) {
          this._lockLoading = true;

          this.cryptoService
            .getCoinList('MORE')
            .pipe(
              take(1),
              finalize(() => (this._lockLoading = false))
            )
            .subscribe((data) => {
              this.cryptoService.listBackup =
                this.cryptoService.listBackup.concat(data);
              this.cryptoService.list.next(this.cryptoService.listBackup);
            });
        }
      });
  }

  private selectItemByUrl(url: string): void {
    const parts = url.split('/');

    this.listEl.writeValue([...parts]);
  }

  updateSelection(selection: MatSelectionListChange): void {
    this.cryptoService.selected = selection.options[0].value;
    this.router.navigate(['info', this.cryptoService.selected.id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
