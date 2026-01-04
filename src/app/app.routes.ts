import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth.guard';
import { Projects } from './features/projects/projects/projects';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { Signup } from './features/auth/signup/signup/signup';
import { Login } from './features/auth/login/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  { 
    path: 'projects', 
    component: Projects,
    canActivate: [AuthGuard]
  }
];