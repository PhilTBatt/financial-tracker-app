import { Component } from "@angular/core";

@Component({
    selector: 'file-submit',
    imports: [],
    templateUrl: './file-submit.html',
    styleUrl: './file-submit.scss'
})

export class FileSubmit {
    submit() {
        console.log('File Submitted')
    }
}