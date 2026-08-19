import React from 'react';
import { Shield, LayoutDashboard, Activity, AlertTriangle, Cpu, PieChart, Search, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'rules', label: 'Correlation Rules', icon: Cpu },
    { id: 'analytics', label: 'Risk Analytics', icon: PieChart },
    { id: 'investigation', label: 'Investigation', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-obsidian-800/90 border-r border-white/5 flex flex-col justify-between h-screen sticky top-0 p-4">
      <div>
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-white/5">
          <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-400 gold-glow">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-slate-100 uppercase">Aegis SIEM</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase">SOC Command Center</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30 gold-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-obsidian-700/50 rounded-lg border border-white/5 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-400 font-semibold">ENGINE ACTIVE</span>
        </div>
        <p className="text-[10px] text-slate-500">DB: siem.db (Connected)</p>
      </div>
    </aside>
  );
}