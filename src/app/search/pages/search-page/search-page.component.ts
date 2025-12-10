import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  concatMap,
  count,
  debounceTime,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  map,
  mergeMap,
  of,
  retry,
  switchMap,
  tap,
} from 'rxjs';
import { SearchItem, SearchService } from '../../services/search.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  searchControl = new FormControl<string>('', { nonNullable: true });

  private readonly flatten = switchMap;
  // private readonly flatten = mergeMap;
  // private readonly flatten = concatMap;
  // private readonly flatten = exhaustMap;

  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<SearchItem[]>([]);

  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.setupSearchStream();
  }

  private setupSearchStream() {
    this.searchControl.valueChanges
      .pipe(
        // 1) normalización
        map((value) => value.trim()),
        tap((term) => {
          if (term === '') {
            this.results.set([]);
            this.error.set(null);
            this.loading.set(false);
          }
        }),
        // 2) filtramos búsquedas cortas
        // filter((term) => term.length >= 2),
        // 3) esperamos a usuario
        debounceTime(400),
        // 4) evitamos repetir trabajo
        distinctUntilChanged(),
        this.flatten((term) => {
          if (term === '') {
            return of<SearchItem[]>([]);
          }
          if (term.length < 2) {
            return of<SearchItem[]>([]);
          }
          this.loading.set(true);
          this.error.set(null);
          return this.searchService.search(term).pipe(
            retry({
              count: 2,
              delay: 500,
            }),
            catchError((err) => {
              console.log('search error', err);
              this.error.set('Ocurrió un error buscando. Intenta de nuevo.');
              return of<SearchItem[]>([]);
            }),
            finalize(() => {
              this.loading.set(false);
            })
          );
        }),
        tap((items) => {
          console.log('RESULTADO EMITIDO POR EL OPERADOR:', items);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((items) => {
        this.results.set(items);
      });
  }
}
