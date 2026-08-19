import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function AnalyticsPage() {
  const [rules, setRules] = useState([]);
  const [severityDist, setSeverityDist] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_BASE}/rules`),
      axios.get(`${API_BASE}/analytics/severity`)
    ]).then(([rulesRes, sevRes]) => {
      setRules(rulesRes.data);
      const sevData = Object.entries(sevRes.data).map(([key, value]) => ({ name: key, count: value }));
      setSeverityDist(sevData);
    });
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Risk Analytics & Threat Distribution</h2>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated threat metrics and risk distribution insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-4">Alert Trigger Volume by Correlation Rule</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rules}>
                <XAxis dataKey="rule_name" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F111A', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Bar dataKey="alert_count" fill="#E5A93B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-4">Severity Tier Metrics</h3>
          <div className="space-y-3 font-mono text-xs">
            {severityDist.map(item => (
              <div key={item.name} className="flex justify-between items-center p-3 bg-obsidian-800 rounded-lg border border-white/5">
                <span className="text-slate-300 font-bold">{item.name} SEVERITY</span>
                <span className="text-gold-400 font-bold text-sm">{item.count} Alerts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}