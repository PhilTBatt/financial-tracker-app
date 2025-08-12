import { HttpClient, HttpEventType } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { finalize, Subscription } from "rxjs";

@Component({
    selector: 'file-submit',
    imports: [],
    templateUrl: './file-submit.html',
    styleUrl: './file-submit.scss'
})

export class FileSubmit {
    private http = inject(HttpClient)
    file: File | null = null
    formData: FormData | null = null
    uploadProgress: number | null = null
    uploadSub: Subscription | null = null
    errorMsg: string | null = null

    onFileChange(files: FileList | null) {
        this.file = files?.[0] ?? null
    }

    submit() {
        if (!this.file) {
            console.log('No file selected')
            return
        }

        this.uploadProgress = 0

        const form = new FormData()
        form.append('file', this.file)

        const upload$ = this.http.post('/api/file/upload', form, { reportProgress: true, observe: 'events' })
        
        this.uploadSub = upload$.subscribe({
            next: event =>{
                if (event.type == HttpEventType.UploadProgress && event.total) {
                    this.uploadProgress = Math.round(100 * (event.loaded / event.total))
                }
            },
            complete: () => { 
                this.uploadProgress = 100
                this.uploadSub = null
            },
            error: () => {
                this.errorMsg = 'Upload failed'
                this.reset()
            }
        })

    }

    cancelUpload() {
        this.uploadSub?.unsubscribe()
        this.reset()
    }

    reset() {
        this.uploadProgress = null;
        this.uploadSub = null;
    }
}