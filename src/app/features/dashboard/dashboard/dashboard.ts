import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';

interface ProjectStatus {
  id: number;
  name: string;
  progress: number;
  status: string;
  startDate: string;
  type: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{
projects = signal<ProjectStatus[]>([]);
  selectedFilter = signal<string>('all');

  // Computed signals for dashboard statistics
  dashboardStats = computed(() => {
    const allProjects = this.projects();
    const active = allProjects.filter(p => p.status === 'active').length;
    const pending = allProjects.filter(p => p.status === 'pending').length;
    const completed = allProjects.filter(p => p.status === 'completed').length;
    
    const totalProgress = allProjects.reduce((sum, p) => sum + p.progress, 0);
    const avgProgress = allProjects.length > 0 ? Math.round(totalProgress / allProjects.length) : 0;
    
    const needAttention = allProjects.filter(p => 
      p.status === 'pending' || (p.status === 'active' && p.progress < 20)
    ).length;

    return {
      totalProjects: allProjects.length,
      activeProjects: active,
      completedProjects: completed,
      pendingProjects: pending,
      averageProgress: avgProgress,
      needAttention: needAttention
    };
  });

  projectsByType = computed(() => {
    const allProjects = this.projects();
    return {
      install: allProjects.filter(p => p.type === 'Install').length,
      migrate: allProjects.filter(p => p.type === 'Migrate').length,
      upgrade: allProjects.filter(p => p.type === 'Upgrade').length
    };
  });

  filteredProjects = computed(() => {
    const filter = this.selectedFilter();
    const allProjects = this.projects();
    
    if (filter === 'all') return allProjects;
    return allProjects.filter(p => p.status === filter);
  });

  needAttentionProjects = computed(() => {
    return this.projects().filter(p => 
      p.status === 'pending' || (p.status === 'active' && p.progress < 20)
    );
  });

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.dashboardService.getAllProjects().subscribe(projects => {
      this.projects.set(projects);
    });
  }

  goToProjects(filter?: string): void {
    if (filter) {
      this.router.navigate(['/projects'], { queryParams: { filter } });
    } else {
      this.router.navigate(['/projects']);
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'active': return 'play_circle_filled';
      case 'pending': return 'pending';
      case 'completed': return 'check_circle';
      default: return 'info';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  }

  getProjectDuration(startDate: string): string {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Started today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  startProject(project: ProjectStatus): void {
    const updatedProjects = this.projects().map(p => 
      p.id === project.id ? { ...p, status: 'active', progress: 10 } : p
    );
    this.projects.set(updatedProjects);
    this.snackBar.open(`Project "${project.name}" started`, 'Close', { duration: 3000 });
  }

  pauseProject(project: ProjectStatus): void {
    const updatedProjects = this.projects().map(p => 
      p.id === project.id ? { ...p, status: 'pending' } : p
    );
    this.projects.set(updatedProjects);
    this.snackBar.open(`Project "${project.name}" paused`, 'Close', { duration: 3000 });
  }

  deleteProject(project: ProjectStatus): void {
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      const updatedProjects = this.projects().filter(p => p.id !== project.id);
      this.projects.set(updatedProjects);
      this.snackBar.open(`Project "${project.name}" deleted successfully`, 'Close', { duration: 3000 });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}