import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FileSubmit } from './components/file-submit/file-submit';
import { StyledCard } from './components/styled-card/styled-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FileSubmit, StyledCard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('financial-tracker-app');
}
