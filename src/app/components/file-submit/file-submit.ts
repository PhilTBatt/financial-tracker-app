import { HttpClient, HttpEventType, HttpResponse } from "@angular/common/http";
import { Component, EventEmitter, inject, Output } from "@angular/core";
import { firstValueFrom, Subscription } from "rxjs";
import { environment } from "../../../environments/environment";

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
    exampleId = '947d9fc6-88ea-484f-8b0b-872f2e6aca48'
    @Output() uploaded = new EventEmitter<string>()
    @Output() uploadStarted = new EventEmitter<void>()

    submit(files: FileList | null) {
        this.errorMsg = null
        this.file = files?.[0] ?? null
        
        if (!this.file || !this.file.name.endsWith('.qif')) {
            this.errorMsg = `Pick a .qif file`
            return
        }

        this.uploadProgress = 0

        const form = new FormData()
        form.append('file', this.file)

        const upload$ = this.http.post('https://financial-tracker-api-6yq1.onrender.com/api/upload', form, { reportProgress: true, observe: 'events' })
        
        this.uploadSub = upload$.subscribe({
            next: event => {
                if (event.type == HttpEventType.UploadProgress && event.total) {
                    this.uploadProgress = Math.round(100 * (event.loaded / event.total))
                }

                if (event instanceof HttpResponse) {
                    const body = event.body
                    if (body && typeof body === "object" && "id" in body) {
                        const id = body.id as string
                        this.uploadStarted.emit()
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

    async showExampleData() {
        if (this.uploadSub) return

        if (!environment.production) return this.uploaded.emit('e5917b93-bee2-4571-ac7b-b168fb8d5b39')
        
        try {
            this.errorMsg = null
            
            const blob = await firstValueFrom( this.http.get('example.qif', { responseType: 'blob' }) )
            const file = new File([blob], 'example.qif', { type: 'application/octet-stream' })
            this.file = file

            this.uploadProgress = 0

            const form = new FormData()
            form.append('file', this.file)

            const upload$ = this.http.post('https://financial-tracker-api-6yq1.onrender.com/api/upload', form, { reportProgress: true, observe: 'events' })
            
            this.uploadSub = upload$.subscribe({
                next: event => {
                    if (event.type == HttpEventType.UploadProgress && event.total) {
                        this.uploadProgress = Math.round(100 * (event.loaded / event.total))
                    }

                    if (event instanceof HttpResponse) {
                        const body = event.body
                        if (body && typeof body === "object" && "id" in body) {
                            const id = body.id as string
                            this.uploadStarted.emit()
                            this.uploaded.emit(id)
                        }
                    }
                },
                error: err => {
                    console.log(err)
                    this.errorMsg = 'Example Upload failed'
                    this.reset()
                },
                complete: () => { 
                    this.uploadProgress = 100
                    this.uploadSub = null
                }
            })
        } catch (e) {
            this.errorMsg = 'Could not load example.qif';
            this.reset()
        }
    }
}