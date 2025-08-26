import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactGroup, ContactGroupCreate, ContactGroupUpdate, PaginatedResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContactGroupService {
  private readonly baseUrl = 'https://saas-api.luisito.dev/api/v1/contact-groups';

  constructor(private http: HttpClient) {}

  getContactGroups(page = 1, per_page = 10): Observable<PaginatedResponse<ContactGroup>> {
    return this.http.get<PaginatedResponse<ContactGroup>>(`${this.baseUrl}/`, {
      params: { page: page.toString(), per_page: per_page.toString() }
    });
  }

  getAllContactGroups(): Observable<ContactGroup[]> {
    return this.http.get<PaginatedResponse<ContactGroup>>(`${this.baseUrl}/`, {
      params: { page: '1', per_page: '100' }
    }).pipe(
      map(response => response.items)
    );
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