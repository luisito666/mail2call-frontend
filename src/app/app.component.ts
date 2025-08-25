import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'MailToCall Dashboard';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() && !this.router.url.includes('login')) {
      this.router.navigate(['/login']);
    }
  }
}
