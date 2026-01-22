import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FileSubmit } from './components/file-submit/file-submit';
import { StyledCard } from './components/styled-card/styled-card';
import { DataSection } from './components/data-section/data-section';
import { UploadSection } from './components/upload-section/upload-section';
import { SystemArchitecture } from "./components/system-architecture/system-architecture";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FileSubmit, StyledCard, SystemArchitecture, DataSection, UploadSection, SystemArchitecture],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('financial-tracker-app');
}
