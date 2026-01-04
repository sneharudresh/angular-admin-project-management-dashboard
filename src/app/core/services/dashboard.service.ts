// core/services/dashboard.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface Project {
  id: number;
  name: string;
  progress: number;
  status: string;
  startDate: string;
  type?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://jsonplaceholder.typicode.com';
  
  // Shared projects signal for real-time updates
  private projectsSignal = signal<any[]>([]);
  private readonly STORAGE_KEY = 'dashboard_projects';

  constructor(private http: HttpClient) {
    this.initializeProjects();
  }

  private initializeProjects(): void {
    // Try to load from localStorage first
    const storedProjects = this.loadFromStorage();
    
    if (storedProjects && storedProjects.length > 0) {
      this.projectsSignal.set(storedProjects);
    } else {
      // Initialize with default projects if nothing in storage
      const projectTypes = ['Install', 'Migrate', 'Upgrade'];
      const statuses = ['active', 'pending', 'completed'];
      const projectNames = [
        'E-Commerce Platform - Production',
        'Customer Data Migration - Phase 1',
        'Database System Upgrade - v2.5',
        'CRM System Install - Test Environment',
        'Legacy System Migration - Historical Data',
        'Mobile App Backend Install - Development',
        'Backup Server Install - DR Site',
        'ERP System Upgrade - v5.2',
        'Cloud Storage Migration - Archive Data',
        'Security Framework Upgrade - Latest Patch',
        'API Gateway Install - QA Environment',
        'Document Management Migration - Old Records'
      ];

      const projects = projectNames.map((name, index) => {
        const status = statuses[index % 3];
        let progress = 0;
        
        if (status === 'active') {
          progress = Math.floor(Math.random() * 80) + 10;
        } else if (status === 'completed') {
          progress = 100;
        } else {
          progress = 0;
        }

        return {
          id: index + 1,
          name: name,
          progress: progress,
          status: status,
          startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: projectTypes[Math.floor(index / 4) % 3]
        };
      });

      this.projectsSignal.set(projects);
      this.saveToStorage(projects);
    }
  }

  private loadFromStorage(): any[] | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return null;
    }
  }

  private saveToStorage(projects: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  }

  // Get projects signal for reactive updates
  getProjectsSignal() {
    return this.projectsSignal.asReadonly();
  }

  // Get mock projects data
  getProjects(): Observable<Project[]> {
    return of([
      {
        id: 1,
        name: 'Documentum Install - Test (test)',
        progress: 0,
        status: 'running',
        startDate: '2025-12-24 11:26:09'
      }
    ]).pipe(delay(500));
  }

  // Get all projects with varied statuses for dashboard
  getAllProjects(): Observable<any[]> {
    return of(this.projectsSignal()).pipe(delay(500));
  }

  // Get users from fake API
  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.id % 3 === 0 ? 'Admin' : user.id % 2 === 0 ? 'Editor' : 'Viewer'
      })))
    );
  }

  // Get posts as project items from fake API
  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  // Get todos as tasks from fake API
  getTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/todos`);
  }

  // Get single user
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  // Create new project (mock)
  createProject(project: Partial<Project>): Observable<Project> {
    return of({
      id: Math.floor(Math.random() * 1000),
      name: project.name || 'New Project',
      progress: 0,
      status: 'pending',
      startDate: new Date().toISOString()
    } as Project).pipe(delay(1000));
  }

  // Update project (mock)
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return of({
      id,
      ...project
    } as Project).pipe(delay(500));
  }

  // Delete project (mock)
  deleteProject(id: number): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  // Add new project to the shared signal
  addProject(project: any): Observable<any> {
    const currentProjects = this.projectsSignal();
    const newProject = {
      id: Math.max(...currentProjects.map(p => p.id), 0) + 1,
      name: project.name,
      progress: project.progress || 0,
      status: project.status,
      startDate: project.startDate || new Date().toISOString().split('T')[0],
      type: project.type
    };
    
    // Add to the end and sort by ID ascending
    const updatedProjects = [...currentProjects, newProject].sort((a, b) => a.id - b.id);
    this.projectsSignal.set(updatedProjects);
    this.saveToStorage(updatedProjects);
    
    return of(newProject).pipe(delay(500));
  }

  // Remove project from the shared signal
  removeProject(id: number): void {
    const currentProjects = this.projectsSignal();
    const updatedProjects = currentProjects.filter(p => p.id !== id);
    this.projectsSignal.set(updatedProjects);
    this.saveToStorage(updatedProjects);
  }

  // Update project in the shared signal
  updateProjectInSignal(id: number, updates: any): void {
    const currentProjects = this.projectsSignal();
    const updatedProjects = currentProjects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    this.projectsSignal.set(updatedProjects);
    this.saveToStorage(updatedProjects);
  }
}