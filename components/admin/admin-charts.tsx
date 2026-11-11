"use client"

import { CalendarCheck2, TrendingUp, Star } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, AreaChart, Area } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface AdminChartsProps {
    appointmentsByStatus: { status: string; count: number }[]
    topServices: { name: string; count: number }[]
    monthlyGrowth: { month: string; count: number }[]
}

export function AdminCharts({ appointmentsByStatus, topServices, monthlyGrowth }: AdminChartsProps) {
    // 2. Salud del Ecosistema (BarChart - Vertical)
    const apptConfig = {
        count: {
            label: "Citas",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    const statusColors: Record<string, string> = {
        PENDING: "hsl(38 92% 50%)",     // Amber
        CONFIRMED: "hsl(142 76% 45%)",  // Green
        CANCELLED: "hsl(348 83% 47%)",  // Red
    }

    const barData = appointmentsByStatus.map((s) => ({
        status: s.status,
        count: s.count,
        fill: statusColors[s.status] || "hsl(215 20% 65%)",
    }))

    // 3. Top Servicios (BarChart - Horizontal) -> Usaremos una lista simple visual o un gráfico de barras
    const topServicesConfig = {
        count: {
            label: "Citas",
            color: "hsl(217 91% 60%)", // Blue
        },
    } satisfies ChartConfig

    const topServicesData = topServices.map(ts => ({
        name: ts.name.length > 20 ? ts.name.substring(0, 20) + "..." : ts.name,
        count: ts.count,
        fill: "hsl(217 91% 60%)"
    }))

    // 4. Crecimiento Mensual (AreaChart)
    const growthConfig = {
        count: {
            label: "Nuevas",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Salud del Ecosistema */}
                <Card className="lg:col-span-2 border border-border/40 shadow-none rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                            <CalendarCheck2 className="h-5 w-5 text-primary" /> Salud del Ecosistema
                        </CardTitle>
                        <CardDescription>Estado global de las citas generadas usando VLink.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        <ChartContainer config={apptConfig} className="aspect-auto h-[300px] w-full">
                            <BarChart
                                data={barData}
                                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="count" radius={4}>
                                    {barData.map((entry) => (
                                        <Cell key={entry.status} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Servicios */}
                <Card className="border border-border/40 shadow-none rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black font-display tracking-tight flex items-center gap-2 text-blue-500">
                            <Star className="h-5 w-5" /> Top Servicios Globales
                        </CardTitle>
                        <CardDescription>Servicios con mayor cantidad de agendamientos en la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-4">
                        <ChartContainer config={topServicesConfig} className="aspect-auto h-[300px] w-full">
                            <BarChart
                                data={topServicesData}
                                layout="vertical"
                                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} width={120} style={{ fontSize: '12px' }} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Crecimiento Mensual */}
                <Card className="border border-border/40 shadow-none rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-transparent overflow-hidden">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black font-display tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" /> Crecimiento Histórico
                        </CardTitle>
                        <CardDescription>Nuevas organizaciones registradas en los últimos 6 meses.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ChartContainer config={growthConfig} className="aspect-auto h-[300px] w-full">
                            <AreaChart
                                data={monthlyGrowth}
                                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                className="p-6"
                            >
                                <defs>
                                    <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--color-count)"
                                    fillOpacity={1}
                                    fill="url(#fillCount)"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
