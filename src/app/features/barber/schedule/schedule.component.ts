import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberApiService } from '../../../core/services/barber-api.service';
import { OpeningHours, ClosingDay } from '../../../core/models/barber.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Horaires & Fermetures</h1>

      <!-- Opening hours -->
      <div class="card mb-6">
        <h2 class="font-semibold text-gray-700 mb-4">Horaires d'ouverture</h2>
        @for (day of schedule; track day.dayOfWeek; let i = $index) {
          <div class="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
            <div class="w-28 font-medium text-gray-700">{{ dayName(day.dayOfWeek) }}</div>
            <input type="checkbox" [(ngModel)]="schedule[i].closed" [ngModelOptions]="{standalone: true}"
                   class="w-4 h-4" title="Fermé"> <span class="text-sm text-gray-500">Fermé</span>

            @if (!schedule[i].closed) {
              <input type="time" [(ngModel)]="schedule[i].openTime" class="input-field w-28 text-sm py-1">
              <span class="text-gray-400">→</span>
              <input type="time" [(ngModel)]="schedule[i].closeTime" class="input-field w-28 text-sm py-1">
              <div class="flex items-center gap-1">
                <input type="number" [(ngModel)]="schedule[i].slotDurationMin" class="input-field w-16 text-sm py-1" min="10" step="5">
                <span class="text-xs text-gray-500">min</span>
              </div>
            }
          </div>
        }
        <button (click)="saveHours()" [disabled]="saving()" class="btn-primary mt-4 disabled:opacity-50">
          {{ saving() ? 'Sauvegarde...' : 'Enregistrer les horaires' }}
        </button>
        @if (saved()) { <span class="text-green-600 ml-3">✅ Sauvegardé!</span> }
      </div>

      <!-- Closing days -->
      <div class="card">
        <h2 class="font-semibold text-gray-700 mb-4">Jours de fermeture exceptionnels</h2>
        <div class="flex gap-3 mb-4">
          <input type="date" [(ngModel)]="newDate" class="input-field">
          <input type="text" [(ngModel)]="newReason" placeholder="Raison (optionnel)" class="input-field flex-1">
          <button (click)="addClosingDay()" class="btn-primary">Ajouter</button>
        </div>
        @for (cd of closingDays(); track cd.id) {
          <div class="flex justify-between items-center py-2 border-b last:border-0">
            <div>
              <span class="font-medium">{{ cd.closedDate | date:'dd/MM/yyyy' }}</span>
              @if (cd.reason) { <span class="text-gray-500 text-sm ml-2">— {{ cd.reason }}</span> }
            </div>
            <button (click)="removeClosingDay(cd.id)" class="text-red-400 hover:text-red-600 text-sm">Supprimer</button>
          </div>
        }
      </div>
    </div>
  `
})
export class ScheduleComponent implements OnInit {
  schedule: OpeningHours[] = [];
  closingDays = signal<ClosingDay[]>([]);
  saving = signal(false);
  saved = signal(false);
  newDate = '';
  newReason = '';

  private readonly days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  constructor(private barberApi: BarberApiService) {
    this.schedule = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i, openTime: '09:00', closeTime: '18:00', closed: i === 0, slotDurationMin: 30
    }));
  }

  ngOnInit() {
    this.barberApi.getMyProfile().subscribe((p: any) => {
      if (p.openingHours?.length) {
        p.openingHours.forEach((h: OpeningHours) => {
          const idx = this.schedule.findIndex(s => s.dayOfWeek === h.dayOfWeek);
          if (idx >= 0) this.schedule[idx] = { ...this.schedule[idx], ...h };
        });
      }
    });
  }

  saveHours() {
    this.saving.set(true);
    this.barberApi.updateHours(this.schedule).subscribe(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }

  addClosingDay() {
    if (!this.newDate) return;
    this.barberApi.addClosingDay(this.newDate, this.newReason).subscribe(cd => {
      this.closingDays.update(list => [...list, cd]);
      this.newDate = '';
      this.newReason = '';
    });
  }

  removeClosingDay(id: number) {
    this.barberApi.removeClosingDay(id).subscribe(() => {
      this.closingDays.update(list => list.filter(d => d.id !== id));
    });
  }

  dayName(day: number): string { return this.days[day]; }
}
