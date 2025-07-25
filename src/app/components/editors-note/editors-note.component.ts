import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

  constructor(private editorialService: EditorialService) {}

  ngOnInit() {
    console.log('📝 Editor\'s Note component ngOnInit called');
    this.loadEditorialData();
  }

  ngAfterViewInit() {
    console.log('📝 Editor\'s Note component initialized');
    // Delay animation initialization to ensure data is loaded
    setTimeout(() => {
      this.initializeAnimations();
    }, 100);
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

        // Transform the data to match our Editorial interface
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
          // Include Malayalam fields
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

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger && trigger.trigger.closest('.editors-note')) {
        trigger.kill();
      }
    });
  }

  private initializeAnimations() {
    // Set initial states
    gsap.set('.editors-note .fade-in-element', {
      opacity: 0,
      y: 50
    });

    gsap.set('.editors-note .slide-in-left', {
      opacity: 0,
      x: -100
    });

    gsap.set('.editors-note .slide-in-right', {
      opacity: 0,
      x: 100
    });

    gsap.set('.editors-note .editor-image', {
      opacity: 0,
      scale: 0.8
    });

    gsap.set('.editors-note .editor-info', {
      opacity: 0,
      y: 30
    });

    // Main title animation
    ScrollTrigger.create({
      trigger: '.editors-note',
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        console.log('📝 Editor\'s Note ScrollTrigger activated');
        this.animateContent();
      },
      onLeave: () => {
        console.log('📝 Editor\'s Note ScrollTrigger left');
      },
      onEnterBack: () => {
        console.log('📝 Editor\'s Note ScrollTrigger re-entered');
      }
    });
  }

  private animateContent() {
    const timeline = gsap.timeline();

    // Animate title
    timeline.to('.editors-note .main-title', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out'
    })

    // Animate greeting
    .to('.editors-note .greeting', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5')

    // Animate introduction paragraph
    .to('.editors-note .introduction', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4')

    // Animate mission section
    .to('.editors-note .mission-title', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.3')

    .to('.editors-note .mission-content', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4')

    // Animate new chapter section
    .to('.editors-note .chapter-title', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.3')

    .to('.editors-note .chapter-content', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4')

    // Animate editor section
    .to('.editors-note .editor-image', {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.4')

    .to('.editors-note .editor-info', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')

    // Animate closing
    .to('.editors-note .closing', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.3');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-editor.jpg';
  }
}
