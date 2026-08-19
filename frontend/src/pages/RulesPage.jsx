import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cpu, ShieldAlert, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function RulesPage() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/rules`)
      .then(res => setRules(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white">Detection & Correlation Rules</h2>
        <p className="text-xs text-slate-400 mt-0.5">Active detection algorithms operating on SQLite telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rules.map((rule, idx) => (
          <div key={idx} className="glass-card p-5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-gold-500/10 border border-gold-500/30 rounded-lg text-gold-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>
              
              <h3 className="font-bold text-sm text-slate-100 font-mono mb-1">{rule.rule_name}</h3>
              <p className="text-xs text-slate-400 mb-3">{rule.description}</p>

              <div className="p-2.5 bg-obsidian-800 rounded-lg border border-white/5 font-mono text-[11px] text-amber-300 mb-4">
                {rule.logic_summary}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 font-mono text-xs space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Alerts Generated:</span>
                <span className="text-slate-100 font-bold">{rule.alert_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Risk Score:</span>
                <span className="text-gold-400 font-bold">{rule.avg_risk_score}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Triggered:</span>
                <span className="text-slate-300 text-[10px]">{rule.last_triggered}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}