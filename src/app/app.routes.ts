import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [authGuard],
    children: [
      { 
        path: 'home', 
        loadComponent: () => import('./components/home/home.component').then(c => c.HomeComponent),
      },
      { 
        path: 'contact-groups', 
        loadComponent: () => import('./components/contact-groups/contact-groups.component').then(c => c.ContactGroupsComponent),
      },
      { 
        path: 'contacts', 
        loadComponent: () => import('./components/contacts/contacts.component').then(c => c.ContactsComponent),
      },
      { 
        path: 'triggers', 
        loadComponent: () => import('./components/triggers/triggers.component').then(c => c.TriggersComponent),
      },
      { 
        path: 'call-logs', 
        loadComponent: () => import('./components/call-logs/call-logs.component').then(c => c.CallLogsComponent),
      },
      { 
        path: 'email-events', 
        loadComponent: () => import('./components/email-events/email-events.component').then(c => c.EmailEventsComponent),
      },
    ]
  },
  { path: '**', redirectTo: '/dashboard/home' }
];
