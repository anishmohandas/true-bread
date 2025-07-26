import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Publication } from '../../shared/interfaces/publication.interface';
import { PublicationsService } from '../../services/publications.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

// HoverBtn class from CodePen
class HoverBtn {
  btn: HTMLElement;
  txt: HTMLElement;
  hoverTxt: HTMLElement;
  split1: any;
  split2: any;
  numChars1: number;
  numChars2: number;

  constructor(el: HTMLElement) {
    this.bindAll();

    this.btn = el;
    this.txt = this.btn.querySelector(".js-button__text") as HTMLElement;
    this.hoverTxt = this.btn.querySelector(".js-button__hover") as HTMLElement;
    this.split1 = new SplitText(this.txt, {type:"chars, words"});
    this.split2 = new SplitText(this.hoverTxt, {type:"chars, words"});
    this.numChars1 = this.split1.chars.length;
    this.numChars2 = this.split2.chars.length;

    this.addListeners();

    for(var i = 0; i < this.numChars2; i++){
      gsap.set(this.split2.chars[i], {
        y: 30 * Math.random()
      });
    }
  }

  bindAll() {
    const methods = ['mouseIn', 'mouseOut'];

    for (let i = 0; i < methods.length; i++) {
      const fn = methods[i];
      (this as any)[fn] = (this as any)[fn].bind(this);
    }
  }

  mouseIn() {
    for (var i = 0; i < this.numChars1; i++) {
      gsap.to(this.split1.chars[i], {
        duration: 0.5,
        y: -30 * Math.random(),
        delay: 0.01
      });
    }
    gsap.to(this.split2.chars, {
      duration: 0.5,
      y: 0,
      stagger: 0.01
    });
  }

  mouseOut() {
    gsap.to(this.split1.chars, {
      duration: 0.5,
      y: 0,
      stagger: 0.01
    });
    for (var i = 0; i < this.numChars2; i++) {
      gsap.to(this.split2.chars[i], {
        duration: 0.5,
        y: 30 * Math.random(),
        delay: 0.01
      });
    }
  }

  addListeners() {
    this.btn.addEventListener("mouseenter", this.mouseIn.bind(this));
    this.btn.addEventListener("mouseleave", this.mouseOut.bind(this));
  }
}

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

  constructor(
    private publicationsService: PublicationsService,
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    private googleAnalytics: GoogleAnalyticsService
  ) {}

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

    // Initialize button animations after content loads
    setTimeout(() => {
      this.initializeButtonAnimations();
    }, 1000);
  }

  private initializeButtonAnimations() {
    // Wait for fonts to load before initializing SplitText
    document.fonts.ready.then(() => {
      // Register SplitText plugin
      gsap.registerPlugin(SplitText);

      // Initialize HoverBtn for each button
      const buttons = this.elementRef.nativeElement.querySelectorAll('.js-button');
      buttons.forEach((button: HTMLElement) => {
        new HoverBtn(button);
      });
    }).catch(() => {
      // Fallback if fonts don't load
      setTimeout(() => this.initializeButtonAnimations(), 1000);
    });
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
    // Find the publication to get its details for tracking
    const publication = this.publications.find(pub => pub.pdfUrl === pdfUrl);
    if (publication) {
      this.googleAnalytics.trackPdfView(publication.title, publication.id);
    }
    window.open(pdfUrl, '_blank');
  }

  onDownloadPDF(publication: Publication) {
    // Track PDF download
    this.googleAnalytics.trackPdfDownload(publication.title, publication.id);

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
