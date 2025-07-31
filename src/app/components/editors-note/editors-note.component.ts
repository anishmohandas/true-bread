import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-editors-note',
  templateUrl: './editors-note.component.html',
  styleUrls: ['./editors-note.component.scss']
})
export class EditorsNoteComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorsNoteContainer', { static: false }) editorsNoteContainer!: ElementRef;

  private splitTexts: SplitType[] = [];
  private elementToSplitMap = new Map<HTMLElement, SplitType>();

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    // Initialize animations after view is ready
    setTimeout(() => {
      this.initializeSplitTextAnimations();
    }, 50);
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      trigger.kill();
    });
  }

  private cleanupAnimations(): void {
    // Clean up animations and split text instances
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

    // Clear element mapping
    this.elementToSplitMap.clear();
  }

  private initializeSplitTextAnimations(): void {
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
    // Target all text elements that should have split text animation
    const textElements = this.editorsNoteContainer.nativeElement.querySelectorAll(
      '.section-title, .paragraph, .column-subtitle, .editor-name, .editor-role'
    );

    // Collect all lines from all elements for coordinated animation
    const allLines: HTMLElement[] = [];

    textElements.forEach((element: HTMLElement, index: number) => {
      // Skip if element is empty or only contains whitespace
      if (!element.textContent?.trim()) {
        return;
      }

      // Create split text instance for lines
      const split = new SplitType(element, {
        types: 'lines',
        tagName: 'div',
        lineClass: 'line'
      });

      this.splitTexts.push(split);
      this.elementToSplitMap.set(element, split);

      if (!split.lines || split.lines.length === 0) {
        return;
      }

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
        }
      });

      // Create ScrollTrigger for each text element
      ScrollTrigger.create({
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
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

    // Refresh ScrollTrigger
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }

  private setupEditorProfileScrollTriggers(): void {
    if (!this.editorsNoteContainer?.nativeElement) return;

    const editorImage = this.editorsNoteContainer.nativeElement.querySelector('.editor-image') as HTMLElement;
    const editorInfo = this.editorsNoteContainer.nativeElement.querySelector('.editor-info') as HTMLElement;

    if (editorImage) {
      // Create wrapper for slide-up effect
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
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          onLeave: () => {
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 100,
              duration: 0.6,
              ease: 'power2.in'
            });
          },
          onEnterBack: () => {
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 0,
              duration: 0.8,
              ease: 'power2.out'
            });
          },
          onLeaveBack: () => {
            gsap.killTweensOf(editorImage);
            gsap.to(editorImage, {
              yPercent: 100,
              duration: 0.6,
              ease: 'power2.in'
            });
          }
        });
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
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        },
        onLeave: () => {
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: 'power2.in'
          });
        },
        onEnterBack: () => {
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
        },
        onLeaveBack: () => {
          gsap.killTweensOf(editorInfo);
          gsap.to(editorInfo, {
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: 'power2.in'
          });
        }
      });
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/editors/Viju-Marayamuttom.jpg';
  }
}
