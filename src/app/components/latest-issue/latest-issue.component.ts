import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { Issue } from '../../shared/interfaces/issue.interface';
import { IssueService } from '../../services/issue.service';
import { ScrollTrackerService } from '../../services/scroll-tracker.service';

@Component({
  selector: 'app-latest-issue',
  templateUrl: './latest-issue.component.html',
  styleUrls: ['./latest-issue.component.scss']
})
export class LatestIssueComponent implements OnInit, AfterViewInit, OnDestroy {
  currentIssue: Issue | null = null;
  loading = true;
  error = false;

  private observer: IntersectionObserver | null = null;
  private scrollListener: any;

  constructor(
    private issueService: IssueService,
    private scrollTrackerService: ScrollTrackerService,
    private elementRef: ElementRef
  ) {}

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

  ngAfterViewInit() {
    // Set up intersection observer to detect when the component is in view
    this.setupIntersectionObserver();

    // Set up scroll listener to detect when we've scrolled past the component
    this.setupScrollListener();
  }

  ngOnDestroy() {
    // Clean up observers and listeners
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }

    // Reset the tracker state when component is destroyed
    this.scrollTrackerService.setInLatestIssueSection(false);
    this.scrollTrackerService.setPastLatestIssueSection(false);
  }

  private setupIntersectionObserver() {
    // Create an intersection observer to detect when the component is in view
    this.observer = new IntersectionObserver((entries) => {
      const isIntersecting = entries[0].isIntersecting;

      console.log('Latest issue is intersecting:', isIntersecting);

      // Update the tracker state
      this.scrollTrackerService.setInLatestIssueSection(isIntersecting);

      // If we're no longer intersecting and we've scrolled down, we've passed the section
      if (!isIntersecting && entries[0].boundingClientRect.y < 0) {
        console.log('Scrolled past latest issue section');
        this.scrollTrackerService.setPastLatestIssueSection(true);
      } else if (isIntersecting) {
        console.log('In latest issue section or scrolled back up');
        this.scrollTrackerService.setPastLatestIssueSection(false);
      }
    }, {
      threshold: [0, 0.1, 0.5, 1] // Trigger at multiple thresholds for better detection
    });

    // Start observing the component
    const latestIssueSection = this.elementRef.nativeElement.querySelector('#latest-issue-section');
    if (latestIssueSection) {
      this.observer.observe(latestIssueSection);
      console.log('Started observing latest issue section with ID');
    } else {
      this.observer.observe(this.elementRef.nativeElement);
      console.log('Started observing latest issue component (fallback)');
    }
  }

  private setupScrollListener() {
    // Create a scroll listener to detect when we've scrolled past the component
    this.scrollListener = () => {
      // Try to get the section by ID first
      const latestIssueSection = document.getElementById('latest-issue-section');
      const rect = latestIssueSection
        ? latestIssueSection.getBoundingClientRect()
        : this.elementRef.nativeElement.getBoundingClientRect();

      const isPast = rect.bottom < 0;

      console.log('Scroll listener - isPast:', isPast, 'rect.bottom:', rect.bottom);

      // Update the tracker state
      this.scrollTrackerService.setPastLatestIssueSection(isPast);
    };

    // Add the scroll listener
    window.addEventListener('scroll', this.scrollListener);
    console.log('Added scroll listener for latest issue section');
  }
}



