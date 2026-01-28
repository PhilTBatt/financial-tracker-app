import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { DataSection } from './components/data-section/data-section';
import { UploadSection } from './components/upload-section/upload-section';
import { SystemArchitecture } from "./components/system-architecture/system-architecture";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, SystemArchitecture, DataSection, UploadSection],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('financial-tracker-app')
  @ViewChild(DataSection) dataSection!: DataSection
  diagramUploadStep = 0

  loadRecord(id: string) { this.dataSection.loadRecord(id) }

  startUploadAnimation() {
    this.diagramUploadStep = 0
    const delays = [0, 750, 1500, 2250, 3000, 3750]
    delays.forEach((ms, i) => setTimeout(() => this.diagramUploadStep = i + 1, ms))
  }
}