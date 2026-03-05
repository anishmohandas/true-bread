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

  // Stepper
  currentStep = 1;
  readonly totalSteps = 4;

  steps = [
    { label: 'Basic Info' },
    { label: 'Content' },
    { label: 'Settings' },
    { label: 'Review' }
  ];

  /** Fields that must be valid before leaving each step */
  stepFields: { [key: number]: string[] } = {
    1: ['title', 'author', 'category'],
    2: ['content'],
    3: ['publishDate'],
    4: []
  };

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

  // ── Stepper helpers ──────────────────────────────────────────────────────

  isStepValid(step: number): boolean {
    return (this.stepFields[step] || []).every(
      f => this.articleForm.get(f)?.valid
    );
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }

  canGoToStep(step: number): boolean {
    return step < this.currentStep || this.isStepCompleted(step - 1);
  }

  goToStep(step: number): void {
    if (this.canGoToStep(step)) {
      this.currentStep = step;
      window.scrollTo(0, 0);
    }
  }

  nextStep(): void {
    (this.stepFields[this.currentStep] || []).forEach(f =>
      this.articleForm.get(f)?.markAsTouched()
    );
    if (this.isStepValid(this.currentStep)) {
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
    window.scrollTo(0, 0);
  }

  /** Open article preview in a new tab */
  openPreview(): void {
    if (this.editMode && this.editId) {
      // Edit mode: open the live article page
      window.open('/articles/' + this.editId, '_blank');
      return;
    }

    // Create mode: store form data in sessionStorage and open preview route.
    // NOTE: Never store base64 imagePreviewUrl — it can be several MB and
    // will exceed the sessionStorage quota. Use the URL field value only.
    const v = this.articleForm.value;
    const previewData = {
      title: v.title || '',
      author: v.author || '',
      category: v.category || '',
      publishDate: v.publishDate || new Date().toISOString().split('T')[0],
      readTime: v.readTime || 5,
      content: v.content || '',
      imageUrl: v.imageUrl || '',   // URL string only — no base64
      altText: v.altText || '',
      excerpt: v.excerpt || '',
      language: v.language || 'en',
      isFeatured: !!v.isFeatured
    };

    const storeAndOpen = (data: typeof previewData) => {
      sessionStorage.setItem('admin_article_preview', JSON.stringify(data));
      window.open('/admin/preview/article', '_blank');
    };

    try {
      storeAndOpen(previewData);
    } catch {
      // Content too large — truncate to first 15 000 chars and retry
      try {
        storeAndOpen({ ...previewData, content: previewData.content.substring(0, 15000) });
      } catch {
        // Last resort — open without content body
        storeAndOpen({ ...previewData, content: '' });
      }
    }
  }

  get previewContent(): string {
    return this.articleForm.get('content')?.value || '';
  }

  /** Strip HTML tags and decode entities for the review summary */
  get contentPlainText(): string {
    const html = this.previewContent;
    if (!html) return '';
    // Use a temporary div to strip tags (browser DOM)
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  }

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
      category: ['', Validators.required],
      excerpt: ['', Validators.maxLength(1000)],
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

        // Ensure the article's category is in the dropdown options
        if (a.category && !this.categories.includes(a.category)) {
          this.categories = [...this.categories, a.category];
        }

        // Convert plain text to HTML if needed
        const rawContent = a.content || '';
        const htmlContent = rawContent.trim().startsWith('<')
          ? rawContent
          : rawContent
              .split('\n\n')
              .map((para: string) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
              .join('');

        this.articleForm.patchValue({
          title: a.title,
          author: a.author,
          category: a.category,
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
    const input = document.getElementById('imageFile') as HTMLInputElement;
    if (input) input.value = '';
  }

  onSubmit(): void {
    console.log('[AdminArticleUpload] onSubmit fired', {
      currentStep: this.currentStep,
      invalid: this.articleForm.invalid,
      isLoading: this.isLoading,
      isLoadingData: this.isLoadingData
    });

    if (this.articleForm.invalid) {
      const invalidControls = Object.keys(this.articleForm.controls)
        .filter((key) => this.articleForm.get(key)?.invalid)
        .map((key) => ({
          control: key,
          errors: this.articleForm.get(key)?.errors,
          value: this.articleForm.get(key)?.value
        }));

      console.warn('[AdminArticleUpload] form invalid', {
        formErrors: this.articleForm.errors,
        invalidControls,
        formValue: this.articleForm.value
      });

      this.articleForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    const values = this.articleForm.value;

    const normalizeArticleHtml = (html: string): string => {
      if (!html) return '';

      // Preserve HTML structure, normalize text spacing artifacts from editor paste/import.
      return html
        .replace(/\t+/g, ' ')          // tabs -> space
        .replace(/&nbsp;/g, ' ')       // non-breaking spaces -> normal space
        .replace(/ {2,}/g, ' ')        // collapse repeated spaces
        .replace(/>\s+</g, '><')       // avoid accidental inter-tag gaps
        .trim();
    };

    // Auto-derive image metadata (UI fields removed)
    const derivedAltText = (values.title && String(values.title).trim().length > 0)
      ? `Illustration for ${String(values.title).trim()}`
      : 'Article illustration';

    // If a new image is uploaded, backend will generate the final imageUrl.
    // If editing and no new upload, preserve existing image URL.
    const derivedImageUrl = this.selectedImageFile
      ? ''
      : (this.existingImageUrl || '');

    // Append only normalized values expected by backend
    const normalizedValues: any = {
      title: values.title,
      author: values.author,
      category: values.category,
      excerpt: values.excerpt || '',
      content: normalizeArticleHtml(values.content || ''),
      publishDate: values.publishDate,
      readTime: values.readTime,
      isFeatured: values.isFeatured,
      language: values.language || 'en',
      imageUrl: derivedImageUrl,
      altText: derivedAltText
    };

    Object.keys(normalizedValues).forEach(key => {
      const v = normalizedValues[key];
      if (v !== null && v !== undefined) {
        formData.append(key, v);
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
          // Navigate away after a short delay so the success message is visible
          setTimeout(() => this.router.navigate(['/admin/dashboard/articles']), 1500);
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
