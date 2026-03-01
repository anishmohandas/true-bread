import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EditorialService } from '../../services/editorial.service';
import { Editorial } from 'src/app/shared/interfaces/editorial.interface';

@Component({
  standalone: false,
  selector: 'app-latest-editorial',
  templateUrl: './latest-editorial.component.html',
  styleUrls: ['./latest-editorial.component.scss']
})
export class LatestEditorialComponent implements OnInit {
  editorial: Editorial | null = null;
  loading = true;
  error = false;

  constructor(
    private editorialService: EditorialService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('✍️ Latest Editorial component ngOnInit called');
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
        console.log(this.editorial, response.data);
      },
      error: (error) => {
        console.error('Error fetching latest editorial:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  navigateToEditorial(id: string) {
    console.log('Navigating to editorial with ID:', id);
    if (id) {
      this.router.navigate(['/editorial', id]).then(() => {
        console.log('Navigation successful');
      }).catch(error => {
        console.error('Navigation failed:', error);
      });
    } else {
      console.error('Editorial ID is missing');
    }
  }
}





