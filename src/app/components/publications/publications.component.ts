import { Component, OnInit } from '@angular/core';
import { Publication } from '../../shared/interfaces/publication.interface';
import { PublicationsService } from '../../services/publications.service';
import { ScrollService } from 'src/app/services/scroll.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit {
  publications: Publication[] = [];
  loading = true;
  error = false;
  selectedYear: number | null = null;
  years: number[] = [];

  constructor(private publicationsService: PublicationsService, private scrollService: ScrollService) {}

  ngOnInit() {
    this.publicationsService.getAllPublications().subscribe({
      next: (publications) => {
        this.publications = publications;
        this.years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching publications:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  get filteredPublications(): Publication[] {
    if (!this.selectedYear) return this.publications;
    return this.publications.filter(pub => pub.year === this.selectedYear);
  }

  filterByYear(year: number | null) {
    this.selectedYear = year;
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
    this.scrollService.triggerResize();
  }
}
