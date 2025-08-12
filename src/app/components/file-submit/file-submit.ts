import { HttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { finalize } from "rxjs";

@Component({
    selector: 'file-submit',
    imports: [],
    templateUrl: './file-submit.html',
    styleUrl: './file-submit.scss'
})

export class FileSubmit {
    private http = inject(HttpClient);
    file: File | null = null;
    formData: FormData | null = null;

    onFileChange(files: FileList | null) {
    this.file = files?.[0] ?? null
    }

    submit() {
        if (!this.file) {
            console.log('No file selected')
            return
        }

        const form = new FormData()
        form.append('file', this.file)

        const upload$ = this.http.post('/api/file/upload', form, { reportProgress: true, observe: 'events' })
    }
}