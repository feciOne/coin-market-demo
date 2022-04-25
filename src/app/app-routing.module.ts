import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoinInfoComponent } from './components/coin-info/coin-info.component';
import { IntroComponent } from './components/intro/intro.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CoinDataResolver } from './resolvers/coin-data.resolver';

const routes: Routes = [
  { path: '', component: IntroComponent, pathMatch: 'full' },
  {
    path: 'info/:id',
    component: CoinInfoComponent,
    resolve: [CoinDataResolver],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [CoinDataResolver],
})
export class AppRoutingModule {}
