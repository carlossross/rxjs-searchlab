import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  search(term: string): Observable<SearchItem[]> {
    const normalized = term.toLowerCase();

    return of(MOCK_ITEMS).pipe(
      delay(600),
      map((items) =>
        items.filter(
          (item) =>
            item.title.toLowerCase().includes(normalized) ||
            item.description.toLowerCase().includes(normalized)
        )
      )
    );
  }
}
