import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
    this.http.post("http://localhost:3000/login", this.loginForm.value)
      .subscribe({
        next: (res: any) => {
          alert("✅ Login Successful");

          localStorage.setItem("token", res.token); // ✅ Store JWT token

          this.router.navigate(['/dashboard']); // route to dashboard or home page
        },
        error: (err) => alert(err.error.message)
      });
  }
}

