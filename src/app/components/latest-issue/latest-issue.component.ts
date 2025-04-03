import { Component, OnInit } from '@angular/core';
import { Issue } from '../../shared/interfaces/issue.interface';
import { IssueService } from '../../services/issue.service';

@Component({
  selector: 'app-latest-issue',
  templateUrl: './latest-issue.component.html',
  styleUrls: ['./latest-issue.component.scss']
})
export class LatestIssueComponent implements OnInit {
  currentIssue: Issue | null = null;
  loading = true;
  error = false;

  constructor(private issueService: IssueService) {}

  ngOnInit() {
    this.loadLatestIssue();
  }

  private loadLatestIssue() {
    this.loading = true;
    this.error = false;
    
    this.issueService.getLatestIssue().subscribe({
      next: (issue: Issue) => {
        this.currentIssue = issue;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching latest issue:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  onViewPDF() {
    if (this.currentIssue?.pdfUrl) {
      window.open(this.currentIssue.pdfUrl, '_blank');
    }
  }

  onDownloadPDF() {
    if (this.currentIssue?.pdfUrl) {
      const link = document.createElement('a');
      link.href = this.currentIssue.pdfUrl;
      link.download = `${this.currentIssue.month}-issue.pdf`;
      link.click();
    }
  }
}



