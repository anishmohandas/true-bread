import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-your-component',
  template: '<div></div>',
  styleUrls: []
})
export class YourComponent implements OnInit, AfterViewInit {
  ngOnInit() {
    (window as any).THREE = THREE;
    
    (window as any).DFLIP.defaults = {
      ...((window as any).DFLIP.defaults || {}),
      webgl: true,
      pdfjsSrc: '/assets/dflip/js/libs/pdf.min.js',
      pdfjsWorkerSrc: '/assets/dflip/js/libs/pdf.worker.min.js',
      threejsSrc: '/assets/dflip/js/libs/three.min.js',
      mockupjsSrc: '/assets/dflip/js/libs/mockup.min.js',
      soundFile: '/assets/dflip/sound/turn2.mp3',
      imagesLocation: '/assets/dflip/images',
      imageResourcesPath: '/assets/dflip/images/pdfjs/',
      cMapUrl: '/assets/dflip/js/libs/cmaps/',
      pdfjsCompatibilitySrc: '/assets/dflip/js/libs/compatibility.js'
    };
  }

  ngAfterViewInit() {
    // Initialize flipbook after view is ready
    setTimeout(() => {
      this.initializeFlipbook();
    }, 100);
  }

  private initializeFlipbook() {
    // Your flipbook initialization code here
  }
}
