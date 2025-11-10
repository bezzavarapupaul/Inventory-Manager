import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private http: HttpClient,private router: Router) {}

  login() {
  if (!this.loginForm.valid) {
    alert("Enter valid credentials");
    return;
  }

  this.http.post<any>("https://inventory-manager-k10i.onrender.com/login", this.loginForm.value)
    .subscribe({
      next: (response: any) => {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.userId);  // ✅ SAVE USER ID

        alert("Login successful ✅");
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        alert("Invalid email or password ❌");
      }
    });
}
}

