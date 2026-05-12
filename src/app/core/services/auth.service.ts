import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'access_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly token = this.tokenSignal.asReadonly();

  login(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem(TOKEN_KEY, token);
  }

  logout(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}