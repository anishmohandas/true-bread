import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.scss']
})
export class PdfPreviewComponent implements OnInit {
  pdfId: string = 'latest-issue';
  cardCount: number = 5;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get PDF ID from route parameters if available
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pdfId = params['id'];
      }
    });
    
    // Get card count from query parameters if available
    this.route.queryParams.subscribe(params => {
      if (params['count']) {
        this.cardCount = parseInt(params['count'], 10) || 5;
      }
    });
  }
}
