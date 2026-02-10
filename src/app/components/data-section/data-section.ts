import { Component, EventEmitter, Output } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StyledCard } from "../styled-card/styled-card";
import { Metrics, Transaction, TransactionRecord } from "../../types/data-types";
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ScriptableContext } from "chart.js";
import { KeyValuePipe } from "@angular/common";
import { Inject, PLATFORM_ID, OnInit } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Chart } from "chart.js";


@Component({
    selector: 'data-section',
    imports: [StyledCard, BaseChartDirective, KeyValuePipe],
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
        Transport: "#2563EB",
        Groceries: "#16A34A",
        Entertainment: "#7C3AED",
        Cash: "#6B7B2A",
        "Food/Drink": "#F59E0B",
        Gaming: "#4C1D95",
        "Online Shopping": "#0EA5E9",
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
        plugins: { legend: { display: false } },
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
        plugins: { legend: { display: true } },
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
        plugins: { legend: { position: 'right', labels: { padding: 8, boxWidth: 10, boxHeight: 10, color: this.theme.text } } },
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
                callbacks: { label: (ctx) => {
                    const raw = ctx.raw as any;
                    return `${raw._cat}: count ${raw.x}, avg £${raw.y.toFixed(2)}, total £${raw._total.toFixed(2)}`;
                }}
            }
        },
        scales: {
            x: { title: { display: true, text: 'Outgoing transaction count' }, ticks: { color: this.theme.text }, grid: { color: this.theme.grid } },
            y: { title: { display: true, text: 'Avg outgoing transaction (£)' }, ticks: { color: this.theme.text }, grid: { color: this.theme.grid } }
        }
    }

    catStackType: "bar" = "bar"
    catStackData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    catStackOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: true, labels: { color: this.theme.text } } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {  
            x: { stacked: true, ticks: { maxTicksLimit: 6 } }, 
            y: { stacked: true, ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } }
        }
    }

    weekdayType: "bar" = "bar";
    weekdayData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    weekdayOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } } },
    }

    sizeType: "bar" = "bar";
    sizeData: ChartConfiguration<"bar">["data"] = { labels: [], datasets: [] }
    sizeOptions: ChartConfiguration<"bar">["options"] = {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: {}, y: { ticks: { maxTicksLimit: 6 }, grid: { color: this.theme.grid } } },
    }


    rollingType: "line" = "line";
    rollingData: ChartConfiguration<"line">["data"] = { labels: [], datasets: [] }
    rollingOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
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
                    label: (ctx) => {
                        const p = ctx.raw as any
                        const val = Number(p.y)
                        const sign = val < 0 ? '-' : '';
                        return `${sign}£${Math.abs(val).toFixed(2)} — ${p._d ?? ''}`
                    }
                }
            }
        },
        scales: {
            x: { type: 'time', time: { unit: 'day' }, ticks: { maxTicksLimit: 8 } },
            y: { ticks: { maxTicksLimit: 6 } }
        }
    }

    matrixType: "matrix" = "matrix"
    matrixData: ChartConfiguration<"matrix">["data"] = { datasets: [] }
    matrixOptions: ChartConfiguration<'matrix'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const raw = items[0]?.raw as any
                        return raw?._label ?? ''
                    },
                    label: (ctx) => {
                        const raw = ctx.raw as any
                        const v = Number(raw?.v ?? 0)
                        return `£${v.toFixed(2)}`
                    }
                }
            }
        },
        scales: {
            x: { type: 'linear', min: -0.5, max: 11.5, grid: { display: false },
                ticks: { 
                    stepSize: 1, 
                    color: this.theme.text,
                    callback: v => ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][Number(v)] ?? "" } },
            y: { type: 'linear', offset: true, grid: { display: false },
                ticks: { stepSize: 1, callback: v => String(Math.trunc(Number(v))) }
            }
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
                this.buildCategoryBubbleChart()
                this.buildRollingLine()
                this.buildInOutScatter()
                this.buildMonthlySpendMatrix()
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
            datasets: [ { 
                data: values, tension: 0.35, fill: true, borderColor: this.theme.spend,
                backgroundColor: "rgba(245,158,11,0.18)", borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 
            } ]
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
            datasets: [ 
                { label: "In", data: monthly.in.map((p) => p / 100), backgroundColor: "rgba(59,130,246,0.85)", borderRadius: 6 }, 
                { label: "Out", data: monthly.out.map((p) => p / 100), backgroundColor: "rgba(245,158,11,0.75)", borderRadius: 6 } 
            ]
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
        const colors = labels.map(label => this.categoryColors[label] ?? this.theme.text)

        this.donutData = {
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0.5, borderColor: "rgba(15,23,42,0.85)" }]
        }
    }

    private buildCategoryBubbleChart() {
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
                borderColor: "rgba(15,23,42,0.85)",
                borderWidth: 1
            }]
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

        const catsSorted = cats.map(cat => {
            const total = (byCat[cat] ?? []).reduce((sum, p) => sum + (Number(p) || 0), 0)
            return { cat, total }
        })
        .sort((a, b) => b.total - a.total)
        .map(x => x.cat)

        this.catStackData = {
            labels,
            datasets: catsSorted.map((cat) => ({
                label: cat,
                data: (byCat[cat] ?? []).map(p => (Number(p) || 0) / 100),
                backgroundColor: this.categoryColors[cat] ?? this.theme.text,
                borderWidth: 0.5
            }))
        }
    }

    private buildSpendingByWeekdayChart() {
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

    private buildSpendingBySizeChart() {
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

    private buildRollingLine() {
        const labels = this.metrics?.daily?.labels ?? []
        const rollingPennies = this.metrics?.rollingOut7d?.values ?? []
        
        if (!labels.length || !rollingPennies.length) {
            this.rollingData = { labels: [], datasets: [] }
            return
        }
        this.rollingData = {
            labels: labels,
            datasets: [ {
                label: 'Rolling 7-day avg (£)',
                data: rollingPennies.map(v => (Number(v) || 0) / 100),
                tension: 0.35,
                pointRadius: 0,
                borderColor: this.theme.spend,
                backgroundColor: "rgba(245,158,11,0.18)",
                fill: true,
            } ]
        }
    }

    private buildInOutScatter() {
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
                backgroundColor: "rgba(148,163,184,0.55)"
            } ]
        }
    }

    private buildMonthlySpendMatrix() {
        const daily = this.metrics?.daily
        if (!daily?.labels?.length || !daily?.out?.length) {
            this.matrixData = { datasets: [] }
            return
        }

        type Cell = { x: number; y: number; v: number; d: string }

        const lastLabel = String(daily.labels[daily.labels.length - 1] ?? "")
        const lastDate = new Date(lastLabel)
        if (Number.isNaN(lastDate.getTime())) {
            this.matrixData = { datasets: [] }
            return
        }

        const year = lastDate.getFullYear()
        const month = lastDate.getMonth()

        const firstOfMonth = new Date(year, month, 1)
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const jsDayFirst = firstOfMonth.getDay()
        const firstWeekdayMon0 = (jsDayFirst + 6) % 7
        const rows = Math.ceil((firstWeekdayMon0 + daysInMonth) / 7)

        const outByDate = new Map<string, number>()
        for (let i = 0; i < daily.labels.length; i++) {
            const d = String(daily.labels[i] ?? "")
            const outPennies = Number(daily.out[i] ?? 0)
            outByDate.set(d, outPennies / 100)
        }

        const cells: Cell[] = []
        for (let day = 1; day <= daysInMonth; day++) {
            const dt = new Date(year, month, day)
            const iso = dt.toISOString().slice(0, 10)
            const v = Number(outByDate.get(iso) ?? 0)

            const jsDay = dt.getDay()
            const weekdayMon0 = (jsDay + 6) % 7

            const indexFromGridStart = firstWeekdayMon0 + (day - 1)
            const weekRow = Math.floor(indexFromGridStart / 7)

            cells.push({ x: weekdayMon0, y: weekRow, v, d: iso })
        }

        const maxV = Math.max(...cells.map(p => p.v))

        this.matrixOptions = {
            ...this.matrixOptions,
            scales: {
                ...this.matrixOptions?.scales,
                y: {
                    type: "linear",
                    min: -0.5,
                    max: (rows - 1) + 0.5,
                    grid: { display: false },
                    ticks: { display: false }
                }
            }
        }

        this.matrixData = {
            datasets: [
            {
                label: "Monthly spend (£)",
                data: cells,
                parsing: false,
                borderWidth: 1,
                borderColor: "rgba(15,23,42,0.85)",
                backgroundColor: (ctx) => {
                    const raw = ctx.raw
                    if (!raw || typeof raw !== "object") return "rgba(148,163,184,0.10)"
                    const r = raw as { v?: number }
                    const v = Number(r.v ?? 0)
                    if (!maxV || v <= 0) return "rgba(148,163,184,0.10)"
                    const t = Math.min(1, Math.max(0, v / maxV))
                    const a = 0.12 + 0.78 * Math.sqrt(t)
                    return `rgba(245,158,11,${a})`
                },
                width: (ctx) => {
                    const area = ctx.chart.chartArea
                    return area ? Math.floor(area.width / 7) - 2 : 20
                },
                height: (ctx) => {
                    const area = ctx.chart.chartArea
                    return area ? Math.max(10, Math.floor(area.height / rows) - 2) : 14
                }
            } ]
        }
    }

}