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
  hyperlinks: LinkData[] = [];
  isLoading: boolean = true; // Loading dictator

  constructor(private zone: NgZone) {} // Inject NgZone with a straight face

  ngOnInit(): void {
    console.log("Component initialized");

    // Fetch branding and link data
    chrome.runtime.sendMessage({ type: 'GET_BRANDING' }, (response: BrandingData) => {
      if (response) {
        this.zone.run(() => {
          this.isLoading = false;
          this.websiteTitle = response.title;
          this.websiteDescription = response.description;
        });
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_LINKS' }, (response: LinkData[]) => {
      if (response) {
        this.zone.run(() => {
          this.hyperlinks = response;
        });
      }
    });

    // Listen for updates when switching tabs
    chrome.runtime.onMessage.addListener((message: { type: string; payload: BrandingData & { links: LinkData[] } }) => {
      if (message.type === "PAGE_DATA") {
        this.zone.run(() => {
          this.websiteTitle = message.payload.title;
          this.websiteDescription = message.payload.description;
          this.hyperlinks = message.payload.links || [];
        });
      }
    });
  }
}

// Interfaces for structured data
interface BrandingData {
  title: string;
  description: string;
}

interface LinkData {
  description: string;
  name: string;
  url: string;
}

