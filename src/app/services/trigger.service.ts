import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trigger, TriggerCreate, TriggerUpdate } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TriggerService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/triggers';

  constructor(private http: HttpClient) {}

  getTriggers(skip = 0, limit = 100): Observable<Trigger[]> {
    return this.http.get<Trigger[]>(`${this.baseUrl}/`, {
      params: { skip: skip.toString(), limit: limit.toString() }
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