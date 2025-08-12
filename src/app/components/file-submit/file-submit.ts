import { Component } from "@angular/core";

@Component({
    selector: 'file-submit',
    imports: [],
    templateUrl: './file-submit.html',
    styleUrl: './file-submit.scss'
})

export class FileSubmit {
    file: File | null = null;

    onFileChange(files: FileList | null) {
    this.file = files?.[0] ?? null
    console.log('picked file:', this.file)
    }

    submit() {
        console.log('Submitting files:', this.file)
    }
}