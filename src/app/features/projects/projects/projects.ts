
// features/projects/projects.component.ts
import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { NewProjectDialog } from '../new-project-dialog/new-project-dialog';

interface ProjectData {
  id: number;
  title: string;
  status: string;
  userId: number;
  assignedTo: string;
  priority: string;
  createdDate: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'assignedTo', 'status', 'priority', 'createdDate', 'actions'];
  dataSource!: MatTableDataSource<ProjectData>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectedStatus = 'all';
  selectedPriority = 'all';
  
  allProjects: ProjectData[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    // Always load from the dashboard service which uses localStorage
    this.dashboardService.getAllProjects().subscribe(projects => {
      const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
      const priorities = ['high', 'medium', 'low'];

      this.allProjects = projects.map(project => ({
        id: project.id,
        title: project.name,
        status: project.status,
        userId: project.id,
        assignedTo: names[project.id % 5],
        priority: priorities[project.id % 3],
        createdDate: project.startDate
      }));

      this.dataSource = new MatTableDataSource(this.allProjects);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom filter predicate
      this.dataSource.filterPredicate = (data: ProjectData, filter: string) => {
        const searchStr = filter.toLowerCase();
        return data.title.toLowerCase().includes(searchStr) ||
               data.assignedTo.toLowerCase().includes(searchStr) ||
               data.status.toLowerCase().includes(searchStr) ||
               data.id.toString().includes(searchStr);
      };
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(): void {
    if (this.selectedStatus === 'all') {
      this.dataSource.data = this.allProjects;
    } else {
      this.dataSource.data = this.allProjects.filter(p => p.status === this.selectedStatus);
    }
  }

  filterByPriority(): void {
    if (this.selectedPriority === 'all') {
      this.dataSource.data = this.allProjects;
    } else {
      this.dataSource.data = this.allProjects.filter(p => p.priority === this.selectedPriority);
    }
  }

  addNewProject(): void {
    const dialogRef = this.dialog.open(NewProjectDialog, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add project through the dashboard service which handles localStorage
        this.dashboardService.addProject(result).subscribe((newProject) => {
          this.snackBar.open('Project created successfully!', 'Close', { duration: 3000 });
          
          // Reload the projects table to show the new project
          this.loadProjects();
        });
      }
    });
  }

  viewProject(project: ProjectData): void {
    this.snackBar.open(`Viewing project: ${project.title}`, 'Close', { duration: 3000 });
  }

  editProject(project: ProjectData): void {
    this.snackBar.open(`Editing project: ${project.title}`, 'Close', { duration: 3000 });
  }

  deleteProject(project: ProjectData): void {
    if (confirm(`Are you sure you want to delete project: ${project.title}?`)) {
      this.dashboardService.removeProject(project.id);
      // Reload the table to reflect the deletion
      this.loadProjects();
      this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}