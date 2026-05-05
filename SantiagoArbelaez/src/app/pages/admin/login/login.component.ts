import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Admin Access</h1>
        <p>Enter your security PIN</p>
        <div class="pin-input-wrapper">
          <input 
            type="password" 
            [(ngModel)]="pin" 
            placeholder="••••••" 
            maxlength="6"
            (keyup.enter)="login()"
          >
        </div>
        <button (click)="login()">Unlock Dashboard</button>
        <p class="hint">Default PIN is 1234</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080808;
      color: white;
      font-family: 'Inter', sans-serif;
    }
    .login-card {
      background: #111;
      padding: 3rem;
      border-radius: 1.5rem;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
      border: 1px solid #222;
      width: 100%;
      max-width: 400px;
    }
    h1 { margin-bottom: 0.5rem; font-size: 2rem; font-weight: 800; }
    p { color: #888; margin-bottom: 2rem; }
    input {
      display: block;
      width: 100%;
      padding: 1.2rem;
      margin-bottom: 2rem;
      background: #000;
      border: 1px solid #333;
      border-radius: 0.8rem;
      color: white;
      font-size: 1.8rem;
      text-align: center;
      letter-spacing: 0.8rem;
      transition: border-color 0.3s;
    }
    input:focus {
      outline: none;
      border-color: #555;
    }
    button {
      width: 100%;
      padding: 1rem;
      background: #fff;
      color: #000;
      border: none;
      border-radius: 0.8rem;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    button:hover {
      background: #eee;
      transform: translateY(-2px);
    }
    button:active {
      transform: translateY(0);
    }
    .hint { font-size: 0.8rem; color: #444; margin-top: 1.5rem; }
  `]
})
export class LoginComponent {
  pin = '';
  private router = inject(Router);

  login() {
    if (this.pin === '1234') {
      localStorage.setItem('admin_session', 'active_token_' + Date.now());
      this.router.navigate(['/admin']);
    } else {
      alert('Invalid PIN');
      this.pin = '';
    }
  }
}
