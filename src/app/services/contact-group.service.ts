import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactGroup, ContactGroupCreate, ContactGroupUpdate } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContactGroupService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/contact-groups';

  constructor(private http: HttpClient) {}

  getContactGroups(skip = 0, limit = 100): Observable<ContactGroup[]> {
    return this.http.get<ContactGroup[]>(`${this.baseUrl}/`, {
      params: { skip: skip.toString(), limit: limit.toString() }
    });
  }

  getContactGroup(id: string): Observable<ContactGroup> {
    return this.http.get<ContactGroup>(`${this.baseUrl}/${id}`);
  }

  createContactGroup(contactGroup: ContactGroupCreate): Observable<ContactGroup> {
    return this.http.post<ContactGroup>(`${this.baseUrl}/`, contactGroup);
  }

  updateContactGroup(id: string, contactGroup: ContactGroupUpdate): Observable<ContactGroup> {
    return this.http.put<ContactGroup>(`${this.baseUrl}/${id}`, contactGroup);
  }

  deleteContactGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}