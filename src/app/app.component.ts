import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'basic-page';
  websiteTitle: string = '';
  websiteDescription: string = '';
  links: { url: string; name: string; description: string }[] = []; //  Store links
  isLoading: boolean = true;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    console.log("Component initialized");

    // Get initial branding data
    chrome.runtime.sendMessage({ type: 'GET_BRANDING' }, (response: BrandingData) => {
      if (response) {
        this.zone.run(() => {
          this.isLoading = false;
          this.websiteTitle = response.title;
          this.websiteDescription = response.description;
          this.links = response.links || []; // ✅ Store links in UI
        });
      }
    });

    //  Listen for branding updates when clicking a hyperlink
    chrome.runtime.onMessage.addListener((message: { type: string; payload: BrandingData }) => {
      if (message.type === "WEB_BRANDING") {
        this.zone.run(() => {
          this.websiteTitle = message.payload.title;
          this.websiteDescription = message.payload.description;
          this.links = message.payload.links || []; // ✅ Update links in UI
        });
      }
    });
  }

  navigateToLink(url: string): void {
    chrome.runtime.sendMessage({ type: "NAVIGATE_TO_LINK" });
  }
}

interface BrandingData {
  title: string;
  description: string;
  links: { url: string; name: string; description: string }[];
}


