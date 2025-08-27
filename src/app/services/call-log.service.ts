import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CallLog, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CallLogService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/call-logs';

  constructor(private http: HttpClient) {}

  getCallLogs(page = 1, per_page = 10): Observable<PaginatedResponse<CallLog>> {
    return this.http.get<PaginatedResponse<CallLog>>(`${this.baseUrl}/`, {
      params: { page: page.toString(), per_page: per_page.toString() }
    });
  }

  getAllCallLogs(): Observable<CallLog[]> {
    return this.http.get<PaginatedResponse<CallLog>>(`${this.baseUrl}/`, {
      params: { page: '1', per_page: '100' }
    }).pipe(
      map(response => response.items)
    );
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

  exportCallLogsCSV(startDate?: string, endDate?: string): Observable<Blob> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return this.http.get(`${this.baseUrl}/export/csv`, {
      params,
      responseType: 'blob'
    });
  }

  exportCallLogsExcel(startDate?: string, endDate?: string): Observable<Blob> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return this.http.get(`${this.baseUrl}/export/excel`, {
      params,
      responseType: 'blob'
    });
  }
}