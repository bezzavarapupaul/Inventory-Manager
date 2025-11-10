import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  // ✅ Replace localhost URL with your deployed backend URL
  private API_URL = "https://inventory-manager-k10i.onrender.com";

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.loginForm.valid) {
      alert("Enter valid credentials");
      return;
    }

    this.http.post<any>(`${this.API_URL}/login`, this.loginForm.value)
      .subscribe({
        next: (response) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("userId", response.userId);

          alert("Login successful ✅");
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          if (err.status === 404) alert("User not found ❌");
          else alert("Invalid email or password ❌");
        }
      });
  }
}
