import { Injectable, inject, signal } from '@angular/core';
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
} from 'rxjs';
import { SearchItem, SearchService } from '../services/search.service';

@Injectable({ providedIn: 'root' })
export class SearchStore {
  // 🔵 UI → signal
  readonly searchQuery = signal<string>('');

  // 🔵 Estado de UI
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly searchService = inject(SearchService);

  // Signal → Observable (fromSignal en el plan)
  private readonly query$ = toObservable(this.searchQuery);

  // Observable<SearchItem[]> → Signal<SearchItem[]>
  readonly results = toSignal<SearchItem[], SearchItem[]>(
    this.query$.pipe(
      // 1) Normalizar input
      map((value) => value.trim()),

      // 2) Side-effect: resetear error/loading cuando el término está vacío
      tap((term) => {
        if (term === '') {
          this.error.set(null);
          this.loading.set(false);
        }
      }),

      // 3) Debounce + distinct para intención del usuario
      debounceTime(400),
      distinctUntilChanged(),

      // 4) switchMap con cancelación + retry + manejo de errores
      switchMap((term) => {
        // Campo vacío → cancela búsquedas previas y devuelve []
        if (term === '') {
          return of<SearchItem[]>([]);
        }

        // Término demasiado corto → no golpeamos backend
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
      })
    ),
    {
      // 👈 le damos tipo explícito al [] para que no sea never[]
      initialValue: [] as SearchItem[],
    }
  );

  // API pública para la UI
  setQuery(term: string) {
    this.searchQuery.set(term);
  }
}
