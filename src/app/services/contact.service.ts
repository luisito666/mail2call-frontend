import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact, ContactCreate, ContactUpdate, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/contacts';

  constructor(private http: HttpClient) {}

  getContacts(page = 1, per_page = 10): Observable<PaginatedResponse<Contact>> {
    return this.http.get<PaginatedResponse<Contact>>(`${this.baseUrl}/`, {
      params: { page: page.toString(), per_page: per_page.toString() }
    });
  }

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<PaginatedResponse<Contact>>(`${this.baseUrl}/`, {
      params: { page: '1', per_page: '100' }
    }).pipe(
      map(response => response.items)
    );
  }

  getContact(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  getContactsByGroup(groupId: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/by-group/${groupId}`);
  }

  createContact(contact: ContactCreate): Observable<Contact> {
    return this.http.post<Contact>(`${this.baseUrl}/`, contact);
  }

  updateContact(id: string, contact: ContactUpdate): Observable<Contact> {
    return this.http.put<Contact>(`${this.baseUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchContacts(params: {
    q?: string;
    name?: string;
    phone?: string;
    role?: string;
    department?: string;
    group_id?: string;
    is_active?: boolean;
    priority_min?: number;
    priority_max?: number;
    page?: number;
    per_page?: number;
  }): Observable<PaginatedResponse<Contact>> {
    const queryParams: any = {};
    
    // Solo agregar parámetros que tengan valor
    if (params.q) queryParams.q = params.q;
    if (params.name) queryParams.name = params.name;
    if (params.phone) queryParams.phone = params.phone;
    if (params.role) queryParams.role = params.role;
    if (params.department) queryParams.department = params.department;
    if (params.group_id) queryParams.group_id = params.group_id;
    if (params.is_active !== undefined) queryParams.is_active = params.is_active.toString();
    if (params.priority_min !== undefined) queryParams.priority_min = params.priority_min.toString();
    if (params.priority_max !== undefined) queryParams.priority_max = params.priority_max.toString();
    if (params.page) queryParams.page = params.page.toString();
    if (params.per_page) queryParams.per_page = params.per_page.toString();

    return this.http.get<PaginatedResponse<Contact>>(`${this.baseUrl}/search`, {
      params: queryParams
    });
  }
}