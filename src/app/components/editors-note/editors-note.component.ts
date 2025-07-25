import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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

  ngAfterViewInit() {
    console.log('📝 Editor\'s Note component initialized');
    // Delay animation initialization to ensure data is loaded
    setTimeout(() => {
      this.initializeAnimations();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger &&
          typeof trigger.vars.trigger !== 'string' &&
          trigger.vars.trigger instanceof Element &&
          trigger.vars.trigger.closest('.editors-note')) {
        trigger.kill();
      }
    });
  }

  private initializeAnimations() {
    console.log('📝 Initializing animations...');

    // Temporarily disable initial hiding to debug
    // Set initial states
    // gsap.set('.editors-note .fade-in-element', {
    //   opacity: 0,
    //   y: 50
    // });

    // gsap.set('.editors-note .slide-in-left', {
    //   opacity: 0,
    //   x: -100
    // });

    // gsap.set('.editors-note .slide-in-right', {
    //   opacity: 0,
    //   x: 100
    // });

    // gsap.set('.editors-note .editor-image', {
    //   opacity: 0,
    //   scale: 0.8
    // });

    // gsap.set('.editors-note .editor-info', {
    //   opacity: 0,
    //   y: 30
    // });

    // Create ScrollTrigger animation
    this.animateContent();
  }

  private animateContent() {
    console.log('📝 Creating ScrollTrigger animation...');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.editors-note',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => console.log('📝 ScrollTrigger entered'),
        onLeave: () => console.log('📝 ScrollTrigger left'),
        onEnterBack: () => console.log('📝 ScrollTrigger entered back'),
        onLeaveBack: () => console.log('📝 ScrollTrigger left back')
      }
    });

    // Animate header
    tl.to('.editors-note .page-title', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out'
    })

    // Animate editor profile
    .to('.editors-note .editor-image', {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.5')

    .to('.editors-note .editor-info', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.2
    }, '-=0.6')

    // Animate content sections
    .to('.editors-note .fade-in-element', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.3
    }, '-=0.4')

    // Animate section dividers
    .to('.editors-note .slide-in-left', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')

    .to('.editors-note .slide-in-right', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-editor.jpg';
  }
}