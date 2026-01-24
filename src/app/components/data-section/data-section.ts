import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StyledCard } from "../styled-card/styled-card";
import { Metrics, Transaction, TransactionRecord } from "../../types/data-types";

@Component({
    selector: 'data-section',
    imports: [StyledCard],
    templateUrl: './data-section.html',
    styleUrl: './data-section.scss'
})

export class DataSection {
    metrics: Metrics | null = null;
    transactions: Transaction[] = [];
    recordId: string | null = null;
    createdAt: string | null = null;
    private readonly apiUrl = 'http://localhost:8080/api/transactions'

    constructor(private http: HttpClient) {}

    public loadRecord(id: string) {
        this.http.get<TransactionRecord>(`${this.apiUrl}/${id}`).subscribe({
            next: data => {
                this.recordId = data.id
                this.createdAt = data.createdAt
                this.metrics = data.metrics
                this.transactions = data.transactions
            },
            error: err => {
                console.error('Failed to load transactions', err)
                this.recordId = null
                this.metrics = null
                this.transactions = []
                this.createdAt = null
            }
        })
    }
}