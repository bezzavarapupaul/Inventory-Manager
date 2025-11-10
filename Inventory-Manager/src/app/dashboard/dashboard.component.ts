import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  inventoryForm = new FormGroup({
    name: new FormControl('', Validators.required),
    quantity: new FormControl('', Validators.required),
    price: new FormControl('', Validators.required),
  });

  items: any[] = [];
  editMode = false;
  selectedId: number | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: any  // ✅ Needed to avoid SSR crash
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInventory();   // ✅ Only run when browser renders
    }
  }

  addInventory() {
    if (!this.inventoryForm.valid) {
      alert("Please fill all fields");
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;  // ✅ Avoid SSR access

    const payload = {
      name: this.inventoryForm.value.name,
      quantity: Number(this.inventoryForm.value.quantity),
      price: Number(this.inventoryForm.value.price),
      user_id: Number(localStorage.getItem("userId"))  // ✅ Read only in browser
    };

    console.log("Payload being sent:", payload);

    this.http.post("https://inventory-manager-k10i.onrender.com/inventory", payload)
      .subscribe({
        next: () => {
          alert("Item Added ✅");
          this.inventoryForm.reset();
          this.loadInventory();
        },
        error: (err) => {
          console.error("Error adding item:", err);
          alert("Could not add item ❌");
        }
      });
  }

  loadInventory() {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ Prevent SSR crash

    const userId = Number(localStorage.getItem("userId"));

    this.http.get<any[]>(`https://inventory-manager-k10i.onrender.com/inventory/${userId}`)
      .subscribe(data => {
        this.items = data;
      });
  }

  editItem(item: any) {
    this.editMode = true;
    this.selectedId = item.id;

    this.inventoryForm.setValue({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    });
  }

  updateItem() {
    this.http.put(`https://inventory-manager-k10i.onrender.com/${this.selectedId}`, this.inventoryForm.value)
      .subscribe(() => {
        alert("Item Updated ✅");
        this.inventoryForm.reset();
        this.editMode = false;
        this.loadInventory();
      });
  }

  deleteItem(id: number) {
    this.http.delete(`https://inventory-manager-k10i.onrender.com/inventory/${id}`)
      .subscribe(() => {
        alert("Item Deleted ❌");
        this.loadInventory();
      });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
    this.router.navigate(['/login']);
  }
}
