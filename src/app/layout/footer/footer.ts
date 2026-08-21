import { Component } from '@angular/core';
import { Contact } from '../../sections/contact/contact';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

@Component({
  selector: 'app-footer',
  imports: [Contact],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly year = new Date().getFullYear();

  protected readonly columns: FooterColumn[] = [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Meet the Team', href: '#team' },
        { label: 'Careers', href: '#career' },
        { label: 'Success Stories', href: '#success-stories' },
        { label: 'Why Us', href: '#why-us' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Web Development', href: '#services' },
        { label: 'Mobile Apps', href: '#services' },
        { label: 'Cloud & DevOps', href: '#services' },
        { label: 'AI & Automation', href: '#services' },
      ],
    },
  ];
}
