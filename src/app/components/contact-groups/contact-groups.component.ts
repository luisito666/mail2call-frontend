import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactGroupService } from '../../services/contact-group.service';
import { ContactGroup, ContactGroupCreate, ContactGroupUpdate } from '../../models/interfaces';

@Component({
  selector: 'app-contact-groups',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Grupos de Contactos</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          <span class="icon">➕</span>
          Nuevo Grupo
        </button>
      </div>

      <div class="groups-grid">
        @for (group of contactGroups(); track group.id) {
          <div class="group-card">
            <div class="group-header">
              <h3>{{ group.name }}</h3>
              <div class="group-status">
                <span [class]="'status-badge ' + (group.is_active ? 'active' : 'inactive')">
                  {{ group.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
            
            @if (group.description) {
              <p class="group-description">{{ group.description }}</p>
            }
            
            <div class="group-info">
              <div class="info-item">
                <span class="info-label">Nivel de Emergencia:</span>
                <span class="emergency-level" [attr.data-level]="group.emergency_level">
                  {{ group.emergency_level || 'medium' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Creado:</span>
                <span>{{ formatDate(group.created_at) }}</span>
              </div>
            </div>

            <div class="group-actions">
              <button (click)="editGroup(group)" class="btn-secondary">Editar</button>
              <button (click)="deleteGroup(group.id)" class="btn-danger">Eliminar</button>
            </div>
          </div>
        }

        @if (contactGroups().length === 0 && !isLoading()) {
          <div class="empty-state">
            <p>No hay grupos de contactos configurados</p>
            <button (click)="openCreateModal()" class="btn-primary">Crear Primer Grupo</button>
          </div>
        }
      </div>

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Editar Grupo' : 'Nuevo Grupo' }}</h2>
              <button (click)="closeModal()" class="close-btn">✕</button>
            </div>

            <form [formGroup]="groupForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input 
                  id="name"
                  type="text" 
                  formControlName="name"
                  placeholder="Nombre del grupo"
                />
                @if (groupForm.get('name')?.invalid && groupForm.get('name')?.touched) {
                  <span class="error-message">Nombre requerido</span>
                }
              </div>

              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea 
                  id="description"
                  formControlName="description"
                  placeholder="Descripción del grupo"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="emergency_level">Nivel de Emergencia</label>
                <select id="emergency_level" formControlName="emergency_level">
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    formControlName="is_active"
                  />
                  <span class="checkmark"></span>
                  Grupo activo
                </label>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" [disabled]="groupForm.invalid || isSaving()" class="btn-primary">
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
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .group-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: box-shadow 0.2s;
    }

    .group-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .group-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
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

    .group-description {
      margin: 0 0 1rem 0;
      color: #6b7280;
      line-height: 1.5;
    }

    .group-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .info-label {
      font-weight: 500;
      color: #374151;
    }

    .emergency-level {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .emergency-level[data-level="low"] {
      background: #f0fdf4;
      color: #166534;
    }

    .emergency-level[data-level="medium"] {
      background: #fffbeb;
      color: #92400e;
    }

    .emergency-level[data-level="high"] {
      background: #fef2f2;
      color: #991b1b;
    }

    .emergency-level[data-level="critical"] {
      background: #450a0a;
      color: #fecaca;
    }

    .group-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-primary, .btn-secondary, .btn-danger {
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

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .empty-state {
      grid-column: 1 / -1;
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
      max-width: 500px;
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

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
    }

    .error-message {
      color: #ef4444;
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
  `]
})
export class ContactGroupsComponent implements OnInit {
  contactGroups = signal<ContactGroup[]>([]);
  showModal = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);

  groupForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    emergency_level: new FormControl('medium'),
    is_active: new FormControl(true)
  });

  constructor(private contactGroupService: ContactGroupService) {}

  ngOnInit(): void {
    this.loadContactGroups();
  }

  loadContactGroups(): void {
    this.isLoading.set(true);
    this.contactGroupService.getContactGroups().subscribe({
      next: (groups) => {
        this.contactGroups.set(groups);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading contact groups:', error);
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.groupForm.reset({
      name: '',
      description: '',
      emergency_level: 'medium',
      is_active: true
    });
    this.showModal.set(true);
  }

  editGroup(group: ContactGroup): void {
    this.isEditing.set(true);
    this.editingId.set(group.id);
    this.groupForm.patchValue({
      name: group.name,
      description: group.description || '',
      emergency_level: group.emergency_level || 'medium',
      is_active: group.is_active ?? true
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.groupForm.reset();
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      this.isSaving.set(true);

      if (this.isEditing()) {
        const updateData: ContactGroupUpdate = {
          name: this.groupForm.value.name || undefined,
          description: this.groupForm.value.description || undefined,
          emergency_level: this.groupForm.value.emergency_level || undefined,
          is_active: this.groupForm.value.is_active ?? undefined
        };

        this.contactGroupService.updateContactGroup(this.editingId()!, updateData).subscribe({
          next: () => {
            this.loadContactGroups();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error updating contact group:', error);
            this.isSaving.set(false);
          }
        });
      } else {
        const createData: ContactGroupCreate = {
          id: crypto.randomUUID(),
          name: this.groupForm.value.name!,
          description: this.groupForm.value.description || undefined,
          emergency_level: this.groupForm.value.emergency_level || 'medium',
          is_active: this.groupForm.value.is_active ?? true
        };

        this.contactGroupService.createContactGroup(createData).subscribe({
          next: () => {
            this.loadContactGroups();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error creating contact group:', error);
            this.isSaving.set(false);
          }
        });
      }
    }
  }

  deleteGroup(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      this.contactGroupService.deleteContactGroup(id).subscribe({
        next: () => {
          this.loadContactGroups();
        },
        error: (error) => {
          console.error('Error deleting contact group:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}