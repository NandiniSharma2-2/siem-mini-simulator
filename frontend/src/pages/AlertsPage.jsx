
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, RefreshCw } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function AlertsPage({ onSelectAlert }) {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/alerts`, {
        params: {
          severity: severityFilter,
          search: search
        }
      });

      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts whenever the severity filter changes
  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">
            Generated Alerts
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Alerts produced by SIEM correlation rules
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-obsidian-800 border border-white/10
                     text-xs text-slate-300 hover:text-white
                     hover:border-white/20 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl flex gap-3 justify-between items-center">

        {/* Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md
                        bg-obsidian-800 px-3 py-1.5 rounded-lg
                        border border-white/10">

          <Search className="w-4 h-4 text-slate-500" />

          <input
            type="text"
            placeholder="Search username, host, process..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchAlerts();
              }
            }}
            className="bg-transparent border-none outline-none
                       text-xs text-slate-200
                       placeholder-slate-500 w-full font-mono"
          />
        </div>

        {/* Severity */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-obsidian-800 border border-white/10
                     text-xs font-mono text-slate-300
                     rounded-lg px-3 py-2 outline-none"
        >
          <option value="">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Alert table */}
      <div className="glass-panel rounded-xl p-5 border border-white/5">

        <table className="w-full text-left text-xs font-mono">

          <thead>
            <tr className="border-b border-white/10
                           text-slate-400 uppercase text-[10px]">

              <th className="pb-2">Timestamp</th>
              <th className="pb-2">Rule Triggered</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">Risk Score</th>
              <th className="pb-2">User</th>
              <th className="pb-2">Host</th>

            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">

            {loading ? (

              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-slate-500"
                >
                  Loading alerts...
                </td>
              </tr>

            ) : alerts.length > 0 ? (

              alerts.map((a) => (

                <tr
                  key={a.id}
                  onClick={() => onSelectAlert(a.id)}
                  className="hover:bg-gold-500/5
                             cursor-pointer
                             transition-colors"
                >

                  {/* Timestamp */}
                  <td className="py-3 text-slate-400">
                    {a.timestamp}
                  </td>

                  {/* Rule */}
                  <td className="py-3 font-semibold text-slate-200">
                    {a.rule_name}
                  </td>

                  {/* Severity */}
                  <td className="py-3">

                    <span
                      className={`px-2 py-0.5 rounded
                                  text-[10px] font-bold ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-600/10 text-rose-300 border border-rose-600/20'
                          : a.severity === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : a.severity === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {a.severity}
                    </span>

                  </td>

                  {/* Risk score */}
                  <td className="py-3 font-bold text-gold-400">
                    {a.risk_score}
                  </td>

                  {/* Username */}
                  <td className="py-3 text-slate-300">
                    {a.username}
                  </td>

                  {/* Computer */}
                  <td className="py-3 text-slate-400">
                    {a.computer}
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-slate-500"
                >
                  No security alerts detected
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
