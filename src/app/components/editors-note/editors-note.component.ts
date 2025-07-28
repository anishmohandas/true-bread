import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('editorsNoteContainer', { static: false }) editorsNoteContainer!: ElementRef;

  editorial: Editorial | null = null;
  loading = true;
  error = false;

  private splitTexts: SplitType[] = [];
  private animations: gsap.core.Timeline[] = [];
  private animatedElements = new Set<HTMLElement>();
  private elementToSplitMap = new Map<HTMLElement, SplitType>();
  private scrollListener?: () => void;
  private animationTimelines = new Map<HTMLElement, gsap.core.Timeline>();

  constructor(private editorialService: EditorialService) {}

  ngOnInit() {
    //console.log('📝 Editor\'s Note component ngOnInit called');
    // Scroll to top when component loads
    window.scrollTo(0, 0);
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
        //console.log('📝 Editorial data loaded:', this.editorial);
        
        // Initialize animations after data is loaded and view is ready - reduced delay
        setTimeout(() => {
          this.initializeSplitTextAnimations();
        }, 50);
      },
      error: (error) => {
        console.error('📝 Error fetching editorial data:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    //console.log('📝 Editor\'s Note component initialized');
    // Clean up any existing animations first
    this.cleanupAnimations();
    
    // Only initialize animations if data is already loaded, otherwise wait for data
    if (!this.loading && this.editorial) {
      this.initializeSplitTextAnimations();
    }
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      trigger.kill();
    });
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private cleanupAnimations(): void {
    //console.log('🧹 Cleaning up editor animations and split text instances');
    
    // Clean up animations and split text instances
    this.animations.forEach(animation => animation.kill());
    this.animations = [];
    
    this.splitTexts.forEach(split => split.revert());
    this.splitTexts = [];
    
    // Reset any manually created wrappers
    if (this.editorsNoteContainer?.nativeElement) {
      const lineWrappers = this.editorsNoteContainer.nativeElement.querySelectorAll('.line-wrapper');
      lineWrappers.forEach((wrapper: HTMLElement) => {
        const line = wrapper.querySelector('.line');
        if (line && wrapper.parentNode) {
          // Move the line back to its original position
          wrapper.parentNode.insertBefore(line, wrapper);
          wrapper.remove();
        }
      });

      // Reset editor image wrapper
      const imageWrapper = this.editorsNoteContainer.nativeElement.querySelector('.editor-image-wrapper');
      if (imageWrapper) {
        const image = imageWrapper.querySelector('.editor-image');
        if (image && imageWrapper.parentNode) {
          // Move the image back to its original position
          imageWrapper.parentNode.insertBefore(image, imageWrapper);
          imageWrapper.remove();
        }
      }
    }

    // Clear animated elements set, element mapping, and animation timelines
    this.animatedElements.clear();
    this.elementToSplitMap.clear();
    this.animationTimelines.clear();
  }

  private initializeSplitTextAnimations(): void {
    //console.log('🎬 Initializing split text animations for editor component');
    
    if (!this.editorsNoteContainer?.nativeElement) {
      console.error('❌ Editor container not found');
      return;
    }

    // Wait for fonts to load before setting up animations
    document.fonts.ready.then(() => {
      this.setupScrollBasedAnimations();
    }).catch(() => {
      // Fallback if fonts.ready fails
      setTimeout(() => {
        this.setupScrollBasedAnimations();
      }, 500);
    });
  }

  private setupScrollBasedAnimations(): void {
    //console.log('🎯 Setting up ScrollTrigger animations for editor component');

    // Target all text elements that should have split text animation
    const textElements = this.editorsNoteContainer.nativeElement.querySelectorAll(
      '.section-title, .paragraph, .column-subtitle, .editor-name, .editor-role, .editorial-content p, .editorial-content h1, .editorial-content h2, .editorial-content h3, .editorial-content h4, .editorial-content h5, .editorial-content h6'
    );

    //console.log(`📝 Found ${textElements.length} text elements to animate in editor`);

    // Collect all lines from all elements for coordinated animation
    const allLines: HTMLElement[] = [];
    const elementLineMap = new Map<HTMLElement, HTMLElement[]>();

    textElements.forEach((element: HTMLElement, index: number) => {
      // Skip if element is empty or only contains whitespace
      if (!element.textContent?.trim()) {
        //console.log(`⏭️ Skipping empty editor element at index ${index}`);
        return;
      }

      //console.log(`🔄 Processing editor element ${index + 1}/${textElements.length}: ${element.tagName}`);

      // Create split text instance for lines
      const split = new SplitType(element, {
        types: 'lines',
        tagName: 'div',
        lineClass: 'line'
      });

      this.splitTexts.push(split);
      this.elementToSplitMap.set(element, split);

      if (!split.lines || split.lines.length === 0) {
        console.warn(`⚠️ No lines created for editor element ${index}`);
        return;
      }

      //console.log(`📏 Created ${split.lines.length} lines for editor element ${index}`);

      const elementLines: HTMLElement[] = [];

      // Wrap each line in a container with overflow hidden
      split.lines.forEach((line: HTMLElement, lineIndex: number) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'line-wrapper';
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'block';
        
        // Insert wrapper before the line
        if (line.parentNode) {
          line.parentNode.insertBefore(wrapper, line);
          // Move line into wrapper
          wrapper.appendChild(line);
          
          // Set initial state - line is positioned below the visible area
          gsap.set(line, {
            yPercent: 100,
            display: 'block'
          });
          
          // Add to collections
          allLines.push(line);
          elementLines.push(line);
          
          //console.log(`✅ Wrapped editor line ${lineIndex + 1} for element ${index}`);
        }
      });

      elementLineMap.set(element, elementLines);
    });

    // Create individual ScrollTriggers for each text element
    textElements.forEach((element: HTMLElement, index: number) => {
      const split = this.elementToSplitMap.get(element);
      if (!split || !split.lines) return;

      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          //console.log(`🎯 ScrollTrigger onEnter for element ${index}`);
          gsap.killTweensOf(split.lines);
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: {
              amount: 0.3,
              from: 'start'
            }
          });
        },
        onLeave: () => {
          //console.log(`🎯 ScrollTrigger onLeave for element ${index}`);
          gsap.killTweensOf(split.lines);
          gsap.to(split.lines, {
            yPercent: 100,
            duration: 0.6,
            ease: 'power2.in',
            stagger: {
              amount: 0.2,
              from: 'end'
            }
          });
        },
        onEnterBack: () => {
          //console.log(`🎯 ScrollTrigger onEnterBack for element ${index}`);
          gsap.killTweensOf(split.lines);
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: {
              amount: 0.3,
              from: 'start'
            }
          });
        },
        onLeaveBack: () => {
          //console.log(`🎯 ScrollTrigger onLeaveBack for element ${index}`);
          gsap.killTweensOf(split.lines);
          gsap.to(split.lines, {
            yPercent: 100,
            duration: 0.6,
            ease: 'power2.in',
            stagger: {
              amount: 0.2,
              from: 'end'
            }
          });
        }
      });
    });

    // Set up ScrollTrigger for editor profile elements
    this.setupEditorProfileScrollTriggers();

    // Refresh ScrollTrigger and check initial states
    setTimeout(() => {
      ScrollTrigger.refresh();
      //console.log('🔄 ScrollTrigger refreshed');
    }, 100);

    //console.log(`🎭 Total editor split text instances: ${this.splitTexts.length}`);
    //console.log(`📏 Total lines for coordinated animation: ${allLines.length}`);
  }

  private animateAllLines(lines: HTMLElement[], direction: 'in' | 'out'): void {
    //console.log(`🎬 Animating ${lines.length} lines ${direction}`);
    
    // Kill any existing animations on these lines
    gsap.killTweensOf(lines);
    
    if (direction === 'in') {
      gsap.to(lines, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: {
          amount: 0.6, // Longer stagger for more lines
          from: 'start'
        }
      });
    } else {
      gsap.to(lines, {
        yPercent: 100,
        duration: 0.6,
        ease: 'power2.in',
        stagger: {
          amount: 0.4, // Shorter stagger for exit
          from: 'end'
        }
      });
    }
  }

  private setupEditorProfileScrollTriggers(): void {
    if (!this.editorsNoteContainer?.nativeElement) return;

    const editorImage = this.editorsNoteContainer.nativeElement.querySelector('.editor-image') as HTMLElement;
    const editorInfo = this.editorsNoteContainer.nativeElement.querySelector('.editor-info') as HTMLElement;

    if (editorImage) {
      // Create wrapper for slide-up effect similar to text
      const wrapper = document.createElement('div');
      wrapper.className = 'editor-image-wrapper';
      wrapper.style.overflow = 'hidden';
      wrapper.style.display = 'block';
      
      // Insert wrapper before the image
      if (editorImage.parentNode) {
        editorImage.parentNode.insertBefore(wrapper, editorImage);
        // Move image into wrapper
        wrapper.appendChild(editorImage);
        
        // Set initial state - image is positioned below the visible area
        gsap.set(editorImage, {
          yPercent: 100,
          display: 'block'
        });
        
        // Create ScrollTrigger for editor image
        ScrollTrigger.create({
          trigger: wrapper,
          start: "top 85%",
          end: "bottom 15%",
          onEnter: () => {
            //console.log('🎯 ScrollTrigger onEnter for editor image');
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          onLeave: () => {
            //console.log('🎯 ScrollTrigger onLeave for editor image');
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 100,
              duration: 0.6,
              ease: 'power2.in'
            });
          },
          onEnterBack: () => {
            //console.log('🎯 ScrollTrigger onEnterBack for editor image');
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          onLeaveBack: () => {
            //console.log('🎯 ScrollTrigger onLeaveBack for editor image');
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 100,
              duration: 0.6,
              ease: 'power2.in'
            });
          }
        });
        
        //console.log('✅ Created ScrollTrigger for editor image');
      }
    }

    if (editorInfo) {
      // Set initial state for editor info
      gsap.set(editorInfo, { 
        opacity: 0,
        y: 30 
      });
      
      // Create ScrollTrigger for editor info
      ScrollTrigger.create({
        trigger: editorInfo,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          //console.log('🎯 ScrollTrigger onEnter for editor info');
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        },
        onLeave: () => {
          //console.log('🎯 ScrollTrigger onLeave for editor info');
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          //console.log('🎯 ScrollTrigger onEnterBack for editor info');
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        },
        onLeaveBack: () => {
          //console.log('🎯 ScrollTrigger onLeaveBack for editor info');
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: 'power2.in'
          });
        }
      });
      
      //console.log('✅ Created ScrollTrigger for editor info');
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-editor.jpg';
  }
}
