import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-publication-upload',
  templateUrl: './admin-publication-upload.component.html',
  styleUrls: ['./admin-publication-upload.component.scss']
})
export class AdminPublicationUploadComponent implements OnInit {
  publicationForm!: FormGroup;
  isLoading = false;
  isLoadingData = false;
  successMessage = '';
  errorMessage = '';
  selectedPdfFile: File | null = null;
  pdfFileName = '';

  // Edit mode
  editMode = false;
  editId: string | null = null;
  existingPdfUrl = '';

  // Auto-calculated issue number (create mode)
  nextIssueNumber: number | null = null;
  isLoadingIssueNumber = false;

  // Stepper
  currentStep = 1;
  readonly totalSteps = 3;
  showPreview = false;

  steps = [
    { label: 'Details' },
    { label: 'PDF Upload' },
    { label: 'Review' }
  ];

  stepFields: { [key: number]: string[] } = {
    1: ['title', 'month', 'year', 'publishDate'],
    2: [],
    3: []
  };

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  currentYear = new Date().getFullYear();
  years = Array.from({ length: 10 }, (_, i) => this.currentYear - 2 + i);

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // ── Stepper helpers ──────────────────────────────────────────────────────

  isStepValid(step: number): boolean {
    return (this.stepFields[step] || []).every(
      f => this.publicationForm.get(f)?.valid
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
      this.showPreview = false;
      window.scrollTo(0, 0);
    }
  }

  nextStep(): void {
    (this.stepFields[this.currentStep] || []).forEach(f =>
      this.publicationForm.get(f)?.markAsTouched()
    );
    if (this.isStepValid(this.currentStep)) {
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
      this.showPreview = false;
      window.scrollTo(0, 0);
    }
  }

  prevStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
    this.showPreview = false;
    window.scrollTo(0, 0);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  ngOnInit(): void {
    this.initForm();
    // Check for edit mode via route param
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.editMode = true;
      this.loadPublication(this.editId);
    } else {
      // Create mode: auto-calculate next issue number
      this.loadNextIssueNumber();
    }
  }

  /** Fetch all publications and set issueNumber = max(issueNumber) + 1 */
  loadNextIssueNumber(): void {
    this.isLoadingIssueNumber = true;
    this.adminService.getPublications().subscribe({
      next: (res) => {
        const publications = res.data || [];
        const maxIssue = publications.reduce((max: number, p: any) => {
          const n = parseInt(p.issueNumber) || 0;
          return n > max ? n : max;
        }, 0);
        this.nextIssueNumber = maxIssue + 1;
        this.publicationForm.patchValue({ issueNumber: this.nextIssueNumber });
        this.isLoadingIssueNumber = false;
      },
      error: () => {
        // Non-critical — leave field empty if fetch fails
        this.isLoadingIssueNumber = false;
      }
    });
  }

  initForm(): void {
    const currentMonth = this.months[new Date().getMonth()];
    this.publicationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(1000)],
      coverImage: [''],
      publishDate: [new Date().toISOString().split('T')[0], Validators.required],
      month: [currentMonth, Validators.required],
      year: [this.currentYear, Validators.required],
      issueNumber: [''],
      highlights: ['']
    });

    // Auto-generate title when month/year changes (create mode only)
    this.publicationForm.get('month')?.valueChanges.subscribe(() => {
      if (!this.editMode) this.updateTitle();
    });
    this.publicationForm.get('year')?.valueChanges.subscribe(() => {
      if (!this.editMode) this.updateTitle();
    });
  }

  loadPublication(id: string): void {
    this.isLoadingData = true;
    this.adminService.getPublication(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.existingPdfUrl = p.pdfUrl || '';
        this.pdfFileName = p.pdfUrl ? p.pdfUrl.split('/').pop() || '' : '';
        this.publicationForm.patchValue({
          title: p.title,
          description: p.description || '',
          coverImage: p.coverImage || '',
          publishDate: p.publishDate ? p.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
          month: p.month,
          year: p.year,
          issueNumber: p.issueNumber || '',
          highlights: p.highlights || ''
        });
        this.isLoadingData = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load publication.';
        this.isLoadingData = false;
      }
    });
  }

  updateTitle(): void {
    const month = this.publicationForm.get('month')?.value;
    const year = this.publicationForm.get('year')?.value;
    if (month && year) {
      const currentTitle = this.publicationForm.get('title')?.value;
      if (!currentTitle || currentTitle.match(/^True Bread Magazine/)) {
        this.publicationForm.patchValue({
          title: `True Bread Magazine - ${month} ${year}`
        });
      }
    }
  }

  get expectedPdfName(): string {
    const month = this.publicationForm.get('month')?.value;
    const year = this.publicationForm.get('year')?.value;
    if (month && year) {
      const monthShort = month.substring(0, 3);
      return `TrueBread_${monthShort}_${year}.pdf`;
    }
    return 'TrueBread_Mon_YYYY.pdf';
  }

  onPdfFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedPdfFile = input.files[0];
      this.pdfFileName = input.files[0].name;
    }
  }

  removePdf(): void {
    this.selectedPdfFile = null;
    this.pdfFileName = '';
    const input = document.getElementById('pdfFile') as HTMLInputElement;
    if (input) input.value = '';
  }

  onSubmit(): void {
    if (this.publicationForm.invalid) {
      this.publicationForm.markAllAsTouched();
      return;
    }

    // In create mode, PDF is required; in edit mode it's optional
    if (!this.editMode && !this.selectedPdfFile) {
      this.errorMessage = 'Please select a PDF file to upload.';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    const values = this.publicationForm.value;

    Object.keys(values).forEach(key => {
      if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
        formData.append(key, values[key]);
      }
    });

    if (this.selectedPdfFile) {
      formData.append('pdfFile', this.selectedPdfFile);
    }

    if (this.editMode && this.editId) {
      // Pass existing PDF URL so backend can keep it if no new file uploaded
      formData.append('existingPdfUrl', this.existingPdfUrl);
      this.adminService.updatePublication(this.editId, formData).subscribe({
        next: (response) => {
          this.successMessage = `Publication "${response.data?.title}" updated successfully!`;
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/admin/dashboard/publications']), 1500);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update publication.';
          this.isLoading = false;
        }
      });
    } else {
      this.adminService.createPublication(formData).subscribe({
        next: (response) => {
          this.successMessage = `Publication "${response.data?.title}" created successfully! PDF saved as: ${response.data?.pdfUrl}`;
          this.isLoading = false;
          setTimeout(() => this.router.navigate(['/admin/dashboard/publications']), 1500);
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create publication.';
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.publicationForm.reset({
      publishDate: new Date().toISOString().split('T')[0],
      month: this.months[new Date().getMonth()],
      year: this.currentYear
    });
    this.selectedPdfFile = null;
    this.pdfFileName = '';
    this.existingPdfUrl = '';
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard/publications']);
  }

  get f() { return this.publicationForm.controls; }
}
