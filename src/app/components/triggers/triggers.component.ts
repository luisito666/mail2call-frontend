import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TriggerService } from '../../services/trigger.service';
import { ContactGroupService } from '../../services/contact-group.service';
import { Trigger, TriggerCreate, TriggerUpdate, ContactGroup } from '../../models/interfaces';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Triggers</h1>
        <button (click)="openCreateModal()" class="btn-primary">
          <span class="icon">➕</span>
          Nuevo Trigger
        </button>
      </div>

      <div class="triggers-grid">
        @for (trigger of triggers(); track trigger.id) {
          <div class="trigger-card">
            <div class="trigger-header">
              <h3>{{ trigger.name }}</h3>
              <div class="trigger-status">
                <span [class]="'status-badge ' + (trigger.is_active ? 'active' : 'inactive')">
                  {{ trigger.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>

            <div class="trigger-string">
              <label>Cadena de activación:</label>
              <code>{{ trigger.trigger_string }}</code>
            </div>

            @if (trigger.description) {
              <p class="trigger-description">{{ trigger.description }}</p>
            }

            <div class="trigger-details">
              <div class="detail-item">
                <span class="detail-label">Grupo:</span>
                <span>{{ getGroupName(trigger.group_id) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Prioridad:</span>
                <span class="priority-badge" [attr.data-priority]="trigger.priority">
                  {{ trigger.priority || 1 }}
                </span>
              </div>
              
              @if (trigger.custom_message) {
                <div class="detail-item full-width">
                  <span class="detail-label">Mensaje personalizado:</span>
                  <div class="custom-message">{{ trigger.custom_message }}</div>
                </div>
              }
              
              <div class="detail-item">
                <span class="detail-label">Creado:</span>
                <span>{{ formatDate(trigger.created_at) }}</span>
              </div>
            </div>

            <div class="trigger-actions">
              <button (click)="editTrigger(trigger)" class="btn-secondary">Editar</button>
              <button (click)="deleteTrigger(trigger.id)" class="btn-danger">Eliminar</button>
            </div>
          </div>
        }

        @if (triggers().length === 0 && !isLoading()) {
          <div class="empty-state">
            <p>No hay triggers configurados</p>
            <button (click)="openCreateModal()" class="btn-primary">Crear Primer Trigger</button>
          </div>
        }
      </div>

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Editar Trigger' : 'Nuevo Trigger' }}</h2>
              <button (click)="closeModal()" class="close-btn">✕</button>
            </div>

            <form [formGroup]="triggerForm" (ngSubmit)="onSubmit()" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Nombre *</label>
                  <input 
                    id="name"
                    type="text" 
                    formControlName="name"
                    placeholder="Nombre del trigger"
                  />
                  @if (triggerForm.get('name')?.invalid && triggerForm.get('name')?.touched) {
                    <span class="error-message">Nombre requerido</span>
                  }
                </div>

                <div class="form-group">
                  <label for="trigger_string">Cadena de Activación *</label>
                  <input 
                    id="trigger_string"
                    type="text" 
                    formControlName="trigger_string"
                    placeholder="ej: urgente, emergencia"
                  />
                  @if (triggerForm.get('trigger_string')?.invalid && triggerForm.get('trigger_string')?.touched) {
                    <span class="error-message">Cadena de activación requerida</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea 
                  id="description"
                  formControlName="description"
                  placeholder="Descripción del trigger"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="group_id">Grupo de Contactos</label>
                  <select id="group_id" formControlName="group_id">
                    <option value="">Seleccionar grupo</option>
                    @for (group of contactGroups(); track group.id) {
                      <option [value]="group.id">{{ group.name }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="priority">Prioridad</label>
                  <select id="priority" formControlName="priority">
                    <option value="1">1 - Baja</option>
                    <option value="2">2 - Media</option>
                    <option value="3">3 - Alta</option>
                    <option value="4">4 - Crítica</option>
                    <option value="5">5 - Urgente</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="custom_message">Mensaje Personalizado</label>
                <textarea 
                  id="custom_message"
                  formControlName="custom_message"
                  placeholder="Mensaje que se reproducirá en la llamada"
                  rows="4"
                ></textarea>
                <small class="form-help">Este mensaje se reproducirá cuando se active el trigger</small>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="is_active" />
                  <span class="checkmark"></span>
                  Trigger activo
                </label>
              </div>

              <div class="modal-actions">
                <button type="button" (click)="closeModal()" class="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" [disabled]="triggerForm.invalid || isSaving()" class="btn-primary">
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

    .triggers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .trigger-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: box-shadow 0.2s;
    }

    .trigger-card:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .trigger-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .trigger-header h3 {
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

    .trigger-string {
      margin-bottom: 1rem;
    }

    .trigger-string label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .trigger-string code {
      display: block;
      padding: 0.5rem 0.75rem;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      color: #1f2937;
      word-break: break-all;
    }

    .trigger-description {
      margin: 0 0 1rem 0;
      color: #6b7280;
      line-height: 1.5;
    }

    .trigger-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .priority-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      width: fit-content;
    }

    .priority-badge[data-priority="1"] {
      background: #f0fdf4;
      color: #166534;
    }

    .priority-badge[data-priority="2"] {
      background: #fefce8;
      color: #854d0e;
    }

    .priority-badge[data-priority="3"] {
      background: #fef3c7;
      color: #92400e;
    }

    .priority-badge[data-priority="4"] {
      background: #fee2e2;
      color: #991b1b;
    }

    .priority-badge[data-priority="5"] {
      background: #450a0a;
      color: #fecaca;
    }

    .custom-message {
      padding: 0.5rem 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #475569;
      line-height: 1.5;
    }

    .trigger-actions {
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

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
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
      margin-bottom: 1.5rem;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
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

    .form-help {
      margin-top: 0.25rem;
      color: #6b7280;
      font-size: 0.875rem;
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
export class TriggersComponent implements OnInit {
  triggers = signal<Trigger[]>([]);
  contactGroups = signal<ContactGroup[]>([]);
  showModal = signal(false);
  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);

  triggerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    trigger_string: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    group_id: new FormControl(''),
    priority: new FormControl(1),
    custom_message: new FormControl(''),
    is_active: new FormControl(true)
  });

  constructor(
    private triggerService: TriggerService,
    private contactGroupService: ContactGroupService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.triggerService.getTriggers().toPromise(),
      this.contactGroupService.getContactGroups().toPromise()
    ]).then(([triggers, groups]) => {
      this.triggers.set(triggers || []);
      this.contactGroups.set(groups || []);
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.isLoading.set(false);
    });
  }

  getGroupName(groupId?: string): string {
    if (!groupId) return 'Sin grupo asignado';
    const group = this.contactGroups().find(g => g.id === groupId);
    return group?.name || 'Grupo no encontrado';
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.triggerForm.reset({
      name: '',
      trigger_string: '',
      description: '',
      group_id: '',
      priority: 1,
      custom_message: '',
      is_active: true
    });
    this.showModal.set(true);
  }

  editTrigger(trigger: Trigger): void {
    this.isEditing.set(true);
    this.editingId.set(trigger.id);
    this.triggerForm.patchValue({
      name: trigger.name,
      trigger_string: trigger.trigger_string,
      description: trigger.description || '',
      group_id: trigger.group_id || '',
      priority: trigger.priority || 1,
      custom_message: trigger.custom_message || '',
      is_active: trigger.is_active ?? true
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.triggerForm.reset();
  }

  onSubmit(): void {
    if (this.triggerForm.valid) {
      this.isSaving.set(true);

      if (this.isEditing()) {
        const updateData: TriggerUpdate = {
          name: this.triggerForm.value.name || undefined,
          trigger_string: this.triggerForm.value.trigger_string || undefined,
          description: this.triggerForm.value.description || undefined,
          group_id: this.triggerForm.value.group_id || undefined,
          priority: this.triggerForm.value.priority || undefined,
          custom_message: this.triggerForm.value.custom_message || undefined,
          is_active: this.triggerForm.value.is_active ?? undefined
        };

        this.triggerService.updateTrigger(this.editingId()!, updateData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error updating trigger:', error);
            this.isSaving.set(false);
          }
        });
      } else {
        const createData: TriggerCreate = {
          id: crypto.randomUUID(),
          name: this.triggerForm.value.name!,
          trigger_string: this.triggerForm.value.trigger_string!,
          description: this.triggerForm.value.description || undefined,
          group_id: this.triggerForm.value.group_id || undefined,
          priority: this.triggerForm.value.priority || 1,
          custom_message: this.triggerForm.value.custom_message || undefined,
          is_active: this.triggerForm.value.is_active ?? true
        };

        this.triggerService.createTrigger(createData).subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
            this.isSaving.set(false);
          },
          error: (error) => {
            console.error('Error creating trigger:', error);
            this.isSaving.set(false);
          }
        });
      }
    }
  }

  deleteTrigger(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este trigger?')) {
      this.triggerService.deleteTrigger(id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting trigger:', error);
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