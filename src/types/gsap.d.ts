import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Flip } from 'gsap/Flip';
import { CustomEase } from 'gsap/CustomEase';

/// <reference types="gsap" />

declare module 'gsap' {
  interface GSAPStatic {
    ScrollTrigger: typeof ScrollTrigger;
    ScrollToPlugin: typeof ScrollToPlugin;
    Flip: typeof Flip;
    CustomEase: typeof CustomEase;
  }
}

declare global {
  interface Window {
    gsap: GSAP;
  }
}
