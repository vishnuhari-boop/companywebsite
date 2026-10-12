import { Component } from '@angular/core';

import { Navbar } from './layout/navbar/navbar';
import { Footer } from './layout/footer/footer';
import { Hero } from './sections/hero/hero';
import { Services } from './sections/services/services';
import { About } from './sections/about/about';
import { WhyUs } from './sections/why-us/why-us';
import { SuccessStories } from './sections/success-stories/success-stories';
import { Technologies } from './sections/technologies/technologies';
import { Career } from './sections/career/career';

@Component({
  selector: 'app-root',
  imports: [Navbar, Hero, Services, About, WhyUs, SuccessStories, Technologies, Career, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
