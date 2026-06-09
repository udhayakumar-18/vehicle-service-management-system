// src/pages/Revenue.jsx
// Revenue Dashboard with Recharts — Daily, Monthly, Yearly graphs
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { getRevenueSummary, getDailyRevenue, getMonthlyRevenue, getYearlyRevenue } from '../api/revenueApi';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 16px', boxShadow: 'var(--shadow-lg)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {prefix}{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Revenue({ addToast }) {
  const [tab, setTab] = useState('daily');
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyDays, setDailyDays] = useState(30);
  const [monthlyMonths, setMonthlyMonths] = useState(12);

  const load = () => {
    setLoading(true);
    Promise.all([
      getRevenueSummary(),
      getDailyRevenue(dailyDays),
      getMonthlyRevenue(monthlyMonths),
      getYearlyRevenue(),
    ]).then(([s, d, m, y]) => {
      setSummary(s.data);
      setDaily(d.data);
      setMonthly(m.data);
      setYearly(y.data);
    }).catch(() => addToast('Failed to load revenue data', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [dailyDays, monthlyMonths]);

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <h2>Revenue Analytics</h2>
        <p>Track your earnings with daily, monthly, and yearly insights</p>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-emerald)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value">{fmt(summary?.all_time?.revenue || 0)}</div>
          <div className="stat-label">All-Time Revenue</div>
          <div className="stat-sub">{summary?.all_time?.count || 0} paid jobs</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-primary)' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{fmt(summary?.today?.revenue || 0)}</div>
          <div className="stat-label">Today</div>
          <div className="stat-sub">{summary?.today?.count || 0} jobs</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-purple)' }}>
          <div className="stat-icon">📆</div>
          <div className="stat-value">{fmt(summary?.this_month?.revenue || 0)}</div>
          <div className="stat-label">This Month</div>
          <div className="stat-sub">{summary?.this_month?.count || 0} jobs</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-amber)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{fmt(summary?.pending?.value || 0)}</div>
          <div className="stat-label">Pending Revenue</div>
          <div className="stat-sub">{summary?.pending?.count || 0} unpaid jobs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['daily', '📅 Daily'], ['monthly', '📆 Monthly'], ['yearly', '📊 Yearly']].map(([v, l]) => (
          <button key={v} className={`tab-btn ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }}></div><span>Loading charts...</span></div>
      ) : (
        <>
          {/* DAILY */}
          {tab === 'daily' && (
            <div>
              <div className="flex items-center justify-between mb-16">
                <div />
                <div className="flex gap-8 items-center">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Show last:</span>
                  {[7, 14, 30, 60, 90].map(d => (
                    <button key={d} className={`btn btn-sm ${dailyDays === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDailyDays(d)}>{d}d</button>
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <h3>Daily Revenue</h3>
                <p>Revenue earned per day over the last {dailyDays} days</p>
                {daily.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📭</div><h3>No data</h3><p>Process some payments to see daily revenue</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={daily} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="chart-card">
                <h3>Daily Job Count</h3>
                <p>Number of service jobs completed per day</p>
                {daily.length === 0 ? <div className="empty-state"><div className="empty-icon">📭</div><h3>No data</h3><p>No paid jobs in this period</p></div> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={daily} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip prefix="" />} />
                      <Bar dataKey="count" name="Jobs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* MONTHLY */}
          {tab === 'monthly' && (
            <div>
              <div className="flex items-center justify-between mb-16">
                <div />
                <div className="flex gap-8 items-center">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Show last:</span>
                  {[3, 6, 12, 24].map(m => (
                    <button key={m} className={`btn btn-sm ${monthlyMonths === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMonthlyMonths(m)}>{m}mo</button>
                  ))}
                </div>
              </div>
              <div className="chart-card">
                <h3>Monthly Revenue</h3>
                <p>Revenue per month over the last {monthlyMonths} months</p>
                {monthly.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📭</div><h3>No data</h3><p>Process payments to see monthly revenue</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* YEARLY */}
          {tab === 'yearly' && (
            <div>
              <div className="chart-card">
                <h3>Yearly Revenue</h3>
                <p>Total revenue earned per year</p>
                {yearly.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📭</div><h3>No data</h3><p>Process payments to see yearly revenue</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={yearly} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="year" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]}>
                        {yearly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {yearly.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="chart-card">
                    <h3>Revenue Share by Year</h3>
                    <p>Proportion of total revenue per year</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={yearly} dataKey="revenue" nameKey="year" cx="50%" cy="50%" outerRadius={100} paddingAngle={3} label={({ year, percent }) => `${year} (${(percent * 100).toFixed(0)}%)`}>
                          {yearly.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-card">
                    <h3>Year Summary</h3>
                    <p>Revenue breakdown by year</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                      {yearly.map((y, i) => (
                        <div key={y.year} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: `1px solid ${COLORS[i % COLORS.length]}33` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                            <span style={{ fontWeight: 600 }}>{y.year}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: COLORS[i % COLORS.length] }}>{fmt(y.revenue)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{y.count} jobs</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
