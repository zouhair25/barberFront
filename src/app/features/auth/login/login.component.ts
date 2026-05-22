import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TextComponent } from '@shared/components/inputs/text/text.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, TextComponent, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loading = signal(false);
  error = signal('');
  loginForm! : FormGroup;
  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['',[Validators.required,Validators.email]],
      password: ['',[Validators.required,Validators.minLength(6)]],
     
    })
  }

  login() {
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.loginForm.value).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.role === 'BARBER' && res.userCentreSoins){
          this.router.navigate(['/barber/dashboard']);
        }else if(res.role === 'BARBER' && !res.userCentreSoins) {
          this.router.navigate(['/auth/register-complete']);
        }
        else this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }
}
