'use client'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#F0A500', '#58A6FF', '#3FB950', '#BC8CFF', '#F85149', '#E6EDF3', '#8B949E', '#161B22']

export default function AnalyticsCharts({ data }: { data: any }) {
    if (!data) return null

    return (
        <div className="analytics-charts-grid">
            {/* Registration Trend */}
            <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
                <h3 className="chart-title">Registration Velocity</h3>
                <div style={{ height: '280px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.registrationsByDay} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="var(--accent)" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Track Popularity */}
            <div className="chart-card">
                <h3 className="chart-title">Registrations by Track</h3>
                <div style={{ height: '280px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.byTrack} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                            <YAxis dataKey="name" type="category" width={90} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: 'var(--bg-surface-2)' }}
                                contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                            <Bar dataKey="count" fill="var(--blue)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ticket Distribution */}
            <div className="chart-card">
                <h3 className="chart-title">Ticket Type Distribution</h3>
                <div style={{ height: '280px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.byTicket}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {data.byTicket.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '-10px' }}>
                        {data.byTicket.map((entry: any, index: number) => (
                            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.count})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
