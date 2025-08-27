import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContactService } from '../../services/contact.service';
import { ContactGroupService } from '../../services/contact-group.service';
import { Contact, ContactCreate, ContactUpdate, ContactGroup, PaginatedResponse } from '../../models/interfaces';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Contactos</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          <span class="icon">➕</span>
          Nuevo Contacto
        </button>
      </div>

      <div class="search-section">
        <div class="search-controls">
          <input 
            type="text" 
            [formControl]="searchQuery"
            placeholder="Buscar contactos por nombre, teléfono, rol o departamento..."
            class="search-input"
          />
          <button 
            (click)="clearSearch()" 
            class="btn-secondary clear-btn"
            [disabled]="!hasActiveSearch()"
          >
            Limpiar
          </button>
        </div>
        
        <div class="advanced-filters">
          <select [formControl]="groupFilter" class="filter-select">
            <option value="">Todos los grupos</option>
            @for (group of contactGroups(); track group.id) {
              <option [value]="group.id">{{ group.name }}</option>
            }
          </select>
          
          <select [formControl]="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option [value]="true">Activos</option>
            <option [value]="false">Inactivos</option>
          </select>
          
          <select [formControl]="priorityFilter" class="filter-select">
            <option value="">Todas las prioridades</option>
            <option value="1">1 - Urgente</option>
            <option value="2">2 - Crítica</option>
            <option value="3">3 - Alta</option>
            <option value="4">4 - Media</option>
            <option value="5">5 - Baja</option>
          </select>
        </div>
      </div>

      <div class="contacts-table-container">
        <table class="contacts-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Departamento</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Grupos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (contact of contacts(); track contact.id) {
              <tr>
                <td class="contact-name">{{ contact.name }}</td>
                <td class="contact-phone">{{ contact.phone_number }}</td>
                <td>{{ contact.role || '-' }}</td>
                <td>{{ contact.department || '-' }}</td>
                <td>
                  <span class="priority-badge" [attr.data-priority]="contact.priority">
                    {{ contact.priority || 1 }}
                  </span>
                </td>
                <td>
                  <span [class]="'status-badge ' + (contact.is_active ? 'active' : 'inactive')">
                    {{ contact.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="groups-cell">
                  @if (contact.group_ids.length > 0) {
                    <div class="group-tags">
                      @for (groupId of contact.group_ids; track groupId) {
                        <span class="group-tag">{{ getGroupName(groupId) }}</span>
                      }
                    </div>
                  } @else {
                    <span class="no-groups">Sin grupos</span>
                  }
                </td>
                <td class="actions-cell">
                  <button (click)="editContact(contact)" class="btn-icon btn-edit" title="Editar">
                    ✏️
                  </button>
                  <button (click)="deleteContact(contact.id)" class="btn-icon btn-delete" title="Eliminar">
                    🗑️
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (contacts().length === 0 && !isLoading()) {
          <div class="empty-state">
            <p>No hay contactos registrados</p>
            <button (click)="openCreateModal()" class="btn-primary">Crear Primer Contacto</button>
          </div>
        }
      </div>

      @if (paginationInfo().total_pages > 1) {
        <div class="pagination-container">
          <div class="pagination-info">
            Mostrando {{ (paginationInfo().page - 1) * paginationInfo().per_page + 1 }} - 
            {{ Math.min(paginationInfo().page * paginationInfo().per_page, paginationInfo().total) }} 
            de {{ paginationInfo().total }} contactos
          </div>
          
          <div class="pagination-controls">
              <button 
                (click)="goToPage(1)" 
                [disabled]="paginationInfo().page === 1 || isLoading()"
                class="btn-secondary pagination-btn"
              >
                Primero
              </button>
              
              <button 
                (click)="goToPage(paginationInfo().page - 1)" 
                [disabled]="paginationInfo().page === 1 || isLoading()"
                class="btn-secondary pagination-btn"
              >
                Anterior
              </button>
              
              @for (pageNum of getVisiblePages(); track pageNum) {
                @if (pageNum === -1) {
                  <span class="pagination-ellipsis">...</span>
                } @else {
                  <button 
                    (click)="goToPage(pageNum)" 
                    [disabled]="isLoading()"
                    [class]="'pagination-btn ' + (pageNum === paginationInfo().page ? 'btn-primary' : 'btn-secondary')"
                  >
                    {{ pageNum }}
                  </button>
                }
              }
              
              <button 
                (click)="goToPage(paginationInfo().page + 1)" 
                [disabled]="paginationInfo().page === paginationInfo().total_pages || isLoading()"
                class="btn-secondary pagination-btn"
              >
                Siguiente
              </button>
              
              <button 
                (click)="goToPage(paginationInfo().total_pages)" 
                [disabled]="paginationInfo().page === paginationInfo().total_pages || isLoading()"
                class="btn-secondary pagination-btn"
              >
                Último
              </button>
            </div>

          <div class="pagination-size">
            <label for="pageSize">Elementos por página:</label>
            <select 
              id="pageSize" 
              [value]="paginationInfo().per_page" 
              (change)="changePageSize($event)"
              [disabled]="isLoading()"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      }

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Editar Contacto' : 'Nuevo Contacto' }}</h2>
              <button (click)="closeModal()" class="close-btn">✕</button>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Nombre *</label>
                  <input 
                    id="name"
                    type="text" 
                    formControlName="name"
                    placeholder="Nombre completo"
                  />
                  @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                    <span class="error-message">Nombre requerido</span>
                  }
                </div>

                <div class="form-group">
                  <label for="phone_number">Teléfono *</label>
                  <input 
                    id="phone_number"
                    type="tel" 
                    formControlName="phone_number"
                    placeholder="+1234567890"
                  />
                  @if (contactForm.get('phone_number')?.invalid && contactForm.get('phone_number')?.touched) {
                    <span class="error-message">Teléfono requerido</span>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="role">Rol</label>
                  <input 
                    id="role"
                    type="text" 
                    formControlName="role"
                    placeholder="Ej: Gerente, Técnico"
                  />
                </div>

                <div class="form-group">
                  <label for="department">Departamento</label>
                  <input 
                    id="department"
                    type="text" 
                    formControlName="department"
                    placeholder="Ej: Ventas, IT"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="priority">Prioridad</label>
                  <select id="priority" formControlName="priority">
                    <option value="1">1 - Urgente</option>
                    <option value="2">2 - Crítica</option>
                    <option value="3">3 - Alta</option>
                    <option value="4">4 - Media</option>
                    <option value="5">5 - Baja</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_active" />
                    <span class="checkmark"></span>
                    Contacto activo
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="group_ids">Grupos</label>
                <div class="groups-selector">
                  @for (group of contactGroups(); track group.id) {
                    <label class="group-checkbox">
                      <input 
                        type="checkbox" 
                        [checked]="selectedGroupIds().includes(group.id)"
                        (change)="toggleGroup(group.id)"
                      />
                      <span class="checkmark"></span>
                      {{ group.name }}
                    </label>
                  }
                </div>
                @if (selectedGroupIds().length === 0) {
                  <span class="info-message">Selecciona al menos un grupo</span>
                }
              </div>

              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn-secondary">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  [disabled]="contactForm.invalid || selectedGroupIds().length === 0 || isSaving()" 
                  class="btn-primary"
                >
                  {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      min-height: 100vh;
      background: #f9fafb;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .search-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .search-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    .clear-btn {
      padding: 0.75rem 1.5rem;
      white-space: nowrap;
    }

    .clear-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .advanced-filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
      transition: border-color 0.2s;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    @media (max-width: 768px) {
      .search-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .advanced-filters {
        grid-template-columns: 1fr;
      }
    }

    .contacts-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      overflow: hidden;
    }

    .contacts-table {
      width: 100%;
      border-collapse: collapse;
    }

    .contacts-table th,
    .contacts-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .contacts-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .contact-name {
      font-weight: 600;
      color: #1f2937;
    }

    .contact-phone {
      font-family: monospace;
      color: #6b7280;
    }

    .priority-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      min-width: 24px;
    }

    .priority-badge[data-priority="1"] {
      background: #450a0a;
      color: #fecaca;
    }

    .priority-badge[data-priority="2"] {
      background: #fee2e2;
      color: #991b1b;
    }

    .priority-badge[data-priority="3"] {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge[data-priority="4"] {
      background: #fefce8;
      color: #854d0e;
    }

    .priority-badge[data-priority="5"] {
      background: #f0fdf4;
      color: #166534;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .groups-cell {
      max-width: 200px;
    }

    .group-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .group-tag {
      padding: 0.125rem 0.5rem;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .no-groups {
      color: #9ca3af;
      font-style: italic;
    }

    .actions-cell {
      width: 100px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 4px;
      margin: 0 0.125rem;
      transition: background-color 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .btn-primary, .btn-secondary {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgb(0 0 0 / 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .modal-form {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      margin-top: 1.5rem;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
    }

    .groups-selector {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 150px;
      overflow-y: auto;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
    }

    .group-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .info-message {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgb(255 255 255 / 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .pagination-container {
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .pagination-info {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pagination-btn {
      min-width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pagination-ellipsis {
      padding: 0 0.5rem;
      display: flex;
      align-items: center;
      color: #6b7280;
    }

    .pagination-size {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .pagination-size select {
      padding: 0.25rem 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .pagination-controls {
        justify-content: center;
      }

      .pagination-info,
      .pagination-size {
        justify-content: center;
      }
    }
  `]
})
export class ContactsComponent implements OnInit {
  contacts = signal<Contact[]>([]);
  contactGroups = signal<ContactGroup[]>([]);
  paginationInfo = signal<PaginatedResponse<Contact>>({
    items: [],
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0
  });
  showModal = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  selectedGroupIds = signal<string[]>([]);
  Math = Math;

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    phone_number: new FormControl('', [Validators.required]),
    role: new FormControl(''),
    department: new FormControl(''),
    priority: new FormControl(1),
    is_active: new FormControl(true)
  });

  // Controles de búsqueda
  searchQuery = new FormControl('');
  groupFilter = new FormControl('');
  statusFilter = new FormControl('');
  priorityFilter = new FormControl('');

  constructor(
    private contactService: ContactService,
    private contactGroupService: ContactGroupService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupSearchListeners();
  }

  loadData(page?: number, per_page?: number): void {
    this.isLoading.set(true);
    
    const currentPage = page || this.paginationInfo().page;
    const currentPerPage = per_page || this.paginationInfo().per_page;
    
    // Construir parámetros de búsqueda
    const searchParams: any = {
      page: currentPage,
      per_page: currentPerPage
    };

    // Agregar filtros de búsqueda si tienen valor
    const query = this.searchQuery.value?.trim();
    if (query) searchParams.q = query;

    const groupId = this.groupFilter.value;
    if (groupId) searchParams.group_id = groupId;

    const isActive = this.statusFilter.value;
    if (isActive !== '') searchParams.is_active = isActive === 'true';

    const priority = this.priorityFilter.value;
    if (priority) searchParams.priority_min = parseInt(priority);
    if (priority) searchParams.priority_max = parseInt(priority);

    Promise.all([
      this.contactService.searchContacts(searchParams).toPromise(),
      this.contactGroupService.getAllContactGroups().toPromise()
    ]).then(([contactsResponse, groups]) => {
      if (contactsResponse) {
        this.paginationInfo.set(contactsResponse);
        this.contacts.set(contactsResponse.items);
      }
      this.contactGroups.set(groups || []);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.isLoading.set(false);
    });
  }

  setupSearchListeners(): void {
    // Búsqueda con debounce para el campo de texto
    this.searchQuery.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadData(1); // Resetear a página 1 al buscar
    });

    // Filtros instantáneos
    this.groupFilter.valueChanges.subscribe(() => {
      this.loadData(1);
    });

    this.statusFilter.valueChanges.subscribe(() => {
      this.loadData(1);
    });

    this.priorityFilter.valueChanges.subscribe(() => {
      this.loadData(1);
    });
  }

  clearSearch(): void {
    this.searchQuery.setValue('');
    this.groupFilter.setValue('');
    this.statusFilter.setValue('');
    this.priorityFilter.setValue('');
    this.loadData(1);
  }

  hasActiveSearch(): boolean {
    return !!(
      this.searchQuery.value?.trim() ||
      this.groupFilter.value ||
      this.statusFilter.value ||
      this.priorityFilter.value
    );
  }

  getGroupName(groupId: string): string {
    const group = this.contactGroups().find(g => g.id === groupId);
    return group?.name || groupId;
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.selectedGroupIds.set([]);
    this.contactForm.reset({
      name: '',
      phone_number: '',
      role: '',
      department: '',
      priority: 1,
      is_active: true
    });
    this.showModal.set(true);
  }

  editContact(contact: Contact): void {
    this.isEditing.set(true);
    this.editingId.set(contact.id);
    this.selectedGroupIds.set([...contact.group_ids]);
    this.contactForm.patchValue({
      name: contact.name,
      phone_number: contact.phone_number,
      role: contact.role || '',
      department: contact.department || '',
      priority: contact.priority || 1,
      is_active: contact.is_active ?? true
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.contactForm.reset();
    this.selectedGroupIds.set([]);
  }

  toggleGroup(groupId: string): void {
    const current = this.selectedGroupIds();
    if (current.includes(groupId)) {
      this.selectedGroupIds.set(current.filter(id => id !== groupId));
    } else {
      this.selectedGroupIds.set([...current, groupId]);
    }
  }

  onSubmit(): void {
    if (this.contactForm.valid && this.selectedGroupIds().length > 0) {
      this.isSaving.set(true);

      if (this.isEditing()) {
        const updateData: ContactUpdate = {
          name: this.contactForm.value.name || undefined,
          phone_number: this.contactForm.value.phone_number || undefined,
          role: this.contactForm.value.role || undefined,
          department: this.contactForm.value.department || undefined,
          priority: this.contactForm.value.priority || undefined,
          is_active: this.contactForm.value.is_active ?? undefined,
          group_ids: this.selectedGroupIds()
        };

        this.contactService.updateContact(this.editingId()!, updateData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error updating contact:', error);
            this.isSaving.set(false);
          }
        });
      } else {
        const createData: ContactCreate = {
          id: crypto.randomUUID(),
          name: this.contactForm.value.name!,
          phone_number: this.contactForm.value.phone_number!,
          role: this.contactForm.value.role || undefined,
          department: this.contactForm.value.department || undefined,
          priority: this.contactForm.value.priority || 1,
          is_active: this.contactForm.value.is_active ?? true,
          group_ids: this.selectedGroupIds()
        };

        this.contactService.createContact(createData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error creating contact:', error);
            this.isSaving.set(false);
          }
        });
      }
    }
  }

  deleteContact(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.paginationInfo().total_pages) {
      this.loadData(page);
    }
  }

  changePageSize(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPerPage = parseInt(target.value);
    this.loadData(1, newPerPage);
  }

  getVisiblePages(): number[] {
    const current = this.paginationInfo().page;
    const total = this.paginationInfo().total_pages;
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(total);
      }
    }
    
    return pages;
  }
}