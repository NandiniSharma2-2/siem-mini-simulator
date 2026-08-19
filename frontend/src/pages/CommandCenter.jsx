import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = 'http://127.0.0.1:5000/api';
const SEVERITY_COLORS = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#E5A93B', LOW: '#3B82F6' };

export default function CommandCenter({ onSelectAlert }) {
  const [stats, setStats] = useState(null);
  const [eventsTimeline, setEventsTimeline] = useState([]);
  const [severityDist, setSeverityDist] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, timelineRes, sevRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/analytics/events-over-time`),
        axios.get(`${API_BASE}/analytics/severity`),
        axios.get(`${API_BASE}/alerts?limit=10`)
      ]);

      setStats(statsRes.data);
      setEventsTimeline(timelineRes.data);
      setRecentAlerts(alertsRes.data);

      const pieData = Object.entries(sevRes.data).map(([key, value]) => ({
        name: key,
        value: value,
        color: SEVERITY_COLORS[key] || '#64748B'
      }));
      setSeverityDist(pieData);
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">SIEM Command Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry and Windows security event threat detection</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-obsidian-700 hover:bg-obsidian-600 border border-white/10 rounded-md text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="TOTAL EVENTS" value={stats?.total_events} icon={Activity} color="text-slate-200" />
        <MetricCard label="ACTIVE ALERTS" value={stats?.active_alerts} icon={AlertCircle} color="text-gold-400" />
        <MetricCard label="HIGH / CRITICAL" value={stats?.high_risk_alerts} icon={ShieldAlert} color="text-rose-500" />
        <MetricCard label="AVG RISK SCORE" value={stats?.aggregate_risk_score} icon={Zap} color="text-amber-400" suffix="/100" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Activity Chart */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-white/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4">Event Activity Over Time</h3>
          <div className="h-64 w-full">
            {eventsTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventsTimeline}>
                  <defs>
                    <linearGradient id="eventGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E5A93B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E5A93B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickFormatter={(val) => val.split(' ')[1] || val} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F111A', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="count" stroke="#E5A93B" strokeWidth={2} fillOpacity={1} fill="url(#eventGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">Insufficient event activity data</div>
            )}
          </div>
        </div>

        {/* Severity Donut Chart */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Alert Severity Distribution</h3>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityDist} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={4}>
                  {severityDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F111A', borderColor: 'rgba(255,255,255,0.1)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            {severityDist.map((item) => (
              <div key={item.name} className="flex items-center justify-between px-2 py-1 bg-obsidian-800/50 rounded border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] text-slate-300 font-mono">{item.name}</span>
                </div>
                <span className="text-[11px] font-bold font-mono text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="glass-panel rounded-xl p-5 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Recent Generated Alerts</h3>
          <span className="text-[10px] text-slate-500 font-mono">Click row to investigate</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Rule Triggered</th>
                <th className="pb-2">Severity</th>
                <th className="pb-2">Risk</th>
                <th className="pb-2">Target User</th>
                <th className="pb-2">Host</th>
                <th className="pb-2">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert.id)}
                    className="hover:bg-gold-500/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 text-slate-400">{alert.timestamp}</td>
                    <td className="py-2.5 text-slate-200 font-semibold group-hover:text-gold-400">{alert.rule_name}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        alert.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-200 font-bold">{alert.risk_score}</td>
                    <td className="py-2.5 text-slate-300">{alert.username || 'N/A'}</td>
                    <td className="py-2.5 text-slate-400">{alert.computer || 'N/A'}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[150px]">{alert.process || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500">No security alerts detected</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, suffix = "" }) {
  return (
    <div className="glass-card p-4 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`text-2xl font-bold font-mono mt-1 ${color}`}>
          {value !== undefined && value !== null ? `${value}${suffix}` : '0'}
        </p>
      </div>
      <div className="p-2.5 rounded-lg bg-obsidian-800 border border-white/5 text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}