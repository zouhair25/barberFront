import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BarberApiService } from '../../../core/services/barber-api.service';

@Component({
  selector: 'app-barber-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h1>
      <div class="card">
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Nom du salon</label>
            <input type="text" [(ngModel)]="form.shopName" class="input-field">
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 block mb-1">Bio</label>
            <textarea [(ngModel)]="form.bio" class="input-field" rows="3"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Adresse</label>
              <input type="text" [(ngModel)]="form.address" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Ville</label>
              <input type="text" [(ngModel)]="form.city" class="input-field"></div>
          </div>
          <div><label class="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
            <input type="tel" [(ngModel)]="form.phone" class="input-field"></div>
        </div>
        <div class="mt-6 flex gap-3">
          <button (click)="save()" [disabled]="saving()" class="btn-primary disabled:opacity-50">
            {{ saving() ? 'Sauvegarde...' : 'Enregistrer' }}
          </button>
          @if (saved()) { <span class="text-green-600 font-medium self-center">✅ Sauvegardé!</span> }
        </div>
      </div>
    </div>
  `
})
export class BarberProfileComponent implements OnInit {
  form: any = { shopName: '', bio: '', address: '', city: '', phone: '' };
  saving = signal(false);
  saved = signal(false);

  constructor(private barberApi: BarberApiService) {}

  ngOnInit() {
    this.barberApi.getMyProfile().subscribe(p => {
      this.form = { shopName: p.shopName, bio: p.bio, address: p.address, city: p.city, phone: p.phone };
    });
  }

  save() {
    this.saving.set(true);
    this.barberApi.updateProfile(this.form).subscribe(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    });
  }
}
