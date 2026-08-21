import { Component, HostListener, signal } from '@angular/core';

interface NavChild {
  label: string;
  fragment: string;
}

interface NavItem {
  label: string;
  fragment?: string;
  children?: NavChild[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  protected readonly isScrolled = signal(false);
  protected readonly isMenuOpen = signal(false);
  protected readonly openDropdown = signal<string | null>(null);

  protected readonly links: NavItem[] = [
    { label: 'Services', fragment: 'services' },
    { label: 'Solutions', fragment: 'why-us' },
    {
      label: 'About Us',
      children: [
        { label: 'About Us', fragment: 'about' },
        { label: 'Meet the Team', fragment: 'team' },
        { label: 'Careers', fragment: 'career' },
      ],
    },
    { label: 'Work', fragment: 'technologies' },
    { label: 'Success Stories', fragment: 'success-stories' },
    { label: 'Contact', fragment: 'contact' },
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 12);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openDropdown.set(null);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
    this.openDropdown.set(null);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.openDropdown.set(null);
  }

  toggleDropdown(label: string, event: Event): void {
    event.stopPropagation();
    this.openDropdown.update((current) => (current === label ? null : label));
  }

  isDropdownOpen(label: string): boolean {
    return this.openDropdown() === label;
  }
}
