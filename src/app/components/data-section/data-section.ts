import { Component, EventEmitter, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StyledCard } from "../styled-card/styled-card";
import { Metrics, Transaction, TransactionRecord } from "../../types/data-types";
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from "chart.js";
import { KeyValuePipe } from "@angular/common";

@Component({
    selector: 'data-section',
    imports: [StyledCard, BaseChartDirective, KeyValuePipe],
    templateUrl: './data-section.html',
    styleUrl: './data-section.scss'
})

export class DataSection {
    metrics: Metrics | null = null
    transactions: Transaction[] = []
    recordId: string | null = null
    createdAt: string | null = null
    private readonly apiUrl = 'https://financial-tracker-api-6yq1.onrender.com/api/transactions'
    private loadAttempts = 0
    @Output() dataLoaded = new EventEmitter<void>()
    descValue = (a: any, b: any) => b.value - a.value

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
        plugins: { legend: { position: 'right', labels: { padding: 8, boxWidth: 10, boxHeight: 10 } } },
        layout: { padding: {  right: 0 } },
        maintainAspectRatio: false,
        cutout: '65%'
    }

    inOutType: "bar" = "bar"
    inOutData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    inOutOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: true } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: false, ticks: { maxTicksLimit: 6 } }, y: { stacked: false, ticks: { maxTicksLimit: 6 } } }
    }

    catStackType: "bar" = "bar"
    catStackData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    catStackOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: true } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {  x: { stacked: true, ticks: { maxTicksLimit: 6 } }, y: { stacked: true, ticks: { maxTicksLimit: 6 } } }
    }

    weekdayType: "bar" = "bar";
    weekdayData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    weekdayOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 } } },
    }

    sizeType: "bar" = "bar";
    sizeData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    sizeOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 } } },
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
                this.buildMonthlyOutLine()
                this.buildDonutChart()
                this.buildMonthlyInOutChart()
                this.buildMonthlyCategoriesSpendChart()
                this.buildSpendingByWeekdayChart()
                this.buildSpendingBySizeChart()
                this.dataLoaded.emit()
            },
            error: err => {
                if (err?.status === 404 && this.loadAttempts < 4) {
                    this.loadAttempts += 1
                    setTimeout(() => this.loadRecord(id), 4500)
                    return
                }
                this.recordId = null
                this.metrics = null
                this.transactions = []
                this.createdAt = null
            }
        })
    }

    private buildMonthlyOutLine() {
        const monthly = this.metrics?.monthly
        if (!monthly) {
            this.lineData = { labels: [], datasets: [] }
            return
        }

        const labels = monthly.labels.map(ym => {
            const [y, m] = ym.split('-').map(Number)
            return new Date(y, (m ?? 1) - 1, 1).toLocaleString('en-GB', { month: 'short', year: '2-digit' })
        })

        const values = monthly.out.map(pennies => pennies / 100)

        this.lineData = {
            labels,
            datasets: [ { data: values, tension: 0.35, fill: true } ]
        }
    }

    private buildMonthlyInOutChart() {
        const monthly = this.metrics?.monthly
        if (!monthly) {
            this.inOutData = { labels: [], datasets: [] }
            return
        }

        const labels = this.metrics?.monthly.labels.map(ym => {
            const [y, m] = ym.split('-').map(Number)
            return new Date(y, (m ?? 1) - 1, 1).toLocaleString('en-GB', { month: 'short', year: '2-digit' })
        })

        this.inOutData = {
            labels,
            datasets: [ { label: "In", data: monthly.in.map((p) => p / 100) }, { label: "Out", data: monthly.out.map((p) => p / 100) } ]
        }
    }

    private buildDonutChart() {
        const byCat = this.metrics?.monthly?.byCategoryOut ?? {}

        const totalsByCat = Object.entries(byCat).map(([cat, arr]) => {
            const totalPennies = (arr ?? []).reduce((sum, v) => sum + (Number(v) || 0), 0)
            return [cat, totalPennies] as const
        })

        const entries = totalsByCat
            .filter(([, pennies]) => pennies > 0)
            .sort((a, b) => b[1] - a[1])

        const labels = entries.map(([cat]) => cat)
        const values = entries.map(([, pennies]) => pennies / 100)

        this.donutData = {
            labels,
            datasets: [{ data: values }]
        }
    }

    private buildMonthlyCategoriesSpendChart() {
        const monthly = this.metrics?.monthly
        if (!monthly) {
            this.catStackData = { labels: [], datasets: [] }
            return
        }
        const labels = this.metrics?.monthly.labels.map(ym => {
            const [y, m] = ym.split('-').map(Number)
            return new Date(y, (m ?? 1) - 1, 1).toLocaleString('en-GB', { month: 'short', year: '2-digit' })
        })

        const byCat = monthly.byCategoryOut ?? {}
        const cats = Object.keys(byCat).sort()

        this.catStackData = {
            labels,
            datasets: cats.map((cat) => ({
                label: cat,
                data: (byCat[cat] ?? []).map(p => (Number(p) || 0) / 100),
                stack: "out"
            }))
        }
    }

    private buildSpendingByWeekdayChart() {
        const weekdayAny = (this.metrics as any)?.weekdayOut

        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        const totalOut = Array(7).fill(0) as number[]
        const dayCount = Array(7).fill(0) as number[]

        const seenDatesByWeekday: Array<Set<string>> = Array.from({ length: 7 }, () => new Set<string>())

        for (const tx of this.transactions) {
            if (!tx?.date) continue
            const d = new Date(tx.date)
            if (Number.isNaN(d.getTime())) continue

            const js = d.getDay()
            const weekdayIdx = (js + 6) % 7

            if (!seenDatesByWeekday[weekdayIdx].has(tx.date)) {
                seenDatesByWeekday[weekdayIdx].add(tx.date)
                dayCount[weekdayIdx] += 1
            }

            if (typeof tx.amount === "number" && tx.amount < 0) {
                totalOut[weekdayIdx] += -tx.amount
            }
        }

        const avgOut = totalOut.map((sum, i) => (dayCount[i] ? sum / dayCount[i] : 0)) 

        this.weekdayData = {
            labels: labels,
            datasets: [{ data: avgOut.map(p => p / 100) }]
        }
    }

    private buildSpendingBySizeChart() {
        const labels = this.metrics?.buckets?.outgoingSize?.labels ?? []
        const counts = this.metrics?.buckets?.outgoingSize?.counts ?? []

        this.sizeData = {
            labels,
            datasets: [{ data: counts }]
        }
    }
}