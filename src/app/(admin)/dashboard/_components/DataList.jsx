'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'

// Use the application's color palette from globals.css
const appColors = {
    chart1: '#FFBC2D', // Amber - primary accent
    chart2: '#473729', // Cafe - primary
    chart3: '#6C5F54', // Walnut - border
    chart4: '#BEBAAC', // Dun - secondary
    chart5: '#302F2B', // Jet - foreground
}

// HQ color palettes using the application theme
const hqColors = {
    tdu: [appColors.chart1, appColors.chart2, appColors.chart3, appColors.chart4],
    tma: [appColors.chart1, appColors.chart2, appColors.chart3, appColors.chart4],
    tds: [appColors.chart1, appColors.chart2, appColors.chart3, appColors.chart4]
}

// Progress colors using the application theme
const progressColors = {
    completed: appColors.chart1, // Amber
    inProgress: appColors.chart2  // Cafe
}

// Dummy data for HQ TDU with theme colors
const hqTduData = [
    { name: 'T2', value: 85, color: hqColors.tdu[0] },
    { name: 'T1', value: 72, color: hqColors.tdu[1] },
    { name: 'TuA', value: 64, color: hqColors.tdu[2] },
    { name: 'TuB', value: 57, color: hqColors.tdu[3] }
]

// Dummy data for HQ TMA with theme colors
const hqTmaData = [
    { name: 'T2', value: 92, color: hqColors.tma[0] },
    { name: 'T1', value: 68, color: hqColors.tma[1] },
    { name: 'TuA', value: 45, color: hqColors.tma[2] },
    { name: 'TuB', value: 38, color: hqColors.tma[3] }
]

// Dummy data for HQ TDS with theme colors
const hqTdsData = [
    { name: 'L1', value: 156, color: hqColors.tds[0] },
    { name: 'L2', value: 134, color: hqColors.tds[1] },
    { name: 'L3', value: 98, color: hqColors.tds[2] },
    { name: 'L4', value: 76, color: hqColors.tds[3] }
]

// Dummy data for Master progress with theme colors
const masterData = [
    { name: 'Completed', value: 28, color: progressColors.completed },
    { name: 'In Progress', value: 15, color: progressColors.inProgress }
]

// Dummy data for PhD progress with theme colors
const phdData = [
    { name: 'Completed', value: 8, color: progressColors.completed },
    { name: 'In Progress', value: 12, color: progressColors.inProgress }
]

// Enhanced custom label component for donut charts
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    if (percent < 0.05) return null // Don't show labels for very small segments

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="text-xs font-bold drop-shadow-lg"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

// Enhanced custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
                <p className="font-semibold text-popover-foreground">{payload[0].name}</p>
                <p className="text-sm text-muted-foreground">
                    Count: <span className="font-bold text-foreground">{payload[0].value}</span>
                </p>
                <div
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: payload[0].color }}
                />
            </div>
        )
    }
    return null
}

// Enhanced HQ Card Component with theme-consistent styling
const HQCard = ({ title, data, totalLabel, icon: Icon }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <Card className="relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-accent/5" />
            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription className="text-3xl font-bold text-foreground mt-1">
                            {total.toLocaleString()} <span className="text-lg font-medium text-muted-foreground">{totalLabel}</span>
                        </CardDescription>
                    </div>
                    {Icon && (
                        <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={85}
                                innerRadius={45}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="var(--background)"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-90 transition-opacity duration-200"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={40}
                                iconType="circle"
                                formatter={(value, entry) => (
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

// Enhanced Progress Card Component
const ProgressCard = ({ title, data, icon: Icon }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const completedPercentage = ((data.find(item => item.name === 'Completed')?.value || 0) / total * 100).toFixed(1)

    return (
        <Card className="relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-accent/5" />
            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <CardDescription className="text-3xl font-bold text-foreground mt-1">
                            {total} <span className="text-lg font-medium text-muted-foreground">Total</span>
                        </CardDescription>
                        <div className="text-sm text-muted-foreground mt-1">
                            {completedPercentage}% Completed
                        </div>
                    </div>
                    {Icon && (
                        <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={85}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="var(--background)"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-90 transition-opacity duration-200"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={40}
                                iconType="circle"
                                formatter={(value, entry) => (
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {value}
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

// Enhanced Count Card Component
const CountCard = ({ title, count, description, icon: Icon }) => {
    return (
        <Card className="relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-accent/5" />
            <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    {Icon && (
                        <div className="p-3 rounded-full bg-accent text-accent-foreground shadow">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="flex flex-col items-center justify-center h-[220px]">
                    <div className="text-6xl font-bold text-accent mb-3">
                        {count}
                    </div>
                    {description && (
                        <div className="text-sm text-muted-foreground text-center max-w-xs">
                            {description}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

const DataList = () => {
    return (
        <div className='flex flex-1 flex-col gap-8 p-6 pt-0'>
            {/* Dashboard Header */}
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground">Real-time insights and analytics for organizational management</p>
            </div>

            {/* First Row - HQ Cards */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-accent" />
                        Headquarters Overview
                    </h2>
                    <div className='grid gap-6 lg:grid-cols-3'>
                        <HQCard
                            title="HQ TDU"
                            data={hqTduData}
                            totalLabel="mutarobbi"
                            icon={Users}
                        />
                        <HQCard
                            title="HQ TMA"
                            data={hqTmaData}
                            totalLabel="mutarobbi"
                            icon={Users}
                        />
                        <HQCard
                            title="HQ TDS"
                            data={hqTdsData}
                            totalLabel="mutarobbi"
                            icon={Users}
                        />
                    </div>
                </div>

                {/* Second Row - TDPRO Section */}
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Training & Development Program (TDPRO)
                    </h2>
                    <Card className="border shadow-md bg-card/10">
                        <CardHeader className="pb-6">
                            <CardTitle className="text-2xl font-bold">TDPRO Analytics</CardTitle>
                            <CardDescription>
                                Comprehensive overview of training and development programs
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 lg:grid-cols-3">
                                <CountCard
                                    title="Lecturers"
                                    count={12}
                                    description="Active lecturers contributing to the program"
                                    icon={BookOpen}
                                />
                                <ProgressCard
                                    title="Master Programs"
                                    data={masterData}
                                    icon={GraduationCap}
                                />
                                <ProgressCard
                                    title="PhD Programs"
                                    data={phdData}
                                    icon={GraduationCap}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DataList
