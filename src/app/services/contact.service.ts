import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contact, ContactCreate, ContactUpdate, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/contacts';

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
}