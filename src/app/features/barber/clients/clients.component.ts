import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserApiService } from '../../../core/services/user-api.service';
import { CreateClientRequest } from '../../../core/services/user-centre-soin-api.service';
import { ClientApiService } from '@core/services/client-api';
import { Client } from '@core/models/client.model';
import { Ville } from '@core/models/user.model';

const EMPTY_FORM = (): CreateClientRequest & { villeLabel: string } => ({
  firstName: '', lastName: '', email: '', phone: '', address: '', villeId: undefined, villeLabel: ''
});

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private villeSubject = new Subject<string>();

  allClients = signal<Client[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  showModal = signal(false);
  adding = signal(false);
  error = signal('');
  villeSuggestions: Ville[] = [];

  form = EMPTY_FORM();

  clients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allClients();
    return this.allClients().filter(c => {
      const name = `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.toLowerCase();
      return name.includes(q)
        || (c.user?.email ?? '').toLowerCase().includes(q)
        || (c.user?.phone ?? '').toLowerCase().includes(q);
    });
  });

  constructor(
    private clientApiService: ClientApiService,
    private userApi: UserApiService
  ) {}

  ngOnInit() {
    this.load();
    this.villeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.trim().length > 1 ? this.userApi.searchVilles(q) : of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(villes => this.villeSuggestions = villes);
  }

  load() {
    this.loading.set(true);
    this.clientApiService.myClient().subscribe({
      next: res => { this.allClients.set(res.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openModal() {
    this.form = EMPTY_FORM();
    this.error.set('');
    this.villeSuggestions = [];
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.villeSuggestions = [];
  }

  onVilleInput(value: string) {
    this.form.villeLabel = value;
    this.form.villeId = undefined;
    this.villeSubject.next(value);
  }

  selectVille(v: Ville) {
    this.form.villeLabel = v.name;
    this.form.villeId = v.id;
    this.villeSuggestions = [];
  }

  submitCreate() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email) return;
    this.adding.set(true);
    this.error.set('');
    const { villeLabel: _, ...payload } = this.form;
    this.clientApiService.createClient(payload).subscribe({
      next: () => {
        this.adding.set(false);
        this.closeModal();
        this.load();
      },
      error: err => {
        this.error.set(err?.error?.message ?? 'Une erreur est survenue.');
        this.adding.set(false);
      }
    });
  }

  remove(id: number) {
    if (!confirm('Retirer ce client du salon ?')) return;
    this.clientApiService.remove(id).subscribe(() => this.load());
  }

  initials(c: Client): string {
    return `${c.user?.firstName?.charAt(0) ?? ''}${c.user?.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }
}
