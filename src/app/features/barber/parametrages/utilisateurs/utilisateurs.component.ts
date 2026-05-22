import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserCentreSoinApiService,
  AddUserToCentreSoinRequest
} from '../../../../core/services/user-centre-soin-api.service';
import { UserCentreSoin } from '../../../../core/models/user-centre-soin.model';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-5">
        <div>
          <h2 class="text-lg font-semibold text-gray-700">Utilisateurs du centre</h2>
          <p class="text-xs text-gray-400">{{ users().length }} utilisateur(s) associé(s)</p>
        </div>
        <button (click)="showForm.set(!showForm())" class="btn-primary">+ Ajouter un utilisateur</button>
      </div>

      @if (showForm()) {
        <div class="card mb-5 border-2 border-indigo-200">
          <h3 class="font-semibold text-gray-800 mb-4">Ajouter un utilisateur au centre</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">
                Email de l'utilisateur <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                [(ngModel)]="form.userEmail"
                class="input-field"
                placeholder="utilisateur@exemple.com"
              >
              <p class="text-xs text-gray-400 mt-1">L'utilisateur doit déjà être inscrit sur la plateforme</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Adresse (optionnel)</label>
              <input
                type="text"
                [(ngModel)]="form.address"
                class="input-field"
                placeholder="Adresse au sein du centre"
              >
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <button (click)="add()" class="btn-primary" [disabled]="!form.userEmail || adding()">
              {{ adding() ? 'Ajout en cours...' : 'Ajouter' }}
            </button>
            <button (click)="cancelForm()" class="btn-secondary">Annuler</button>
          </div>
          @if (error()) {
            <div class="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {{ error() }}
            </div>
          }
        </div>
      }

      @if (loading()) {
        <div class="text-center py-10 text-gray-400">
          <p class="text-sm">Chargement...</p>
        </div>
      } @else if (users().length === 0) {
        <div class="text-center py-12 text-gray-400">
          <div class="text-4xl mb-3">👥</div>
          <p class="text-sm">Aucun utilisateur associé à ce centre.</p>
          <p class="text-xs mt-1">Ajoutez des collaborateurs pour qu'ils accèdent au centre.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (u of users(); track u.id) {
            <div class="card flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                @if (u.user?.profilePhoto) {
                  <img [src]="u.user!.profilePhoto" alt="Photo" class="w-10 h-10 rounded-full object-cover">
                } @else {
                  <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {{ u.user?.firstName?.charAt(0) }}{{ u.user?.lastName?.charAt(0) }}
                  </div>
                }
                <div>
                  <div class="font-medium text-gray-800">
                    {{ u.user?.firstName }} {{ u.user?.lastName }}
                  </div>
                  <div class="text-xs text-gray-500">{{ u.user?.email }}</div>
                  @if (u.user?.phone) {
                    <div class="text-xs text-gray-400">{{ u.user!.phone }}</div>
                  }
                  @if (u.address) {
                    <div class="text-xs text-gray-400 mt-0.5">📍 {{ u.address }}</div>
                  }
                </div>
              </div>
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                <span [class]="roleBadgeClass(u.user?.role)"
                  class="text-xs px-2 py-0.5 rounded-full font-medium">
                  {{ roleLabel(u.user?.role) }}
                </span>
                <button (click)="remove(u.id)" class="text-xs text-red-500 hover:underline">Retirer</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class UtilisateursComponent implements OnInit {
  users = signal<UserCentreSoin[]>([]);
  showForm = signal(false);
  loading = signal(true);
  adding = signal(false);
  error = signal('');

  form: AddUserToCentreSoinRequest = { userEmail: '', address: '' };

  constructor(private userCentreSoinApi: UserCentreSoinApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.userCentreSoinApi.list().subscribe({
      next: u => { this.users.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  add() {
    if (!this.form.userEmail) return;
    this.adding.set(true);
    this.error.set('');
    this.userCentreSoinApi.add(this.form).subscribe({
      next: () => {
        this.load();
        this.cancelForm();
        this.adding.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Une erreur est survenue. Vérifiez l\'email saisi.');
        this.adding.set(false);
      }
    });
  }

  remove(id: number) {
    if (!confirm('Retirer cet utilisateur du centre ?')) return;
    this.userCentreSoinApi.remove(id).subscribe(() => this.load());
  }

  cancelForm() {
    this.form = { userEmail: '', address: '' };
    this.error.set('');
    this.showForm.set(false);
  }

  roleLabel(role?: string): string {
    const labels: Record<string, string> = { USER: 'Client', BARBER: 'Coiffeur', ADMIN: 'Admin' };
    return labels[role ?? ''] ?? role ?? '—';
  }

  roleBadgeClass(role?: string): string {
    const classes: Record<string, string> = {
      USER: 'bg-blue-100 text-blue-700',
      BARBER: 'bg-indigo-100 text-indigo-700',
      ADMIN: 'bg-purple-100 text-purple-700'
    };
    return classes[role ?? ''] ?? 'bg-gray-100 text-gray-600';
  }
}
