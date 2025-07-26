import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { EditorialService } from '../../services/editorial.service';
import { Editorial } from '../../shared/interfaces/editorial.interface';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-editors-note',
  templateUrl: './editors-note.component.html',
  styleUrls: ['./editors-note.component.scss']
})
export class EditorsNoteComponent implements OnInit, AfterViewInit, OnDestroy {
  editorial: Editorial | null = null;
  loading = true;
  error = false;

  // Query all elements that should have SplitType animation
  @ViewChildren('splitTarget', { read: ElementRef }) splitTargets!: QueryList<ElementRef>;

  constructor(private editorialService: EditorialService) {}

  ngOnInit() {
    console.log('📝 Editor\'s Note component ngOnInit called');
    this.loadEditorialData();
  }

  private loadEditorialData() {
    this.loading = true;
    this.error = false;

    this.editorialService.getLatestEditorial().subscribe({
      next: (response) => {
        if (!response?.data) {
          this.error = true;
          this.loading = false;
          return;
        }

        const data = response.data;

        this.editorial = {
          id: data.id,
          title: data.language === 'ml' ? (data.titleMl || data.title) : data.title,
          content: data.language === 'ml' ? (data.contentMl || data.content) : data.content,
          excerpt: data.language === 'ml' ? (data.excerptMl || data.excerpt) : data.excerpt,
          publishDate: data.publishDate,
          month: data.language === 'ml' ? (data.month_ml || data.month) : data.month,
          year: data.year.toString(),
          language: data.language,
          editor: {
            name: data.editor.name,
            role: data.editor.role,
            imageUrl: data.editor.imageUrl,
            bio: data.editor.bio
          },
          imageUrl: data.image_url,
          titleMl: data.titleMl,
          contentMl: data.contentMl,
          excerptMl: data.excerptMl,
          monthMl: data.month_ml
        };

        this.loading = false;
        console.log('📝 Editorial data loaded:', this.editorial);
      },
      error: (error) => {
        console.error('📝 Error fetching editorial data:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    console.log('📝 Editor\'s Note component initialized');
    // Delay animation initialization to ensure data is loaded
    setTimeout(() => {
      this.initializeAnimations();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances related to this component
    ScrollTrigger.getAll().forEach(trigger => {
      const el = trigger.vars.trigger as HTMLElement;
      if (el && el.closest('.editors-note')) {
        trigger.kill(true);
      }
    });
  }

  private initializeAnimations() {
    console.log('📝 Initializing SplitType animations...');

    document.fonts.ready.then(() => {
      this.setupSplitTypeAnimations();
    }).catch(() => {
      setTimeout(() => this.setupSplitTypeAnimations(), 1000);
    });
  }

  private setupSplitTypeAnimations() {
    console.log('📝 Setting up SplitType animations...');

    this.splitTargets.forEach(elRef => {
      const el = elRef.nativeElement as HTMLElement;
      if (!el.textContent?.trim()) return; // skip empty elements

      // Create SplitType instance splitting lines
      const split = new SplitType(el, {
        types: 'lines',
        lineClass: 'split-line'
      });

      // Animate lines from below with stagger and scroll trigger
      gsap.from(split.lines, {
        yPercent: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // You can keep your existing editor image/info animations here if needed
    gsap.from('.editors-note .editor-image', {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.editors-note .editor-image',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });

    gsap.from('.editors-note .editor-info', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power2.out',
      delay: 0.3,
      scrollTrigger: {
        trigger: '.editors-note .editor-info',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-editor.jpg';
  }
}
