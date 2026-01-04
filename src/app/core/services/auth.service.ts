// core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://jsonplaceholder.typicode.com'; // Fake API
  private currentUserSignal = signal<User | null>(null);
  
  currentUser = this.currentUserSignal.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<User> {
    // Simulate API call with fake data
    return of({
      id: 1,
      email: email,
      name: email.split('@')[0],
      token: 'fake-jwt-token-' + Date.now()
    }).pipe(
      delay(1000),
      map(user => {
        this.setUser(user);
        return user;
      })
    );
  }

  signup(email: string, password: string, name: string): Observable<User> {
    return of({
      id: Math.floor(Math.random() * 1000),
      email: email,
      name: name,
      token: 'fake-jwt-token-' + Date.now()
    }).pipe(
      delay(1000),
      map(user => {
        this.setUser(user);
        return user;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSignal();
  }

  private setUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUserSignal.set(JSON.parse(userStr));
    }
  }
}