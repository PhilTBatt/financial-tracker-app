import { Component, EventEmitter, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StyledCard } from "../styled-card/styled-card";
import { Metrics, Transaction, TransactionRecord } from "../../types/data-types";
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ScriptableContext } from "chart.js";
import { DecimalPipe, KeyValuePipe } from "@angular/common";
import { Inject, PLATFORM_ID, OnInit } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Chart } from "chart.js";
import { FormsModule } from "@angular/forms";


@Component({
    selector: 'data-section',
    imports: [StyledCard, BaseChartDirective, KeyValuePipe, DecimalPipe, FormsModule],
    templateUrl: './data-section.html',
    styleUrl: './data-section.scss'
})

export class DataSection implements OnInit {
    private zoomRegistered = false
    metrics: Metrics | null = null
    transactions: Transaction[] = []
    recordId: string | null = null
    createdAt: string | null = null
    private readonly apiUrl = 'https://financial-tracker-api-6yq1.onrender.com/api/transactions'
    private loadAttempts = 0
    @Output() dataLoaded = new EventEmitter<void>()
    descValue = (a: any, b: any) => b.value - a.value
    lineMode: "monthly" | "weekly" = "monthly"
    inOutMode: "monthly" | "weekly" = "monthly"
    donutMode: "total" | "monthly" | "weekly" = "total"
    catStackMode: "monthly" | "weekly" = "monthly"
    cumMode: "monthly" | "weekly" = "monthly";

    private readonly theme = {
        text: "#94A3B8",
        title: "#E6EDF7",
        grid: "rgba(148,163,184,0.12)",
        spend: "#F59E0B",
        income: "#3B82F6",
        mutedBar: "rgba(148,163,184,0.55)"
    }

    private readonly categoryColors: Record<string, string> = {
        Transfers: "#BF2F2F",
        Transport: "#002983",
        Groceries: "#16A34A",
        Entertainment: "#9d6cf2",
        Cash: "#667f00",
        "Food/Drink": "#F59E0B",
        Gaming: "#4C1D95",
        "Online Shopping": "#0EA5E9",
        Gambling: "#51001c",
        Subscriptions: "#fffb00",
        Other: "#334155"
    }

    private readonly weekdayColors = [
        "#FDE68A",
        "#FCD34D",
        "#FBBF24",
        "#F59E0B",
        "#D97706",
        "#E85A0C",
        "#DC3A0C"
    ]

    private readonly sizeGradient = [
        "#86EFAC",
        "#4ADE80",
        "#22C55E",
        "#16A34A",
        "#15803D",
        "#166534",
        "#14532D",
        "#052E16"
    ]

    lineType: 'line' = 'line'
    lineData: ChartConfiguration<"line">["data"] = { labels: [], datasets: [] }
    lineOptions: ChartConfiguration<'line'>['options'] = { 
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: context => `£${(context.parsed.y || 0).toFixed(2)}` } } 
        },
        scales: {
            x: { ticks: { maxTicksLimit: 6, color: this.theme.text } }, 
            y: { ticks: { maxTicksLimit: 6, color: this.theme.text }, grid: { color: this.theme.grid } } 
        },
        responsive: true,
        maintainAspectRatio: false
    }

    inOutType: "bar" = "bar"
    inOutData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    inOutOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { 
            legend: { display: true },
            tooltip: { callbacks: { label: context => `£${(context.parsed.y || 0).toFixed(2)}` } } 
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: { 
            x: { stacked: false, ticks: { maxTicksLimit: 6 } },
            y: { stacked: false, ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } }
        }
    }

    donutType: "doughnut" = "doughnut"
    donutData: ChartConfiguration<"doughnut">["data"] = { labels: [], datasets: [] }
    donutOptions: ChartConfiguration<'doughnut'>['options'] = { 
        plugins: {
            legend: { position: 'right', labels: { padding: 8, boxWidth: 10, boxHeight: 10, color: this.theme.text } },
            tooltip: { callbacks: { label: context => `£${context.parsed.toFixed(2)}` } }
        },
        layout: { padding: {  right: 0 } },
        maintainAspectRatio: false,
        cutout: '65%'
    }

    bubbleType: 'bubble' = 'bubble';
    bubbleData: ChartConfiguration<'bubble'>['data'] = { datasets: [] }
    bubbleOptions: ChartConfiguration<'bubble'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: { label: context => {
                    const raw = context.raw as any
                    return `${raw._cat}: Count ${raw.x}, Avg £${(raw.y || 0).toFixed(2)}, Total £${(raw._total || 0).toFixed(2)}`
                }}
            }
        },
        scales: {
            x: { title: { display: true, text: 'Outgoing transaction count' }, ticks: { color: this.theme.text } },
            y: { title: { display: true, text: 'Avg outgoing transaction (£)' }, ticks: { color: this.theme.text }, grid: { color: this.theme.grid } }
        }
    }

    catStackType: "bar" = "bar"
    catStackData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    catStackOptions: ChartConfiguration<"bar">["options"] = {
        plugins: {
            legend: { display: false,
                labels: { color: this.theme.text, boxWidth: 10, boxHeight: 10 } 
            },
            tooltip: { callbacks: { label: context => `£${(context.parsed.y || 0).toFixed(2)}` } } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {  
            x: { stacked: true, ticks: { maxTicksLimit: 6 } }, 
            y: { stacked: true, ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } }
        }
    }

    cumType: "line" = "line";
    cumData: ChartConfiguration<"line">["data"] = { labels: [], datasets: [] }
    cumOptions: ChartConfiguration<"line">["options"] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
                labels: { color: this.theme.text, boxWidth: 10, boxHeight: 10 }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `£${Number(ctx.parsed.y || 0).toFixed(2)}`
                }
            }
        },
        scales: {
            x: { ticks: { color: this.theme.text, maxTicksLimit: 8 }, grid: { display: false } },
            y: { ticks: { color: this.theme.text, maxTicksLimit: 6 }, grid: { color: this.theme.grid } }
        }
    }

    weekdayType: "bar" = "bar";
    weekdayData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    weekdayOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: context => `£${(context.parsed.y || 0).toFixed(2)}` } }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } } },
    }

    sizeType: "bar" = "bar";
    sizeData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    sizeOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: context => `${context.parsed.y} Transactions` } } 
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } } },
    }


    rollingType: "line" = "line";
    rollingData: ChartConfiguration<"line">["data"] = { labels: [], datasets: [] }
    rollingOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: context => `£${(context.parsed.y || 0).toFixed(2)}` } }
        },
        scales: { x: { ticks: { maxTicksLimit: 8 } }, y: { ticks: { maxTicksLimit: 6 } } }
    }


    scatterType: "scatter" = "scatter";
    scatterData: ChartConfiguration<"scatter">["data"] = { datasets: [] }
    scatterOptions: ChartConfiguration<'scatter'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: context => {
                        const p = context.raw as any
                        const date = new Date(p.x).toLocaleDateString('en-GB')
                        const val = Number(p.y)
                        const sign = val < 0 ? '-' : '';
                        return `${sign}£${Math.abs(val).toFixed(2)} - ${date ?? ''}`
                    }
                }
            }
        },
        scales: {
            x: { type: 'time', time: { unit: 'day' }, ticks: { maxTicksLimit: 8 } },
            y: { ticks: { maxTicksLimit: 6 } }
        }
    }

    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

    async ngOnInit() {
        await this.registerChartPluginsClientOnly()
    }

    private async registerChartPluginsClientOnly() {
        if (!isPlatformBrowser(this.platformId)) return

        if (!this.zoomRegistered) {
            const zoom = await import("chartjs-plugin-zoom")
            Chart.register(zoom.default)
            this.zoomRegistered = true
        }
    }

    loadRecord(id: string) {
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
                this.buildCategoryBubbleChart()
                this.buildRollingLine()
                this.buildInOutScatter()
                this.buildCumulativeCategorySpend() 
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

    buildMonthlyOutLine() {
        const monthly = this.metrics?.monthly
        if (!monthly) {
            this.lineData = { labels: [], datasets: [] }
            return
        }

        const period = this.getPeriod(this.lineMode)
        if (!period) {
            this.lineData = { labels: [], datasets: [] }
            return
        }

        const labels = period.labels.map((l: string) => this.formatPeriodLabel(this.lineMode, String(l)))
        const values = period.out.map((p: number) => p / 100)

        this.lineData = {
            labels,
            datasets: [ { 
                data: values, tension: 0.35, fill: true, borderColor: this.theme.spend,
                backgroundColor: "rgba(245,158,11,0.18)", borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 
            } ]
        }
    }

    buildMonthlyInOutChart() {
        const period = this.getPeriod(this.inOutMode)
        if (!period) {
            this.inOutData = { labels: [], datasets: [] }
            return
        }

        const labels = period.labels.map((l: string) => this.formatPeriodLabel(this.inOutMode, String(l)))

        this.inOutData = {
            labels,
            datasets: [ 
                { label: "In", data: period.in.map((p: number) => p / 100), 
                    backgroundColor: "rgba(59,130,246,0.85)", borderRadius: 6 }, 
                { label: "Out", data: period.out.map((p: number) => p / 100), 
                    backgroundColor: "rgba(245,158,11,0.75)", borderRadius: 6 } 
            ]
        }
    }

    buildDonutChart() {
        let byCat: Record<string, number[]> = {}

        if (this.donutMode === "monthly") byCat = this.metrics?.monthly?.byCategoryOut ?? {} 
        else if (this.donutMode === "weekly")   byCat = this.metrics?.weekly?.byCategoryOut ?? {}
        else {
            const monthly = this.metrics?.monthly?.byCategoryOut ?? {}
            const totals: Record<string, number[]> = {}
            for (const [cat, arr] of Object.entries(monthly)) totals[cat] = [(arr ?? []).reduce((s, v) => s + (Number(v) || 0), 0)]
            byCat = totals
        }

        let totalsByCat: readonly [string, number][]

        if (this.donutMode === "total") {
            totalsByCat = Object.entries(byCat).map(([cat, arr]) => {
                const total = (arr ?? []).reduce((sum, v) => sum + (Number(v) || 0), 0)
                return [cat, total] as const
            })
        } else {
            totalsByCat = Object.entries(byCat).map(([cat, arr]) => {
                const values = (arr ?? []).map(v => Number(v) || 0)
                const avg = values.length
                ? values.reduce((s, v) => s + v, 0) / values.length
                : 0
                return [cat, avg] as const
            })
        }

        const entries = totalsByCat.filter(([, pennies]) => pennies > 0).sort((a, b) => b[1] - a[1])

        const labels = entries.map(([cat]) => cat)
        const values = entries.map(([, pennies]) => pennies / 100)
        const colors = labels.map(label => this.categoryColors[label] ?? this.theme.text)

        this.donutData = {
            labels,
            datasets: [{ data: values,
                backgroundColor: colors,
                borderColor: this.theme.title,
                borderWidth: 1.5, }]
        }
    }

    buildCategoryBubbleChart() {
        const cats = this.metrics?.categories
        if (!cats) {
            this.bubbleData = { datasets: [] }
            return
        }

        const totals = cats.outTotalByCategory ?? {}
        const counts = cats.outCountByCategory ?? {}
        const avgs = cats.avgOutByCategory ?? {}

        const entries = Object.keys(totals)
            .map(cat => ({
                cat,
                totalPennies: Number(totals[cat] ?? 0),
                count: Number(counts[cat] ?? 0),
                avgPennies: Number(avgs[cat] ?? 0)
            }))
            .filter(x => x.totalPennies > 0 && x.count > 0)

        if (!entries.length) {
            this.bubbleData = { datasets: [] }
            return
        }

        const maxTotalPounds = Math.max(...entries.map(e => e.totalPennies / 100))

        const radiusFromTotal = (totalPounds: number) => {
            const norm = maxTotalPounds ? totalPounds / maxTotalPounds : 0
            return 6 + 18 * Math.sqrt(norm);
        }

        this.bubbleData = {
            datasets: [{
                label: "Categories",
                data: entries.map(e => {
                    const totalPounds = e.totalPennies / 100
                    return {
                        x: e.count,
                        y: e.avgPennies / 100,
                        r: radiusFromTotal(totalPounds),
                        _cat: e.cat,
                        _total: totalPounds
                    }
                }),
                backgroundColor: entries.map(e => this.categoryColors[e.cat] ?? this.theme.text),
                borderColor: this.theme.title,
                borderWidth: 1
            }]
        }
    }

    buildMonthlyCategoriesSpendChart() {
        const period = this.getPeriod(this.catStackMode)
        if (!period) {
            this.catStackData = { labels: [], datasets: [] }
            return
        }

        const labels = period.labels.map((l: string) => this.formatPeriodLabel(this.catStackMode, String(l)))
        const byCat = period.byCategoryOut ?? {}
        const cats = Object.keys(byCat).sort()

        const catsSorted = cats.map(cat => {
            const total = (byCat[cat] ?? []).reduce((sum: number, p: number) => sum + (Number(p) || 0), 0)
            return { cat, total }
        })
        .sort((a, b) => b.total - a.total)
        .map(x => x.cat)

        this.catStackData = {
            labels,
            datasets: catsSorted.map(cat => ({
                label: cat,
                data: (byCat[cat] ?? []).map((p: number) => (Number(p) || 0) / 100),
                backgroundColor: this.categoryColors[cat] ?? this.theme.text,
                borderColor: this.theme.title,
                borderWidth: 1.25
            }))
        }
    }

    buildCumulativeCategorySpend() {
        const period = this.getPeriod(this.cumMode)
        if (!period) {
            this.catStackData = { labels: [], datasets: [] }
            return
        }

        const labels = period.labels.map((l: string) => this.formatPeriodLabel(this.cumMode, String(l)))
        const byCat = period.byCategoryOut ?? {}
        const cats = Object.keys(byCat).sort()

        const catsSorted = Object.keys(byCat)
            .map(cat => ({
                cat,
                total: (byCat[cat] ?? []).reduce((s: any, v: any) => s + (Number(v) || 0), 0)
            }))
            .filter(x => x.total > 0)
            .sort((a, b) => b.total - a.total)
            .map(x => x.cat)

        this.cumData = {
            labels,
            datasets: catsSorted.map(cat => {
                const arr = byCat[cat].map((v: any) => Number(v) || 0)
                let running = 0;
                const cumulative = arr.map((p: any) => {
                    running += p
                    return running / 100
                })
                const color = this.categoryColors[cat] ?? this.theme.text
                return {
                    label: cat,
                    data: cumulative,
                    borderColor: color,
                    backgroundColor: color,
                    borderWidth: 2,
                    tension: 0.25,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 3
                }
            })
        }
    }

    buildSpendingByWeekdayChart() {
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
            datasets: [{ data: avgOut.map(p => p / 100), backgroundColor: this.weekdayColors, borderRadius: 3}]
        }
    }

    buildSpendingBySizeChart() {
        const labels = this.metrics?.buckets?.outgoingSize?.labels ?? []
        const counts = this.metrics?.buckets?.outgoingSize?.counts ?? []

        const colors = labels.map((_, i) =>
            this.sizeGradient[Math.min(i, this.sizeGradient.length - 1)]
        )

        this.sizeData = {
            labels,
            datasets: [{ data: counts, backgroundColor: colors, borderRadius: 6, borderWidth: 0 }]
        }
    }

    buildRollingLine() {
        const labels = this.metrics?.daily?.labels ?? []
        const rollingPennies = this.metrics?.rollingOut7d?.values ?? []
        
        if (!labels.length || !rollingPennies.length) {
            this.rollingData = { labels: [], datasets: [] }
            return
        }
        this.rollingData = {
            labels: labels,
            datasets: [ {
                label: 'Rolling 7-day Avg',
                data: rollingPennies.map(v => (Number(v) || 0) / 100),
                tension: 0.35,
                pointRadius: 0,
                borderColor: this.theme.spend,
                backgroundColor: "rgba(245,158,11,0.18)",
                fill: true,
            } ]
        }
    }

    buildInOutScatter() {
        const txs = this.transactions ?? []
        if (!txs.length) {
            this.scatterData = { datasets: [] }
            return
        }

        const points = txs.filter(t => !!t.date && typeof t.amount === 'number')
            .map(t => ({
                x: new Date(t.date).getTime(),
                y: t.amount / 100,
                _d: t.description
            }))
        
        this.scatterData = {
            datasets: [ {
                label: 'Transactions',
                data: points,
                parsing: false,
                pointRadius: 3,
                backgroundColor: (ctx) => {
                    const raw = ctx.raw as any
                    const y = Number(raw?.y ?? 0)
                    return y >= 0 ? this.theme.income : this.theme.spend
                },
                borderColor: this.theme.title,
                borderWidth: 0.1,
            } ]
        }
    }

    get avgOutgoingTransaction(): number | null {
        const totals = this.metrics?.categories?.outTotalByCategory
        const counts = this.metrics?.categories?.outCountByCategory

        if (!totals || !counts) return null

        const totalOut = Object.values(totals).reduce((s, v) => s + v, 0)
        const totalCount = Object.values(counts).reduce((s, v) => s + v, 0)

        return totalCount ? totalOut / totalCount : null
    }

    private getPeriod(mode: "monthly" | "weekly") {
        return mode === "weekly" ? (this.metrics as any)?.weekly : this.metrics?.monthly
    }

    private formatPeriodLabel(mode: "monthly" | "weekly", label: string) {
        if (mode === "monthly") {
            const [y, m] = label.split("-").map(Number)
            return new Date(y, (m ?? 1) - 1, 1).toLocaleString("en-GB", { month: "short", year: "2-digit" })
        }
        const m = label.match(/^(\d{4})-W(\d{1,2})$/)
        if (m) return `W${m[2].padStart(2, "0")} ${m[1].slice(2)}`
        return label
    }
}