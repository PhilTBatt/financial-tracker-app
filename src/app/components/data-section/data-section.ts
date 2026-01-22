import { Component, OnInit } from "@angular/core";
import { StyledCard } from "../styled-card/styled-card";
import { HttpClient } from "@angular/common/http";

export interface TransactionItem {
  date: string;
  amount: number;
  memo: string;
  payee: string;
}

export interface TransactionList {
  id: string;
  transactions: TransactionItem[];
  createdAt: string;
}

@Component({
    selector: 'data-section',
    imports: [StyledCard],
    templateUrl: './data-section.html',
    styleUrl: './data-section.scss'
})

export class DataSection implements OnInit {
    transactions: TransactionItem[] = []
    listId: string | null = null
    createdAt: string | null = null

    private readonly apiUrl = 'http://localhost:8080/api/transactions'
    private readonly listIdToFetch = 'default'

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        this.loadTransactions()
    }

    private loadTransactions(): void {
        this.http.get<TransactionList>(`${this.apiUrl}/${this.listIdToFetch}`).subscribe({
        next: (data) => {
            this.listId = data.id
            this.createdAt = data.createdAt
            this.transactions = data.transactions ?? []
        },
        error: (err) => {
            console.error('Failed to load transactions', err)
            this.transactions = []
        }
        })
    }
}