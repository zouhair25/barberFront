import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Avis Clients</h1>

      <div class="space-y-4">
        @for (r of reviews(); track r.id) {
          <div class="card" [class.opacity-60]="!r.visible">
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-medium">{{ r.client?.firstName }} {{ r.client?.lastName }}</span>
                <span class="text-amber-500 ml-3">
                  @for (i of stars(r.rating); track i) { ★ }
                  @for (i of emptyStars(r.rating); track i) { ☆ }
                </span>
              </div>
              <div class="flex gap-2 items-center">
                <span class="text-gray-400 text-xs">{{ r.createdAt | date:'dd/MM/yyyy' }}</span>
                <button (click)="toggleVisibility(r)" class="text-sm text-gray-400 hover:text-indigo-600">
                  {{ r.visible ? '👁️ Masquer' : '🙈 Afficher' }}
                </button>
              </div>
            </div>
            @if (r.comment) {
              <p class="text-gray-600 text-sm">{{ r.comment }}</p>
            }
          </div>
        }
        @if (reviews().length === 0) {
          <div class="card text-center text-gray-500 py-12">
            <p class="text-4xl mb-3">⭐</p>
            <p>Aucun avis pour le moment</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ReviewsComponent implements OnInit {
  reviews = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('/api/v1/barber/reviews').subscribe(r => this.reviews.set(r.content || []));
  }

  toggleVisibility(review: any) {
    this.http.patch(`/api/v1/barber/reviews/${review.id}/visibility`, {}).subscribe((r: any) => {
      this.reviews.update(list => list.map(rv => rv.id === r.id ? r : rv));
    });
  }

  stars(rating: number): number[] { return Array(rating).fill(0); }
  emptyStars(rating: number): number[] { return Array(5 - rating).fill(0); }
}
