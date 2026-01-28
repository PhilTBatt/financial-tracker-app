import { Component, EventEmitter, Output } from "@angular/core";
import { FileSubmit } from "../file-submit/file-submit";

@Component({
    selector: 'upload-section',
    imports: [FileSubmit],
    templateUrl: './upload-section.html',
    styleUrl: './upload-section.scss'
})

export class UploadSection {
    @Output() uploaded = new EventEmitter<string>()
    @Output() uploadStarted = new EventEmitter<void>()
}