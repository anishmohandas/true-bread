import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Publication } from '../../shared/interfaces/publication.interface';
import { PublicationsService } from '../../services/publications.service';
import { ScrollService } from 'src/app/services/scroll.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, AfterViewInit {
  publications: Publication[] = [];
  loading = true;
  error = false;
  selectedYear: number | null = null;
  years: number[] = [];

  constructor(private publicationsService: PublicationsService, private scrollService: ScrollService) {}

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Wait for the scroll system to be ready before loading content
    setTimeout(() => {
      this.initializeComponent();
    }, 300);
  }

  private initializeComponent() {
    this.publicationsService.getAllPublications().subscribe({
      next: (publications) => {
        this.publications = publications;
        this.years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
        this.loading = false;

        // Multiple resize triggers to ensure proper height calculation
        this.triggerScrollResize();
      },
      error: (error) => {
        console.error('Error fetching publications:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private triggerScrollResize() {
    // Immediate resize
    this.scrollService.triggerResize();

    // Resize after DOM updates
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 100);

    // Resize after images load
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 500);

    // Final resize to ensure everything is calculated
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 1000);
  }

  ngAfterViewInit() {
    // Ensure scroll service recalculates after view is fully initialized
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 200);
  }

  get filteredPublications(): Publication[] {
    if (!this.selectedYear) return this.publications;
    return this.publications.filter(pub => pub.year === this.selectedYear);
  }

  filterByYear(year: number | null) {
    this.selectedYear = year;

    // Trigger resize after filter change to ensure proper height calculation
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 100);
  }

  onViewPDF(pdfUrl: string) {
    window.open(pdfUrl, '_blank');
  }

  onDownloadPDF(publication: Publication) {
    const link = document.createElement('a');
    link.href = publication.pdfUrl;
    link.download = `${publication.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onImageLoad() {
    // Trigger resize when each image loads
    this.scrollService.triggerResize();

    // Additional resize after a short delay to ensure layout is stable
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 50);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    // Trigger resize when window size changes
    this.scrollService.triggerResize();
  }
}
