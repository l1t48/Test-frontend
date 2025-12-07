import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SignalRService } from '../../services/signalr.service';

declare const bootstrap: any; // bootstrap bundle must be loaded in index.html

@Component({
  selector: 'app-create-quote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="createQuoteModal" tabindex="-1" aria-labelledby="createQuoteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" (submit)="onSave($event)" novalidate>
          <div class="modal-header">
            <h5 class="modal-title" id="createQuoteModalLabel">Create a new quote</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" [disabled]="saving"></button>
          </div>

          <div class="modal-body">
            <div *ngIf="successMessage" class="alert alert-success py-2">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="alert alert-danger py-2">{{ errorMessage }}</div>

            <div class="mb-3">
              <label for="quoteText" class="form-label">Quote</label>
              <textarea id="quoteText" class="form-control" rows="3" [(ngModel)]="text" name="text" required></textarea>
            </div>

            <div class="mb-3">
              <label for="quoteAuthor" class="form-label">Author (optional)</label>
              <input id="quoteAuthor" class="form-control" [(ngModel)]="author" name="author" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" [disabled]="saving">Close <i class="fa-solid fa-xmark"></i></button>

            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <span *ngIf="!saving">Save <i class="fa-regular fa-floppy-disk"></i></span>
              <span *ngIf="saving" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateQuoteModalComponent {
  text = '';
  author = '';

  saving = false;
  errorMessage = '';
  successMessage = '';

  @Output() created = new EventEmitter<any>();

  constructor(private api: ApiService, private signalR: SignalRService) {}

  onSave(e: Event) {
    e.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.text.trim()) {
      this.errorMessage = 'Quote text is required.';
      return;
    }

    this.saving = true;

    const payload = {
      text: this.text.trim(),
      author: this.author?.trim() || null
    };

    this.api.createQuote(payload).subscribe({
      next: res => {
        this.created.emit(res);
        this.successMessage = 'Quote created successfully.';
        this.saving = false;
        this.text = '';
        this.author = '';
        this.signalR.refreshQuotes();
        // hide modal after short delay so user sees the success message
        setTimeout(() => {
          const el = document.getElementById('createQuoteModal');
          if (el) {
            const inst = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
            inst.hide();
          }
        }, 500);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        if (err.error?.message) this.errorMessage = err.error.message;
        else if (typeof err.error === 'string') this.errorMessage = err.error;
        else this.errorMessage = 'Failed to create quote.';
      }
    });
  }
}
