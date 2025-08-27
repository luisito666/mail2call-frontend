import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactGroupStats, ContactStats, TriggerStats, DailyCallStats } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'https://saas-api.luisito.dev/api/v1/system-stats/counts';

  constructor(private http: HttpClient) { }

  getActiveTriggersCount(): Observable<TriggerStats> {
    return this.http.get<TriggerStats>(`${this.apiUrl}/active-triggers`);
  }

  getContactsCount(): Observable<ContactStats> {
    return this.http.get<ContactStats>(`${this.apiUrl}/contacts`);
  }

  getContactGroupsCount(): Observable<ContactGroupStats> {
    return this.http.get<ContactGroupStats>(`${this.apiUrl}/contact-groups`);
  }

  getDailyCallsCount(): Observable<DailyCallStats> {
    return this.http.get<DailyCallStats>(`${this.apiUrl}/daily-calls`);
  }
}