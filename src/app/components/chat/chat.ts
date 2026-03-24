import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ChatMessage {
    role: 'user' | 'assistant'
    text: string
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.html',
    styleUrl: './chat.scss'
})

export class Chat {
    messages: ChatMessage[] = []
    input: string = ''
    loading: boolean = false
    sessionId: string = ''
    private apiUrl = 'https://financial-tracker-api-6yq1.onrender.com/api/ai/ask';

    constructor(private http: HttpClient) {}

    send() {
        if (!this.input.trim() || this.loading) return

        const userMessage = this.input.trim()
        this.input = ''
        this.messages.push({ role: 'user', text: userMessage })
        this.loading = false

        this.http.post<{ answer: string, sessionId: string }>(this.apiUrl, { message: userMessage, sessionId: this.sessionId })
        .subscribe({
            next: (response) => {
                this.sessionId = response.sessionId
                this.messages.push({ role: 'assistant', text: response.answer })
                this.loading = false
            },
            error: () => {
                this.messages.push({ role: 'assistant', text: 'Something went wrong, please try again.' })
                this.loading = false
            }
        })
    }

    onEnter(event: KeyboardEvent) {
        if (event.key === 'Enter') this.send()
    }
}