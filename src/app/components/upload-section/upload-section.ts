import { Component } from "@angular/core";
import { StyledCard } from "../styled-card/styled-card";
import { FileSubmit } from "../file-submit/file-submit";

@Component({
    selector: 'upload-section',
    imports: [StyledCard, FileSubmit],
    templateUrl: './upload-section.html',
    styleUrl: './upload-section.scss'
})

export class UploadSection {
    
}