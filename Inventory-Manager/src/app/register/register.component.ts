import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private http: HttpClient,private router: Router) {}

  submitForm() {
    this.http.post("http://localhost:3000/register", this.registerForm.value)
      .subscribe({
        next: (res) => {
          alert("✅ Registered Successfully");
          this.router.navigate(['/login']);  // redirect to login
        },
        error: (err) => alert(err.error.message)
      });
  }
}
