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
  currentSection: string | undefined;
  
  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    console.log("Component initialized");

    chrome.runtime.sendMessage({ type: "POPUP_OPENED" });

    // Get initial branding data
    chrome.runtime.sendMessage({ type: 'GET_BRANDING' }, (response: BrandingData) => {
      if (response) {
        this.zone.run(() => {
          this.isLoading = false;
          this.websiteTitle = response.title;
          this.websiteDescription = response.description;
          this.links = response.links || []; // ✅ Store links in UI
          console.log("Initial Links:", this.links);
        });
      }
    });

    //  Listen for branding updates when clicking a hyperlink
    chrome.runtime.onMessage.addListener((message: { type: string; payload: BrandingData }) => {
      if (message.type === "WEB_BRANDING") {
        this.zone.run(() => {
          console.log("Updated Links/ after Initial:", message.payload.links);
          this.websiteTitle = message.payload.title;
          this.websiteDescription = message.payload.description;
          this.links = message.payload.links || []; // ✅ Update links in UI
        });
      }
    });
  }
 
  navigateToLink(url: string, event: Event): void {
    event.preventDefault(); // 🚫 Prevent default browser behavior
    event.stopPropagation(); // 🚫 Stop event from bubbling up
  
    console.log("🔗 Button clicked, navigating to:", url);
    this.websiteTitle = "Loading...";
    this.links = []; // Reset the links
    chrome.runtime.sendMessage({ type: "EXTENSION_NAVIGATE", url }, (response: any) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error sending navigation request:", chrome.runtime.lastError.message);
      } else {
        console.log("✅ Navigation request sent!", response);
      }
    });
  
    // 🔹 Update extension UI state (optional, if UI needs to reflect change)
    this.zone.run(() => {
      this.currentSection = url; // Assume `currentSection` is bound in the UI
    });
  }
  
}

interface BrandingData {
  title: string;
  description: string;
  links: { url: string; name: string; description: string }[];
}


