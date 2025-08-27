import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmailEvent, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmailEventService {
  private apiUrl = 'http://localhost:8000/api/v1/email-events';

  constructor(private http: HttpClient) { }

  getEmailEvents(page: number = 1, per_page: number = 10): Observable<PaginatedResponse<EmailEvent>> {
    return this.http.get<PaginatedResponse<EmailEvent>>(`${this.apiUrl}/`, {
      params: { page: page.toString(), per_page: per_page.toString() }
    });
  }

  getAllEmailEvents(): Observable<EmailEvent[]> {
    return this.http.get<PaginatedResponse<EmailEvent>>(`${this.apiUrl}/`, {
      params: { page: '1', per_page: '100' }
    }).pipe(
      map(response => response.items)
    );
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