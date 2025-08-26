import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CallLogService } from '../../services/call-log.service';
import { ContactService } from '../../services/contact.service';
import { CallLog, Contact, PaginatedResponse } from '../../models/interfaces';

@Component({
  selector: 'app-call-logs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Registro de Llamadas</h1>
        <div class="filters">
          <select [formControl]="statusFilter" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="completed">Completadas</option>
            <option value="failed">Fallidas</option>
            <option value="busy">Ocupado</option>
            <option value="no-answer">Sin respuesta</option>
            <option value="in-progress">En progreso</option>
          </select>
          <input 
            type="text" 
            [formControl]="searchFilter"
            placeholder="Buscar por teléfono o contacto..."
            class="search-input"
          />
        </div>
      </div>

      <div class="logs-table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Duración</th>
              <th>Intentos</th>
              <th>SID de Llamada</th>
              <th>Error</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (log of filteredLogs(); track log.id) {
              <tr>
                <td class="date-cell">
                  <div class="date-time">
                    <span class="date">{{ formatDate(log.created_at) }}</span>
                    <span class="time">{{ formatTime(log.created_at) }}</span>
                  </div>
                </td>
                <td class="contact-cell">
                  <span class="contact-name">{{ getContactName(log.contact_id) }}</span>
                </td>
                <td class="phone-cell">
                  <span class="phone-number">{{ log.phone_number }}</span>
                </td>
                <td class="status-cell">
                  <span [class]="'status-badge ' + getStatusClass(log.status)">
                    {{ getStatusLabel(log.status) }}
                  </span>
                </td>
                <td class="duration-cell">
                  @if (log.duration) {
                    <span class="duration">{{ formatDuration(log.duration!) }}</span>
                  } @else {
                    <span class="no-duration">-</span>
                  }
                </td>
                <td class="attempts-cell">
                  <span class="attempt-badge" [attr.data-attempts]="log.attempt_number">
                    {{ log.attempt_number || 1 }}
                  </span>
                </td>
                <td class="sid-cell">
                  @if (log.call_sid) {
                    <code class="call-sid">{{ log.call_sid }}</code>
                  } @else {
                    <span class="no-sid">-</span>
                  }
                </td>
                <td class="error-cell">
                  @if (log.error_message) {
                    <div class="error-message" [title]="log.error_message">
                      {{ truncateText(log.error_message, 30) }}
                    </div>
                  } @else {
                    <span class="no-error">-</span>
                  }
                </td>
                <td class="actions-cell">
                  <button (click)="viewDetails(log)" class="btn-icon btn-view" title="Ver detalles">
                    👁️
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (filteredLogs().length === 0 && !isLoading()) {
          <div class="empty-state">
            @if (hasFilters()) {
              <p>No se encontraron llamadas que coincidan con los filtros</p>
              <button (click)="clearFilters()" class="btn-secondary">Limpiar Filtros</button>
            } @else {
              <p>No hay registros de llamadas</p>
            }
          </div>
        }
      </div>

      @if (paginationInfo().total_pages > 1) {
        <div class="pagination-container">
          <div class="pagination-info">
            Mostrando {{ (paginationInfo().page - 1) * paginationInfo().per_page + 1 }} - 
            {{ Math.min(paginationInfo().page * paginationInfo().per_page, paginationInfo().total) }} 
            de {{ paginationInfo().total }} registros de llamadas
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

      <!-- Modal de Detalles -->
      @if (showDetailsModal()) {
        <div class="modal-overlay" (click)="closeDetailsModal()">
          <div class="modal modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Detalles de la Llamada</h2>
              <button (click)="closeDetailsModal()" class="close-btn">✕</button>
            </div>

            <div class="modal-content">
              @if (selectedLog()) {
                <div class="details-grid">
                  <div class="detail-group">
                    <h3>Información General</h3>
                    <div class="detail-item">
                      <span class="label">ID:</span>
                      <span class="value">{{ selectedLog()!.id }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Contacto:</span>
                      <span class="value">{{ getContactName(selectedLog()!.contact_id) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Teléfono:</span>
                      <span class="value">{{ selectedLog()!.phone_number }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Estado:</span>
                      <span [class]="'status-badge ' + getStatusClass(selectedLog()!.status)">
                        {{ getStatusLabel(selectedLog()!.status) }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h3>Detalles de la Llamada</h3>
                    <div class="detail-item">
                      <span class="label">SID de Llamada:</span>
                      <span class="value">
                        @if (selectedLog()!.call_sid) {
                          <code>{{ selectedLog()!.call_sid }}</code>
                        } @else {
                          No disponible
                        }
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Duración:</span>
                      <span class="value">
                        @if (selectedLog()!.duration) {
                          {{ formatDuration(selectedLog()!.duration!) }}
                        } @else {
                          No disponible
                        }
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Intentos:</span>
                      <span class="value">{{ selectedLog()!.attempt_number || 1 }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h3>Fechas</h3>
                    <div class="detail-item">
                      <span class="label">Creada:</span>
                      <span class="value">{{ formatDateTime(selectedLog()!.created_at) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Actualizada:</span>
                      <span class="value">{{ formatDateTime(selectedLog()!.updated_at) }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h3>Eventos Relacionados</h3>
                    <div class="detail-item">
                      <span class="label">ID del Evento de Email:</span>
                      <span class="value">
                        <code>{{ selectedLog()!.email_event_id }}</code>
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">ID del Contacto:</span>
                      <span class="value">
                        <code>{{ selectedLog()!.contact_id }}</code>
                      </span>
                    </div>
                  </div>

                  @if (selectedLog()!.error_message) {
                    <div class="detail-group error-group">
                      <h3>Mensaje de Error</h3>
                      <div class="error-content">
                        {{ selectedLog()!.error_message }}
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
    }

    .filter-select, .search-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .search-input {
      min-width: 200px;
    }

    .logs-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      overflow: hidden;
    }

    .logs-table {
      width: 100%;
      border-collapse: collapse;
    }

    .logs-table th,
    .logs-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .logs-table th {
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

    .contact-name {
      font-weight: 600;
      color: #1f2937;
    }

    .phone-number {
      font-family: monospace;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.completed {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.failed {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.busy {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.no-answer {
      background: #f3f4f6;
      color: #374151;
    }

    .status-badge.in-progress {
      background: #dbeafe;
      color: #1e40af;
    }

    .duration {
      font-weight: 600;
      color: #059669;
    }

    .no-duration, .no-sid, .no-error {
      color: #9ca3af;
      font-style: italic;
    }

    .attempt-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      min-width: 24px;
      background: #e0e7ff;
      color: #3730a3;
    }

    .attempt-badge[data-attempts="1"] {
      background: #dcfce7;
      color: #166534;
    }

    .attempt-badge[data-attempts="2"] {
      background: #fef3c7;
      color: #92400e;
    }

    .attempt-badge[data-attempts="3"],
    .attempt-badge[data-attempts="4"],
    .attempt-badge[data-attempts="5"] {
      background: #fee2e2;
      color: #991b1b;
    }

    .call-sid {
      font-size: 0.75rem;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #374151;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      max-width: 200px;
      cursor: help;
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

    .error-group {
      grid-column: 1 / -1;
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .error-group h3 {
      color: #991b1b;
    }

    .error-content {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      color: #dc2626;
      font-family: monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      border: 1px solid #fecaca;
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

      .logs-table {
        font-size: 0.875rem;
      }

      .logs-table th,
      .logs-table td {
        padding: 0.75rem 0.5rem;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

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
  `]
})
export class CallLogsComponent implements OnInit {
  callLogs = signal<CallLog[]>([]);
  filteredLogs = signal<CallLog[]>([]);
  contacts = signal<Contact[]>([]);
  paginationInfo = signal<PaginatedResponse<CallLog>>({
    items: [],
    total: 0,
    page: 1,
    per_page: 10,
    total_pages: 0
  });
  isLoading = signal(true);
  showDetailsModal = signal(false);
  selectedLog = signal<CallLog | null>(null);
  Math = Math;

  statusFilter = new FormControl('');
  searchFilter = new FormControl('');

  constructor(
    private callLogService: CallLogService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  loadData(page?: number, per_page?: number): void {
    this.isLoading.set(true);
    
    const currentPage = page || this.paginationInfo().page;
    const currentPerPage = per_page || this.paginationInfo().per_page;
    
    Promise.all([
      this.callLogService.getCallLogs(currentPage, currentPerPage).toPromise(),
      this.contactService.getAllContacts().toPromise()
    ]).then(([logsResponse, contacts]) => {
      if (logsResponse) {
        this.paginationInfo.set(logsResponse);
        this.callLogs.set(logsResponse.items);
      }
      this.contacts.set(contacts || []);
      this.applyFilters();
      this.isLoading.set(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      this.isLoading.set(false);
    });
  }

  setupFilters(): void {
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    let filtered = [...this.callLogs()];

    // Filtro por estado
    const statusValue = this.statusFilter.value;
    if (statusValue) {
      filtered = filtered.filter(log => log.status === statusValue);
    }

    // Filtro por búsqueda
    const searchValue = this.searchFilter.value?.toLowerCase() || '';
    if (searchValue) {
      filtered = filtered.filter(log => {
        const contactName = this.getContactName(log.contact_id).toLowerCase();
        const phoneNumber = log.phone_number.toLowerCase();
        return contactName.includes(searchValue) || phoneNumber.includes(searchValue);
      });
    }

    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    this.filteredLogs.set(filtered);
  }

  getContactName(contactId: string): string {
    const contact = this.contacts().find(c => c.id === contactId);
    return contact?.name || 'Contacto desconocido';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'completed': 'Completada',
      'failed': 'Fallida',
      'busy': 'Ocupado',
      'no-answer': 'Sin respuesta',
      'in-progress': 'En progreso'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'completed': 'completed',
      'failed': 'failed',
      'busy': 'busy',
      'no-answer': 'no-answer',
      'in-progress': 'in-progress'
    };
    return classes[status] || 'no-answer';
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

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  viewDetails(log: CallLog): void {
    this.selectedLog.set(log);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedLog.set(null);
  }

  hasFilters(): boolean {
    return !!(this.statusFilter.value || this.searchFilter.value);
  }

  clearFilters(): void {
    this.statusFilter.setValue('');
    this.searchFilter.setValue('');
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