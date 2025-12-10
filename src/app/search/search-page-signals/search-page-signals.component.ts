import { Component, inject } from '@angular/core';
import { SearchStore } from './search.store';

@Component({
  selector: 'app-search-page-signals',
  imports: [],
  templateUrl: './search-page-signals.component.html',
  styleUrl: './search-page-signals.component.scss',
})
export class SearchPageSignalsComponent {
  readonly store = inject(SearchStore);

  onSearchChange(term: string) {
    this.store.setQuery(term);
  }
}
