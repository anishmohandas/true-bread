import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Editorial } from '../../shared/interfaces/editorial.interface';
import { EditorialService } from '../../services/editorial.service';

@Component({
  selector: 'app-editorial',
  templateUrl: './editorial.component.html',
  styleUrls: ['./editorial.component.scss']
})
export class EditorialComponent implements OnInit {
  editorial: Editorial | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private editorialService: EditorialService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.editorialService.getEditorialById(id).subscribe({
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
          console.log(this.editorial, response.data);
        },
        error: (error) => {
          console.error('Error fetching editorial:', error);
          this.error = true;
          this.loading = false;
        }
      });
    });
  }

  getFormattedContent(): string[] {
    if (!this.editorial?.content) return [];
    
    // First clean up the content by normalizing line breaks
    const cleanContent = this.editorial.content
      .replace(/\\n/g, '\n')  // Replace escaped newlines
      .replace(/\r\n/g, '\n') // Normalize Windows line endings
      .replace(/\r/g, '\n')   // Normalize Mac line endings
      .trim();

    // Split into paragraphs and process each one
    return cleanContent
      .split('\n')
      .filter(paragraph => paragraph.trim() !== '')
      .map(paragraph => {
        const isMalayalam = this.editorial?.language === 'ml';
        
        // Clean up any remaining special characters
        paragraph = paragraph
          .replace(/\\"/g, '"')
          .replace(/\\/g, '')
          .trim();

        // Apply specific formatting based on content type
        if (/^\d+\.\s/.test(paragraph)) {
          return `<li class="list-decimal mb-4 ${isMalayalam ? 'malayalam-text' : ''}">${paragraph.replace(/^\d+\.\s/, '')}</li>`;
        }
        
        if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
          return `<blockquote class="editorial-quote ${isMalayalam ? 'malayalam-text' : ''}">${paragraph}</blockquote>`;
        }
        
        if (!isMalayalam && paragraph.length < 100 && paragraph.endsWith(':')) {
          return `<h3 class="editorial-subheading">${paragraph}</h3>`;
        }
        
        return `<p class="${isMalayalam ? 'malayalam-text' : ''}">${paragraph}</p>`;
      });
  }
}






