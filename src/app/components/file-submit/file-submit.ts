import { HttpClient, HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, EventEmitter, inject, Output } from "@angular/core";
import { Subscription } from "rxjs";

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
    @Output() uploaded = new EventEmitter<string>()
    exampleId = '1a5fc7be-aed1-4c96-893c-ec3a4cb7697c'

    submit(files: FileList | null, input?: HTMLInputElement) {
        this.errorMsg = null
        this.file = files?.[0] ?? null
        
        if (!this.file || !this.file.name.endsWith('.qif')) {
            this.errorMsg = `Pick a .qif file`
            return
        }

        this.uploadProgress = 0

        const form = new FormData()
        form.append('file', this.file)

        const upload$ = this.http.post('http://localhost:8080/api/upload', form, { reportProgress: true, observe: 'events' })
        
        this.uploadSub = upload$.subscribe({
            next: event => {
                if (event.type == HttpEventType.UploadProgress && event.total) {
                    this.uploadProgress = Math.round(100 * (event.loaded / event.total))
                }

                if (event instanceof HttpResponse) {
                    const body = event.body;
                    if (body && typeof body === "object" && "id" in body) {
                        const id = body.id as string;
                        this.uploaded.emit(id)
                    }
                }
            },
            error: err => {
                console.log(err)
                this.errorMsg = 'Upload failed'
                this.reset()
            },
            complete: () => { 
                this.uploadProgress = 100
                this.uploadSub = null
            }
        })

    }

    cancelUpload() {
        this.uploadSub?.unsubscribe()
        this.reset()
    }

    reset() {
        this.file = null;
        this.uploadProgress = null;
        this.uploadSub = null;
    }

    showExampleData() {
        this.uploaded.emit(this.exampleId)
    }
}