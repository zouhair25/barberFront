import { CommonModule } from '@angular/common';
import { Component, OnInit, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthResponse } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { TextComponent } from '@shared/components/inputs/text/text.component';
import { VilleAutocompleteComponent } from '@shared/components/inputs/ville-autocomplete/ville-autocomplete.component';

@Component({
  selector: 'app-register-complete',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TextComponent, VilleAutocompleteComponent],
  templateUrl: './register-complete.component.html',
  standalone: true,
  styleUrl: './register-complete.component.css'
})
export class RegisterCompleteComponent implements OnInit {

  loading = signal(false);
  error = signal('');
  centrUserForm!: FormGroup;
  currentUser: Signal<AuthResponse | null>;

  constructor(private authService: AuthService,
              private router: Router,
              private fb: FormBuilder) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.centrUserForm = this.fb.group({
      adresse: ['', [Validators.required, Validators.minLength(2)]],
      shopName: ['', [Validators.required, Validators.minLength(2)]],
      latitude: ['', [ Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      longitude: ['', [ Validators.pattern(/^-?\d+(\.\d+)?$/)]],
      ville: ['', [Validators.required, Validators.minLength(2)]],
      villeId: [''],
      fix: [''],
      userId: [this.currentUser()?.userId ?? ''],
    });
  }

  register() {
    this.loading.set(true);
    this.error.set('');
    if(this.centrUserForm.valid){
      this.authService.registerComplete(this.centrUserForm.value).subscribe({
        next: res => {
          this.loading.set(false);
          if (res.role === 'BARBER') this.router.navigate(['/auth/register-complete']);
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Erreur lors de l\'inscription');
        }
      });
    }
    
  }
}
