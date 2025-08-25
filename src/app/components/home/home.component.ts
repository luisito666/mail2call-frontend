import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  contactGroupsCount = signal<number>(0);
  contactsCount = signal<number>(0);
  triggersCount = signal<number>(0);
  dailyCallsCount = signal<number>(0);
  isLoading = signal(true);

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);

    forkJoin({
      contactGroups: this.statsService.getContactGroupsCount(),
      contacts: this.statsService.getContactsCount(),
      triggers: this.statsService.getActiveTriggersCount(),
      dailyCalls: this.statsService.getDailyCallsCount()
    }).subscribe({
      next: (stats) => {
        console.log('Stats received:', stats);
        
        // Usar las propiedades correctas basadas en la respuesta del API
        this.contactGroupsCount.set(stats.contactGroups?.total_contact_groups ?? 0);
        this.contactsCount.set(stats.contacts?.total_contacts ?? 0);
        this.triggersCount.set(stats.triggers?.total_active_triggers ?? 0);
        this.dailyCallsCount.set(stats.dailyCalls?.total_daily_calls ?? 0);
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading.set(false);
      }
    });
  }
}