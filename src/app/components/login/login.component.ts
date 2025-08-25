import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>MailToCall Dashboard</h1>
        <p>Gestión de llamadas automatizadas</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              id="username"
              type="text" 
              formControlName="username"
              [class.error]="username.invalid && username.touched"
              placeholder="Ingresa tu usuario"
            />
            @if (username.invalid && username.touched) {
              <span class="error-message">Usuario requerido</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              formControlName="password"
              [class.error]="password.invalid && password.touched"
              placeholder="Ingresa tu contraseña"
            />
            @if (password.invalid && password.touched) {
              <span class="error-message">Contraseña requerida</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="error-banner">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading()"
            class="login-btn"
          >
            @if (isLoading()) {
              Iniciando sesión...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.875rem;
      font-weight: 700;
      color: #1f2937;
      text-align: center;
    }

    p {
      margin: 0 0 2rem 0;
      color: #6b7280;
      text-align: center;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 500;
      color: #374151;
    }

    input {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
    }

    input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
    }

    .error-banner {
      background: #fef2f2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #fecaca;
      text-align: center;
    }

    .login-btn {
      padding: 0.875rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .login-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  isLoading = signal(false);
  errorMessage = signal<string>('');

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get username() { return this.loginForm.get('username')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials = {
        username: this.username.value!,
        password: this.password.value!
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/home']);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set('Credenciales incorrectas. Por favor, intenta de nuevo.');
          console.error('Login error:', error);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    }
  }
}