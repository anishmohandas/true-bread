import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-article-upload',
  templateUrl: './admin-article-upload.component.html',
  styleUrls: ['./admin-article-upload.component.scss']
})
export class AdminArticleUploadComponent implements OnInit {
  articleForm!: FormGroup;
  isLoading = false;
  isLoadingData = false;
  successMessage = '';
  errorMessage = '';
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;

  // Edit mode
  editMode = false;
  editId: string | null = null;
  existingImageUrl = '';

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean']
    ]
  };

  categories = [
    'Faith & Spirituality',
    'Christian Living',
    'Bible Study',
    'Devotional',
    'News & Events',
    'Testimonies',
    'Youth',
    'Family',
    'Ministry',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.editMode = true;
      this.loadArticle(this.editId);
    }
  }

  initForm(): void {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      jobTitle: [''],
      worksAt: [''],
      category: ['', Validators.required],
      imageUrl: [''],
      altText: [''],
      excerpt: ['', Validators.maxLength(500)],
      content: ['', [Validators.required, Validators.minLength(50)]],
      publishDate: [new Date().toISOString().split('T')[0], Validators.required],
      readTime: [5, [Validators.required, Validators.min(1), Validators.max(120)]],
      isFeatured: [false],
      language: ['en', Validators.required]
    });
  }

  loadArticle(id: string): void {
    this.isLoadingData = true;
    this.adminService.getArticle(id).subscribe({
      next: (res) => {
        const a = res.data;
        this.existingImageUrl = a.imageUrl || '';

        // Convert plain text to HTML if needed (content stored as plain text in DB)
        const rawContent = a.content || '';
        const htmlContent = rawContent.trim().startsWith('<')
          ? rawContent
          : rawContent
              .split('\n\n')
              .map((para: string) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
              .join('');

        // Patch non-Quill fields immediately
        this.articleForm.patchValue({
          title: a.title,
          author: a.author,
          jobTitle: a.jobTitle || '',
          worksAt: a.worksAt || '',
          category: a.category,
          imageUrl: a.imageUrl || '',
          altText: a.altText || '',
          excerpt: a.excerpt || '',
          content: htmlContent,
          publishDate: a.publishDate ? a.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
          readTime: a.readTime || 5,
          isFeatured: !!a.isFeatured,
          language: a.language || 'en'
        });

        if (a.imageUrl) {
          this.imagePreviewUrl = a.imageUrl;
        }
        this.isLoadingData = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load article.';
        this.isLoadingData = false;
      }
    });
  }

  onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.articleForm.patchValue({ imageUrl: '' });
    const input = document.getElementById('imageFile') as HTMLInputElement;
    if (input) input.value = '';
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    const values = this.articleForm.value;

    Object.keys(values).forEach(key => {
      if (values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    if (this.selectedImageFile) {
      formData.append('imageFile', this.selectedImageFile);
    }

    if (this.editMode && this.editId) {
      this.adminService.updateArticle(this.editId, formData).subscribe({
        next: (response) => {
          this.successMessage = `Article "${response.data?.title}" updated successfully!`;
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/admin/dashboard/articles']), 1500);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update article.';
          this.isLoading = false;
        }
      });
    } else {
      this.adminService.createArticle(formData).subscribe({
        next: (response) => {
          this.successMessage = `Article "${response.data?.title}" created successfully!`;
          this.isLoading = false;
          this.resetForm();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create article.';
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.articleForm.reset({
      publishDate: new Date().toISOString().split('T')[0],
      readTime: 5,
      isFeatured: false,
      language: 'en'
    });
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.existingImageUrl = '';
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/articles']);
  }

  get f() { return this.articleForm.controls; }
}
