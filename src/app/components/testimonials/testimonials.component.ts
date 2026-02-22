import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent implements OnInit {
  currentTestimonial = 0;
  testimonials = [
    {
      quote: "True Bread has been instrumental in deepening my understanding of faith in the modern world.",
      author: "Rachel Thompson",
      role: "Church Leader"
    },
    {
      quote: "The articles are thought-provoking and beautifully written. A must-read for every believer.",
      author: "David Chen",
      role: "Reader"
    },
    {
      quote: "This magazine bridges the gap between traditional faith and contemporary issues perfectly.",
      author: "Maria Rodriguez",
      role: "Community Leader"
    }
  ];

  ngOnInit(): void {
    this.startAutoRotate();
  }

  private startAutoRotate(): void {
    setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  nextTestimonial(): void {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }
}