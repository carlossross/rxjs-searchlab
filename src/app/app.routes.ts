import { Routes } from '@angular/router';
import { SearchPageComponent } from './search/pages/search-page/search-page.component';
import { SearchPageSignalsComponent } from './search/search-page-signals/search-page-signals.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchPageComponent,
  },
  {
    path: 'signals',
    component: SearchPageSignalsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
