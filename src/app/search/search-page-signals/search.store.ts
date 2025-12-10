import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  retry,
  switchMap,
  tap,
  combineLatest,
} from 'rxjs';
import { PagedResult, SearchItem, SearchService } from '../services/search.service';

@Injectable({ providedIn: 'root' })
export class SearchStore {
  // 🔵 UI → signals
  readonly searchQuery = signal<string>('');
  readonly page = signal<number>(1);

  // Config de paginación
  readonly pageSize = 3; // o lo que quieras

  // 🔵 Estado de UI
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Estado relacionado a paginación
  readonly total = signal(0);
  readonly totalPages = computed(() => {
    const total = this.total();
    return total === 0 ? 1 : Math.ceil(total / this.pageSize);
  });

  readonly filter = signal<'all' | 'title' | 'description'>('all');

  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private readonly searchService = inject(SearchService);

  // Signals → Observables
  private readonly query$ = toObservable(this.searchQuery);
  private readonly page$ = toObservable(this.page);

  // Combinamos query + page
  private readonly params$ = combineLatest([this.query$, this.page$]);

  // Observable<PagedResult> → Signal<SearchItem[]>
  // readonly results = toSignal<SearchItem[], SearchItem[]>(
  //   this.params$.pipe(
  //     // params$: [term, page]
  //     map(([term, page]) => ({
  //       term: term.trim(),
  //       page,
  //     })),

  //     tap(({ term }) => {
  //       if (term === '') {
  //         this.error.set(null);
  //         this.loading.set(false);
  //         this.total.set(0);
  //       }
  //     }),

  //     debounceTime(400),
  //     distinctUntilChanged((prev, curr) => prev.term === curr.term && prev.page === curr.page),

  //     switchMap(({ term, page }) => {
  //       // Campo vacío → no buscamos
  //       if (term === '') {
  //         return of<PagedResult<SearchItem>>({ items: [], total: 0 });
  //       }

  //       // término demasiado corto → tampoco
  //       if (term.length < 2) {
  //         return of<PagedResult<SearchItem>>({ items: [], total: 0 });
  //       }

  //       this.loading.set(true);
  //       this.error.set(null);

  //       return this.searchService.searchPaged(term, page, this.pageSize).pipe(
  //         retry({
  //           count: 2,
  //           delay: 500,
  //         }),
  //         catchError((err) => {
  //           console.log('search error', err);
  //           this.error.set('Ocurrió un error buscando. Intenta de nuevo.');
  //           return of<PagedResult<SearchItem>>({ items: [], total: 0 });
  //         }),
  //         finalize(() => {
  //           this.loading.set(false);
  //         })
  //       );
  //     }),

  //     // Actualizamos total y devolvemos solo items
  //     map((paged) => {
  //       this.total.set(paged.total);
  //       return paged.items;
  //     })
  //   ),
  //   {
  //     initialValue: [] as SearchItem[],
  //   }
  // );

  private readonly resultsRaw = toSignal<SearchItem[], SearchItem[]>(
    this.params$.pipe(
      map(([term, page]) => ({
        term: term.trim(),
        page,
      })),

      tap(({ term }) => {
        if (term === '') {
          this.error.set(null);
          this.loading.set(false);
          this.total.set(0);
        }
      }),

      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.term === curr.term && prev.page === curr.page),

      switchMap(({ term, page }) => {
        if (term === '') {
          return of<PagedResult<SearchItem>>({ items: [], total: 0 });
        }

        if (term.length < 2) {
          return of<PagedResult<SearchItem>>({ items: [], total: 0 });
        }

        this.loading.set(true);
        this.error.set(null);

        return this.searchService.searchPaged(term, page, this.pageSize).pipe(
          retry({
            count: 2,
            delay: 500,
          }),
          catchError((err) => {
            console.log('search error', err);
            this.error.set('Ocurrió un error buscando. Intenta de nuevo.');
            return of<PagedResult<SearchItem>>({ items: [], total: 0 });
          }),
          finalize(() => {
            this.loading.set(false);
          })
        );
      }),

      map((paged) => {
        this.total.set(paged.total);
        return paged.items; // ← SearchItem[]
      })
    ),
    {
      initialValue: [] as SearchItem[],
    }
  );

  // 🟣 Resultados filtrados (lo que consumirá la UI)
  readonly results = computed(() => {
    const items = this.resultsRaw();
    const filter = this.filter();

    if (filter === 'title') {
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes('angular') || item.title.toLowerCase().includes('rxjs')
      );
    }

    if (filter === 'description') {
      return items.filter(
        (item) =>
          item.description.toLowerCase().includes('angular') ||
          item.description.toLowerCase().includes('rxjs')
      );
    }

    // 'all'
    return items;
  });

  // ===== API pública para la UI =====

  setQuery(term: string) {
    this.searchQuery.set(term);
    this.page.set(1); // 🔴 reset de página al cambiar query
  }

  nextPage() {
    if (!this.hasNext()) return;
    this.page.update((p) => p + 1);
  }

  prevPage() {
    if (!this.hasPrev()) return;
    this.page.update((p) => p - 1);
  }

  setFilter(filter: 'all' | 'title' | 'description') {
    this.filter.set(filter);
    this.page.set(1); // opcional pero suele tener sentido: resetear página al cambiar filtro
  }
}
