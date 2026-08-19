import React, { useState } from 'react';
import { Database, Sliders, RefreshCw, Server, ShieldCheck, HardDrive } from 'lucide-react';

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
      <div>
        <h2 className="text-xl font-bold text-white">SOC Dashboard & System Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure engine polling intervals, backend database paths, and baseline parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Database & Pipeline Status */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Database className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono">Database & Telemetry Connection</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-obsidian-800 rounded-lg border border-white/5">
              <span className="text-slate-400">Database Storage</span>
              <span className="text-slate-200 font-semibold">siem.db (SQLite3)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-obsidian-800 rounded-lg border border-white/5">
              <span className="text-slate-400">REST API Target</span>
              <span className="text-gold-400 font-semibold">http://127.0.0.1:5000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-obsidian-800 rounded-lg border border-white/5">
              <span className="text-slate-400">Log Event Ingestion</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Win32 EventLog Collector
              </span>
            </div>
          </div>
        </div>

        {/* Polling & Refresh Controls */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-5 h-5 text-gold-400" />
            <h3 className="text-sm font-bold text-slate-200 font-mono">Telemetry Polling Preferences</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-obsidian-800 rounded-lg border border-white/5">
              <div>
                <p className="text-slate-200 font-semibold">Auto-Refresh Telemetry</p>
                <p className="text-[10px] text-slate-500">Periodically poll Flask API for new alerts</p>
              </div>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 accent-gold-500 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-obsidian-800 rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Polling Frequency</span>
                <span className="text-gold-400 font-bold">{refreshInterval} seconds</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}