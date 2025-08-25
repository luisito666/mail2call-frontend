import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EmailEventService } from '../../services/email-event.service';
import { EmailEvent } from '../../models/interfaces';

@Component({
  selector: 'app-email-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Eventos de Email</h1>
        <div class="filters">
          <select [formControl]="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processed">Procesado</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
          </select>
          <select [formControl]="triggerFilter" class="filter-select">
            <option value="">Todos los triggers</option>
            @for (trigger of uniqueTriggers(); track trigger) {
              <option [value]="trigger">{{ trigger }}</option>
            }
          </select>
          <input 
            type="text" 
            [formControl]="searchFilter"
            placeholder="Buscar por email o asunto..."
            class="search-input"
          />
        </div>
      </div>

      <div class="events-table-container">
        <table class="events-table">
          <thead>
            <tr>
              <th>Fecha Recibido</th>
              <th>Email Remitente</th>
              <th>Asunto</th>
              <th>Trigger</th>
              <th>Estado</th>
              <th>Fecha Procesado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (event of filteredEvents(); track event.id) {
              <tr>
                <td class="date-cell">
                  <div class="date-time">
                    <span class="date">{{ formatDate(event.received_at) }}</span>
                    <span class="time">{{ formatTime(event.received_at) }}</span>
                  </div>
                </td>
                <td class="email-cell">
                  <span class="email-address">{{ event.from_email }}</span>
                </td>
                <td class="subject-cell">
                  @if (event.subject) {
                    <span class="subject-text" [title]="event.subject">
                      {{ truncateText(event.subject, 50) }}
                    </span>
                  } @else {
                    <span class="no-subject">Sin asunto</span>
                  }
                </td>
                <td class="trigger-cell">
                  @if (event.trigger_matched) {
                    <span class="trigger-badge">{{ event.trigger_matched }}</span>
                  } @else {
                    <span class="no-trigger">Sin trigger</span>
                  }
                </td>
                <td class="status-cell">
                  <span [class]="'status-badge ' + getStatusClass(event.status || 'pending')">
                    {{ getStatusLabel(event.status || 'pending') }}
                  </span>
                </td>
                <td class="processed-date-cell">
                  @if (event.processed_at) {
                    <div class="date-time">
                      <span class="date">{{ formatDate(event.processed_at) }}</span>
                      <span class="time">{{ formatTime(event.processed_at) }}</span>
                    </div>
                  } @else {
                    <span class="not-processed">No procesado</span>
                  }
                </td>
                <td class="actions-cell">
                  <button (click)="viewDetails(event)" class="btn-icon btn-view" title="Ver detalles">
                    👁️
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredEvents().length === 0 && !isLoading()) {
          <div class="empty-state">
            @if (hasFilters()) {
              <p>No se encontraron eventos que coincidan con los filtros</p>
              <button (click)="clearFilters()" class="btn-secondary">Limpiar Filtros</button>
            } @else {
              <p>No hay eventos de email</p>
            }
          </div>
        }
      </div>

      <!-- Modal de Detalles -->
      @if (showDetailsModal()) {
        <div class="modal-overlay" (click)="closeDetailsModal()">
          <div class="modal modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Detalles del Evento de Email</h2>
              <button (click)="closeDetailsModal()" class="close-btn">✕</button>
            </div>

            <div class="modal-content">
              @if (selectedEvent()) {
                <div class="details-grid">
                  <div class="detail-group">
                    <h3>Información General</h3>
                    <div class="detail-item">
                      <span class="label">ID:</span>
                      <span class="value">
                        <code>{{ selectedEvent()!.id }}</code>
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Email Remitente:</span>
                      <span class="value">{{ selectedEvent()!.from_email }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Asunto:</span>
                      <span class="value">
                        @if (selectedEvent()!.subject) {
                          {{ selectedEvent()!.subject }}
                        } @else {
                          Sin asunto
                        }
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Estado:</span>
                      <span [class]="'status-badge ' + getStatusClass(selectedEvent()!.status || 'pending')">
                        {{ getStatusLabel(selectedEvent()!.status || 'pending') }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h3>Procesamiento</h3>
                    <div class="detail-item">
                      <span class="label">Trigger Coincidente:</span>
                      <span class="value">
                        @if (selectedEvent()!.trigger_matched) {
                          <span class="trigger-badge">{{ selectedEvent()!.trigger_matched }}</span>
                        } @else {
                          Sin trigger
                        }
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Fecha Recibido:</span>
                      <span class="value">{{ formatDateTime(selectedEvent()!.received_at) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Fecha Procesado:</span>
                      <span class="value">
                        @if (selectedEvent()!.processed_at) {
                          {{ formatDateTime(selectedEvent()!.processed_at!) }}
                        } @else {
                          No procesado
                        }
                      </span>
                    </div>
                  </div>

                  @if (selectedEvent()!.body) {
                    <div class="detail-group body-group">
                      <h3>Contenido del Email</h3>
                      <div class="email-body">
                        {{ selectedEvent()!.body }}
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
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
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-select, .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .search-input {
      min-width: 250px;
    }

    .events-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      overflow: hidden;
    }

    .events-table {
      width: 100%;
      border-collapse: collapse;
    }

    .events-table th,
    .events-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .events-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .date-cell {
      min-width: 140px;
    }

    .date-time {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date {
      font-weight: 600;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .time {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .email-address {
      font-family: monospace;
      color: #1f2937;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .subject-text {
      color: #1f2937;
      cursor: help;
    }

    .no-subject, .no-trigger, .not-processed {
      color: #9ca3af;
      font-style: italic;
    }

    .trigger-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e0f2fe;
      color: #0f4c75;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.processed {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.failed {
      background: #fee2e2;
      color: #991b1b;
    }

    .actions-cell {
      width: 60px;
    }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.5rem;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-icon:hover {
      background: #f3f4f6;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .btn-secondary {
      padding: 0.5rem 1rem;
      background: #e5e7eb;
      color: #374151;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-secondary:hover {
      background: #d1d5db;
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
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-large {
      max-width: 900px;
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

    .modal-content {
      padding: 1.5rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .detail-group {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
    }

    .detail-group h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 1rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-item .label {
      font-weight: 500;
      color: #374151;
      min-width: 120px;
      flex-shrink: 0;
    }

    .detail-item .value {
      color: #1f2937;
      text-align: right;
      word-break: break-all;
    }

    .body-group {
      grid-column: 1 / -1;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .email-body {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      color: #1f2937;
      font-size: 0.875rem;
      line-height: 1.6;
      border: 1px solid #e2e8f0;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
      overflow-y: auto;
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .filters {
        width: 100%;
        flex-direction: column;
      }

      .search-input {
        min-width: auto;
        width: 100%;
      }

      .events-table {
        font-size: 0.875rem;
      }

      .events-table th,
      .events-table td {
        padding: 0.75rem 0.5rem;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmailEventsComponent implements OnInit {
  emailEvents = signal<EmailEvent[]>([]);
  filteredEvents = signal<EmailEvent[]>([]);
  uniqueTriggers = signal<string[]>([]);
  isLoading = signal(true);
  showDetailsModal = signal(false);
  selectedEvent = signal<EmailEvent | null>(null);

  statusFilter = new FormControl('');
  triggerFilter = new FormControl('');
  searchFilter = new FormControl('');

  constructor(
    private emailEventService: EmailEventService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    this.emailEventService.getEmailEvents().subscribe({
      next: (events) => {
        this.emailEvents.set(events);
        this.extractUniqueTriggers(events);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading email events:', error);
        this.isLoading.set(false);
      }
    });
  }

  extractUniqueTriggers(events: EmailEvent[]): void {
    const triggers = events
      .map(event => event.trigger_matched)
      .filter(trigger => trigger)
      .filter((trigger, index, array) => array.indexOf(trigger) === index)
      .sort();
    
    this.uniqueTriggers.set(triggers as string[]);
  }

  setupFilters(): void {
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.triggerFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    let filtered = [...this.emailEvents()];

    // Filtro por estado
    const statusValue = this.statusFilter.value;
    if (statusValue) {
      filtered = filtered.filter(event => event.status === statusValue);
    }

    // Filtro por trigger
    const triggerValue = this.triggerFilter.value;
    if (triggerValue) {
      filtered = filtered.filter(event => event.trigger_matched === triggerValue);
    }

    // Filtro por búsqueda
    const searchValue = this.searchFilter.value?.toLowerCase() || '';
    if (searchValue) {
      filtered = filtered.filter(event => {
        const email = event.from_email.toLowerCase();
        const subject = event.subject?.toLowerCase() || '';
        return email.includes(searchValue) || subject.includes(searchValue);
      });
    }

    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());

    this.filteredEvents.set(filtered);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'processed': 'Procesado',
      'completed': 'Completado',
      'failed': 'Fallido'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'pending',
      'processed': 'processed',
      'completed': 'completed',
      'failed': 'failed'
    };
    return classes[status] || 'pending';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  viewDetails(event: EmailEvent): void {
    this.selectedEvent.set(event);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedEvent.set(null);
  }

  hasFilters(): boolean {
    return !!(this.statusFilter.value || this.triggerFilter.value || this.searchFilter.value);
  }

  clearFilters(): void {
    this.statusFilter.setValue('');
    this.triggerFilter.setValue('');
    this.searchFilter.setValue('');
  }
}