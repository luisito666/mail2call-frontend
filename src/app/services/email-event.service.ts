import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailEvent } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmailEventService {
  private apiUrl = 'http://localhost:8000/api/v1/email-events';

  constructor(private http: HttpClient) { }

  getEmailEvents(skip: number = 0, limit: number = 100): Observable<EmailEvent[]> {
    return this.http.get<EmailEvent[]>(`${this.apiUrl}/`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  getEmailEvent(id: string): Observable<EmailEvent> {
    return this.http.get<EmailEvent>(`${this.apiUrl}/${id}`);
  }

  getEmailEventsByStatus(status: string): Observable<EmailEvent[]> {
    return this.http.get<EmailEvent[]>(`${this.apiUrl}/by-status/${status}`);
  }

  getEmailEventsByTrigger(trigger: string): Observable<EmailEvent[]> {
    return this.http.get<EmailEvent[]>(`${this.apiUrl}/by-trigger/${trigger}`);
  }
}