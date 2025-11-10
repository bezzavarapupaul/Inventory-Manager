import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  // ✅ Only run in browser environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("token");

    if (!token) {
      // Instead of alert() (which SSR cannot run), use console log
      console.log("Unauthorized! Redirecting to login...");
      router.navigate(['/']);
      return false;
    }

    return true;
  }

  // When SSR executes, always return true (so server won't crash)
  return true;
};
