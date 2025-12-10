import { Routes } from '@angular/router';
import { SearchPageComponent } from './search/search-page/search-page.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
