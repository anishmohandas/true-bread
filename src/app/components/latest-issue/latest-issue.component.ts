import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Issue } from '../../shared/interfaces/issue.interface';
import { IssueService } from '../../services/issue.service';
import { ScrollTrackerService } from '../../services/scroll-tracker.service';
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
    private elementRef: ElementRef,
    private router: Router,
    private googleAnalytics: GoogleAnalyticsService
  ) {}

  ngOnInit() {
    console.log('📰 Latest Issue component ngOnInit called');
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
      // Track PDF view
      this.googleAnalytics.trackPdfView(this.currentIssue.month, this.currentIssue.id);
      window.open(this.currentIssue.pdfUrl, '_blank');
    } else {
      console.error('PDF URL not available for current issue');
      alert('PDF is not available for this issue. Please try again later.');
    }
  }

  onDownloadPDF() {
    if (this.currentIssue?.pdfUrl) {
      // Track PDF download
      this.googleAnalytics.trackPdfDownload(this.currentIssue.month, this.currentIssue.id);
      
      try {
        const link = document.createElement('a');
        link.href = this.currentIssue.pdfUrl;
        link.download = `${this.currentIssue.month}-issue.pdf`;
        link.target = '_blank'; // Add target blank for better compatibility
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading PDF:', error);
        // Fallback to opening in new tab
        window.open(this.currentIssue.pdfUrl, '_blank');
      }
    } else {
      console.error('PDF URL not available for current issue');
      alert('PDF is not available for this issue. Please try again later.');
    }
  }

  /**
   * Navigate to the preview page for the current issue
   */
  navigateToPreview() {
    if (this.currentIssue) {
      this.router.navigate(['/preview', this.currentIssue.id]);
    } else {
      this.router.navigate(['/preview']);
    }
  }



  ngAfterViewInit() {
    // Set up intersection observer to detect when the component is in view
    this.setupIntersectionObserver();

    // Set up scroll listener to detect when we've scrolled past the component
    this.setupScrollListener();

    // Initialize GSAP button animations
    this.initializeButtonAnimations();
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

      //console.log('Latest issue is intersecting:', isIntersecting);

      // Update the tracker state
      this.scrollTrackerService.setInLatestIssueSection(isIntersecting);

      // If we're no longer intersecting and we've scrolled down, we've passed the section
      if (!isIntersecting && entries[0].boundingClientRect.y < 0) {
        //console.log('Scrolled past latest issue section');
        this.scrollTrackerService.setPastLatestIssueSection(true);
      } else if (isIntersecting) {
        //console.log('In latest issue section or scrolled back up');
        this.scrollTrackerService.setPastLatestIssueSection(false);
      }
    }, {
      threshold: [0, 0.1, 0.5, 1] // Trigger at multiple thresholds for better detection
    });

    // Start observing the component
    const latestIssueSection = this.elementRef.nativeElement.querySelector('#latest-issue-section');
    if (latestIssueSection) {
      this.observer.observe(latestIssueSection);
      //console.log('Started observing latest issue section with ID');
    } else {
      this.observer.observe(this.elementRef.nativeElement);
      //console.log('Started observing latest issue component (fallback)');
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

      //console.log('Scroll listener - isPast:', isPast, 'rect.bottom:', rect.bottom);

      // Update the tracker state
      this.scrollTrackerService.setPastLatestIssueSection(isPast);
    };

    // Add the scroll listener
    window.addEventListener('scroll', this.scrollListener);
    //console.log('Added scroll listener for latest issue section');
  }

  scrollToNextSection() {
    // Scroll to the issue highlights section
    const issueHighlightsElement = document.querySelector('app-issue-highlights');
    if (issueHighlightsElement) {
      issueHighlightsElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
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
}



