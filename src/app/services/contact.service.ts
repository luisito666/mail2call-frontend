import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact, ContactCreate, ContactUpdate } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/contacts';

  constructor(private http: HttpClient) {}

  getContacts(skip = 0, limit = 100): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.baseUrl}/`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
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