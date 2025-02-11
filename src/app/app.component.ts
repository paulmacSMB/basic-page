import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit{
  title = 'basic-page';
  websiteTitle: string = '';
  websiteDescription: string = '';
  websiteLogo: string = '';

  ngOnInit(): void {
    console.log("component init");
    window.addEventListener('message', (event) => {
      if (event.data.type === 'WEB_BRANDING') {
        const { title, description, logo } = event.data.payload;
        this.websiteTitle = title;
        this.websiteDescription = description;
        this.websiteLogo = logo;
      }
    });
  }
}
