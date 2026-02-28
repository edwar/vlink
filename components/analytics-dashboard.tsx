"use client"

import { TrendingUp, Users, ArrowUpRight } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Cell, PieChart, Pie } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface AnalyticsDashboardProps {
    data: {
        dailyStats: { date: string; total: number; confirmed: number }[]
        serviceStats: { name: string; count: number; fill: string }[]
        conversionRate: number
        totalAppointments: number
        growth?: string
    }
}

const chartConfig = {
    total: {
        label: "Solicitadas",
        color: "hsl(215 20% 65%)", // Soft Slate
    },
    confirmed: {
        label: "Confirmadas",
        color: "hsl(142 76% 45%)", // Vibrant Emerald
    },
} satisfies ChartConfig

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* 1. Gráfico de Conversión (Barras) */}
            <Card className="rounded-xl border-2 border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="items-start pb-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                        <TrendingUp className="h-3 w-3" />
                        Rendimiento Semanal
                    </div>
                    <CardTitle className="text-2xl font-black font-display tracking-tight">Citas y Conversión</CardTitle>
                    <CardDescription>
                        Seguimiento de citas solicitadas vs. confirmadas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart
                            data={data.dailyStats}
                            margin={{
                                top: 20,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                            <Bar dataKey="confirmed" fill="var(--color-confirmed)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
                    <div className="flex gap-2 font-bold leading-none items-center text-primary">
                        Tasa de Conversión: {data.conversionRate}%
                        <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground font-medium">
                        Basado en los últimos 7 días de actividad.
                    </div>
                </CardFooter>
            </Card>

            {/* 2. Gráfico de Distribución (Servicios) */}
            <Card className="rounded-xl border-2 border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="items-start pb-2">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest mb-1">
                        <Users className="h-3 w-3" />
                        Servicios más demandados
                    </div>
                    <CardTitle className="text-2xl font-black font-display tracking-tight">Distribución</CardTitle>
                    <CardDescription>Visualiza qué servicios generan más bookings.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={{}}
                        className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                    >
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie data={data.serviceStats} dataKey="count" label nameKey="name">
                                {data.serviceStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm pt-4">
                    <div className="flex items-center gap-2 font-black leading-none uppercase tracking-tighter">
                        Total bookings: {data.totalAppointments}
                    </div>
                    <div className="text-muted-foreground font-medium">
                        Análisis de los servicios con mejor rendimiento comercial.
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
