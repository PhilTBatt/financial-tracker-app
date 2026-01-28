import { Component, EventEmitter, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StyledCard } from "../styled-card/styled-card";
import { Metrics, Transaction, TransactionRecord } from "../../types/data-types";
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from "chart.js";

@Component({
    selector: 'data-section',
    imports: [StyledCard, BaseChartDirective],
    templateUrl: './data-section.html',
    styleUrl: './data-section.scss'
})

export class DataSection {
    metrics: Metrics | null = null
    transactions: Transaction[] = []
    recordId: string | null = null
    createdAt: string | null = null
    private readonly apiUrl = 'http://localhost:8080/api/transactions'
    private loadAttempts = 0
    @Output() dataLoaded = new EventEmitter<void>()

    lineType: 'line' = 'line'
    lineData: ChartConfiguration<"line">["data"] = { labels: [], datasets: [] }
    lineOptions: ChartConfiguration<'line'>['options'] = { 
        plugins: { legend: { display: false } },
        scales: { x: { ticks: { maxTicksLimit: 6 } }, y: { ticks: { maxTicksLimit: 6 } } },
        responsive: true,
        maintainAspectRatio: false
    }

    donutType: "doughnut" = "doughnut"
    donutData: ChartConfiguration<"doughnut">["data"] = { labels: [], datasets: [] }
    donutOptions: ChartConfiguration<'doughnut'>['options'] = { 
        plugins: { legend: { position: 'right', labels: { padding: 19, boxWidth: 12 } } },
        layout: { padding: {  right: 0 } },
        maintainAspectRatio: false,
        cutout: '65%'
    }

    constructor(private http: HttpClient) {}

    public loadRecord(id: string) {
        this.http.get<TransactionRecord>(`${this.apiUrl}/${id}`).subscribe({
            next: data => {
                this.recordId = data.id
                this.createdAt = data.createdAt
                this.metrics = data.metrics
                this.transactions = data.transactions
                this.loadAttempts = 0
                this.buildMonthlyLine()
                this.buildDonutChart()
                console.log('DataSection: about to emit loaded')
                console.log(
  'DataSection: observers:',
  (this.dataLoaded as any).observers?.length,
  'observed:',
  (this.dataLoaded as any).observed
);
                this.dataLoaded.emit()
            },
            error: err => {
                if (err?.status === 404 && this.loadAttempts < 2) {
                    this.loadAttempts += 1
                    setTimeout(() => this.loadRecord(id), 4000)
                    return
                }
                this.recordId = null
                this.metrics = null
                this.transactions = []
                this.createdAt = null
            }
        })
    }

    private buildMonthlyLine() {
        const history = this.metrics?.monthlySpendHistory ?? [];

        const labels = history.map(p =>
            new Date(p.period).toLocaleString('en-GB', { month: 'short', year: '2-digit' })
        )

        const values = history.map(p => p.amount / 100)

        this.lineData = {
            labels,
            datasets: [ { data: values, tension: 0.35, fill: true } ]
        }
    }

    private buildDonutChart() {
        const totals = this.metrics?.categorySpendTotals ?? {}
        
        const entries = Object.entries(totals)
            .filter( ([, pennies]) => typeof pennies === "number" && pennies > 0 )
            .sort( (a, b) => b[1] - a[1] )

        const labels = entries.map(([cat]) => cat)
        const values = entries.map(([, pennies]) => pennies / 100)

        this.donutData = {
            labels,
            datasets: [{ data: values }]
        }
    }
}