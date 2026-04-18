import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { StatsApiService } from '../../../core/services/stats-api.service';
import { format, subDays, subMonths } from 'date-fns';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Statistiques</h1>

      <!-- Period selector -->
      <div class="flex gap-3 mb-6">
        @for (p of periods; track p.label) {
          <button (click)="selectPeriod(p.days)"
                  [class]="activePeriod === p.days ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'"
                  class="px-4 py-2 rounded-lg text-sm font-medium hover:shadow transition">
            {{ p.label }}
          </button>
        }
      </div>

      <!-- Revenue chart -->
      <div class="card mb-6">
        <h2 class="font-bold text-gray-800 mb-4">Chiffre d'Affaires</h2>
        @if (revenueChartData()) {
          <canvas baseChart [data]="revenueChartData()!" type="bar" [options]="chartOptions" height="100"></canvas>
        }
      </div>

      <!-- Services + clients row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div class="card">
          <h2 class="font-bold text-gray-800 mb-4">Services populaires</h2>
          @for (s of topServices(); track s.name; let i = $index) {
            <div class="flex items-center gap-3 mb-3">
              <span class="text-gray-400 text-sm w-5">{{ i + 1 }}</span>
              <div class="flex-1">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">{{ s.name }}</span>
                  <span class="text-gray-500">{{ s.count }} fois</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div class="bg-indigo-500 h-2 rounded-full"
                       [style.width.%]="(s.count / topServices()[0].count) * 100"></div>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="card">
          <h2 class="font-bold text-gray-800 mb-4">Clients fidèles</h2>
          @for (c of loyalClients(); track c.id; let i = $index) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                {{ i + 1 }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-sm">{{ c.firstName }} {{ c.lastName }}</div>
                <div class="text-gray-400 text-xs">{{ c.visitCount }} visite(s)</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class StatisticsComponent implements OnInit {
  revenueChartData = signal<ChartData<'bar'> | null>(null);
  topServices = signal<any[]>([]);
  loyalClients = signal<any[]>([]);
  activePeriod = 30;

  periods = [
    { label: '7 jours', days: 7 },
    { label: '30 jours', days: 30 },
    { label: '3 mois', days: 90 },
    { label: '1 an', days: 365 },
  ];

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private statsApi: StatsApiService) {}

  ngOnInit() {
    this.selectPeriod(30);
    this.statsApi.getLoyalClients(5).subscribe(c => this.loyalClients.set(c));
  }

  selectPeriod(days: number) {
    this.activePeriod = days;
    const to = new Date();
    const from = subDays(to, days);
    const fromStr = from.toISOString();
    const toStr = to.toISOString();

    this.statsApi.getRevenue(fromStr, toStr, days <= 30 ? 'DAY' : 'WEEK').subscribe(data => {
      this.revenueChartData.set({
        labels: data.map(d => format(new Date(d.period), 'dd/MM')),
        datasets: [{
          data: data.map(d => d.revenue),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1
        }]
      });
    });

    this.statsApi.getTopServices(fromStr, toStr).subscribe(s => this.topServices.set(s));
  }
}
