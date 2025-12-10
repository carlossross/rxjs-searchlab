import { Injectable } from '@angular/core';
import { delay, map, mergeMap, Observable, of, throwError } from 'rxjs';

export interface SearchItem {
  id: number;
  title: string;
  description: string;
}

const MOCK_ITEMS: SearchItem[] = [
  { id: 1, title: 'Angular Signals', description: 'Estado reactivo moderno para Angular.' },
  { id: 2, title: 'RxJS switchMap', description: 'Operador para cancelar peticiones anteriores.' },
  { id: 3, title: 'RxJS mergeMap', description: 'Ejecuta peticiones en paralelo.' },
  { id: 4, title: 'Angular HttpClient', description: 'Cliente HTTP para Angular con Observables.' },
  {
    id: 5,
    title: 'TypeScript Advanced Types',
    description: 'Utilitarios y patrones para tipado avanzado.',
  },
  {
    id: 6,
    title: 'Formularios Reactivos',
    description: 'Control total de formularios con FormGroup.',
  },
  {
    id: 7,
    title: 'Arquitectura por features',
    description: 'Organización de proyectos Angular escalables.',
  },
];

export interface PagedResult<T> {
  items: T[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  search(term: string): Observable<SearchItem[]> {
    const normalized = term.toLowerCase();

    return of(MOCK_ITEMS).pipe(
      delay(Math.random() * 1500 + 200),
      mergeMap((items) => {
        const shouldFail = Math.random() < 0.3;
        if (shouldFail) {
          return throwError(() => new Error('Network error simulated'));
        }
        return of(items);
      }),
      map((items) =>
        items.filter(
          (item) =>
            item.title.toLowerCase().includes(normalized) ||
            item.description.toLowerCase().includes(normalized)
        )
      )
    );
  }

  // 🔵 Nuevo: búsqueda paginada
  searchPaged(term: string, page: number, pageSize: number): Observable<PagedResult<SearchItem>> {
    const normalized = term.toLowerCase();

    return of(MOCK_ITEMS).pipe(
      delay(Math.random() * 1500 + 200),
      mergeMap((items) => {
        const shouldFail = Math.random() < 0.3;
        if (shouldFail) {
          return throwError(() => new Error('Network error simulated'));
        }
        return of(items);
      }),
      map((items) =>
        items.filter(
          (item) =>
            item.title.toLowerCase().includes(normalized) ||
            item.description.toLowerCase().includes(normalized)
        )
      ),
      map((filtered) => {
        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const items = filtered.slice(start, end);
        return { items, total };
      })
    );
  }
}
