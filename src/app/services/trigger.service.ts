import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trigger, TriggerCreate, TriggerUpdate, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TriggerService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/triggers';

  constructor(private http: HttpClient) {}

  getTriggers(page = 1, per_page = 10): Observable<PaginatedResponse<Trigger>> {
    return this.http.get<PaginatedResponse<Trigger>>(`${this.baseUrl}/`, {
      params: { page: page.toString(), per_page: per_page.toString() }
    });
  }

  getTrigger(id: string): Observable<Trigger> {
    return this.http.get<Trigger>(`${this.baseUrl}/${id}`);
  }

  getTriggerByString(triggerString: string): Observable<Trigger> {
    return this.http.get<Trigger>(`${this.baseUrl}/by-string/${triggerString}`);
  }

  createTrigger(trigger: TriggerCreate): Observable<Trigger> {
    return this.http.post<Trigger>(`${this.baseUrl}/`, trigger);
  }

  updateTrigger(id: string, trigger: TriggerUpdate): Observable<Trigger> {
    return this.http.put<Trigger>(`${this.baseUrl}/${id}`, trigger);
  }

  deleteTrigger(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}