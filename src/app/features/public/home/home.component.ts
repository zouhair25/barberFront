import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BarberApiService } from '../../../core/services/barber-api.service';
import { BarberPublic } from '../../../core/models/barber.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
  
})
export class HomeComponent implements OnInit {
  barbers = signal<BarberPublic[]>([]);
  filteredBarbers = signal<BarberPublic[]>([]);
  loading = signal(true);
  searchQuery = '';

  constructor(private barberApi: BarberApiService) {}

  ngOnInit() {
    this.barberApi.listBarbers(0, 50).subscribe({
      next: res => {
        this.barbers.set(res.content);
        this.filteredBarbers.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filter() {
    const q = this.searchQuery.toLowerCase();
    this.filteredBarbers.set(
      this.barbers().filter(b =>
        b.shopName.toLowerCase().includes(q) ||
        (b.city?.toLowerCase().includes(q) ?? false)
      )
    );
  }
}
