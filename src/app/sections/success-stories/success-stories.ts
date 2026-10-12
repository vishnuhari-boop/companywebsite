import { Component } from '@angular/core';

interface SuccessStory {
  sector: string;
  title: string;
  result: string;
  description: string;
}

@Component({
  selector: 'app-success-stories',
  templateUrl: './success-stories.html',
  styleUrl: './success-stories.scss',
})
export class SuccessStories {
  protected readonly stories: SuccessStory[] = [
    {
      sector: 'Enterprise Web',
      title: 'Operations platform rebuild',
      result: '3x faster workflows',
      description:
        'Replaced a legacy intranet with a modern Angular platform so teams could track work, approvals and reporting in one place.',
    },
    {
      sector: 'Mobile',
      title: 'Customer app for field teams',
      result: '40% fewer support tickets',
      description:
        'Shipped a Flutter app for on-the-go service staff, with offline access and real-time status updates back to the office.',
    },
    {
      sector: 'Cloud',
      title: 'Scalable cloud migration',
      result: '99.9% uptime',
      description:
        'Moved a growing product onto Azure with CI/CD, monitoring and a safer release process that the client’s team could run themselves.',
    },
  ];
}
