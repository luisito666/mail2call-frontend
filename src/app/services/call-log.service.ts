import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CallLog } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CallLogService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/call-logs';

  constructor(private http: HttpClient) {}

  getCallLogs(skip = 0, limit = 100): Observable<CallLog[]> {
    return this.http.get<CallLog[]>(`${this.baseUrl}/`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  getCallLog(id: number): Observable<CallLog> {
    return this.http.get<CallLog>(`${this.baseUrl}/${id}`);
  }

  getCallLogsByEmailEvent(emailEventId: string): Observable<CallLog[]> {
    return this.http.get<CallLog[]>(`${this.baseUrl}/by-email-event/${emailEventId}`);
  }

  getCallLogsByContact(contactId: string): Observable<CallLog[]> {
    return this.http.get<CallLog[]>(`${this.baseUrl}/by-contact/${contactId}`);
  }
}