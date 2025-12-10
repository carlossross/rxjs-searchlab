import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-page',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  searchControl = new FormControl<string>('', { nonNullable: true });

  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<unknown[]>([]);
}
