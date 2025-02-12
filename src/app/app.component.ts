import { Component, OnInit, NgZone } from '@angular/core';
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
  isLoading: boolean = true; // loading indicator
 
  constructor(private zone: NgZone) {} // Inject Inject Inject
  ngOnInit(): void {
    console.log("Component initialized");

    chrome.runtime.sendMessage({ type: 'GET_BRANDING' }, (response: BrandingData) => {
      if (response) {
        this.zone.run(() => {
        this.isLoading = false;
        this.websiteTitle = response.title;
        this.websiteDescription = response.description;
    });
  }
    });
    // Listen for updates when switching tabs
  chrome.runtime.onMessage.addListener((message: { type: string; payload: { title: string; description: string; }; }) => {
    if (message.type === "WEB_BRANDING") {
      this.zone.run(() => {
        this.websiteTitle = message.payload.title;
        this.websiteDescription = message.payload.description;
      });
    }
  });
  }
}

interface BrandingData {
  title: string;
  description: string;
}
