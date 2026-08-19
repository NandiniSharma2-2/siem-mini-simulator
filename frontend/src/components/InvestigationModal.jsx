import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  ShieldAlert,
  User,
  Laptop,
  Cpu,
  Clock,
  CheckCircle2
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function InvestigationModal({ alertId, onClose }) {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alertId) return;

    setLoading(true);
    setError(null);
    setAlertData(null);

    axios
      .get(`${API_BASE}/alerts/${alertId}`)
      .then((res) => {
        setAlertData(res.data);
      })
      .catch((err) => {
        console.error(
          'Error fetching alert investigation detail:',
          err
        );

        setError('Unable to load investigation data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [alertId]);

  if (!alertId) {
    return null;
  }

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';

      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';

      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';

      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">

      <div className="glass-panel border border-gold-500/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">

        {/* ================= HEADER ================= */}

        <div className="flex justify-between items-start pb-4 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-lg font-bold text-white font-mono">
                  {loading
                    ? 'Loading Alert...'
                    : alertData?.rule_name || 'Unknown Alert'}
                </h3>

                {!loading && alertData?.severity && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${getSeverityStyle(
                      alertData.severity
                    )}`}
                  >
                    {alertData.severity}
                  </span>
                )}

              </div>

              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ALERT ID: #{alertId}

                {alertData?.timestamp &&
                  ` • Triggered at ${alertData.timestamp}`}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

        </div>


        {/* ================= LOADING ================= */}

        {loading && (
          <div className="p-12 text-center text-xs font-mono text-slate-500">
            Loading correlation evidence...
          </div>
        )}


        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="p-12 text-center">

            <p className="text-sm text-rose-400 font-mono">
              {error}
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 rounded-lg text-xs font-mono text-slate-300"
            >
              Close
            </button>

          </div>
        )}


        {/* ================= MAIN CONTENT ================= */}

        {!loading && !error && alertData && (

          <div className="space-y-6 mt-6">

            {/* ================= OVERVIEW ================= */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="glass-card p-4 rounded-lg md:col-span-2">

                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Trigger Reason / Description
                </p>

                <p className="text-sm text-slate-200">
                  {alertData.description ||
                    'No description provided.'}
                </p>

              </div>


              {/* RISK SCORE */}

              <div className="glass-card p-4 rounded-lg flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Assigned Risk Score
                  </p>

                  <p className="text-2xl font-bold font-mono text-gold-400">
                    {alertData.risk_score ?? 0} / 100
                  </p>

                </div>

                <div className="w-10 h-10 rounded-full border-2 border-gold-500/30 flex items-center justify-center font-bold text-xs font-mono text-gold-400">
                  {alertData.risk_score ?? 0}
                </div>

              </div>

            </div>


            {/* ================= ENTITY CONTEXT ================= */}

            <div>

              <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">
                Target & Entity Context
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">

                <EntityBox
                  icon={User}
                  label="Target Account"
                  value={alertData.username}
                />

                <EntityBox
                  icon={Laptop}
                  label="Host / Computer"
                  value={alertData.computer}
                />

                <EntityBox
                  icon={Cpu}
                  label="Process Executed"
                  value={alertData.process}
                />

                <EntityBox
                  icon={Clock}
                  label="Logon Type"
                  value={alertData.logon_type}
                />

              </div>

            </div>


            {/* ================= CORRELATION ================= */}

            <div>

              <div className="flex items-center justify-between mb-3">

                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Correlation Evidence
                </h4>

                <span className="text-[10px] text-slate-500 font-mono">
                  Rule: {alertData.rule_name}
                </span>

              </div>


              {alertData.related_events &&
              alertData.related_events.length > 0 ? (

                <div className="space-y-2">

                  {alertData.related_events.map((evt) => (

                    <div
                      key={evt.id}
                      className="p-3 bg-obsidian-800/80 border border-white/5 rounded-lg font-mono text-xs"
                    >

                      <div className="flex justify-between items-center text-slate-400 border-b border-white/5 pb-1.5 mb-2">

                        <span className="text-gold-400 font-bold">
                          Event ID: {evt.event_id}
                        </span>

                        <span>
                          {evt.timestamp}
                        </span>

                      </div>


                      <div className="text-slate-300 mb-2">
                        {evt.event_type ||
                          'Windows Security Event'}
                      </div>


                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">

                        <div>
                          <span className="text-slate-500">
                            Subject:
                          </span>{' '}
                          {evt.subject_account || 'N/A'}
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Target:
                          </span>{' '}
                          {evt.target_user || 'N/A'}
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Logon ID:
                          </span>{' '}
                          {evt.logon_id || 'N/A'}
                        </div>

                        <div>
                          <span className="text-slate-500">
                            Process:
                          </span>{' '}
                          {evt.process || 'N/A'}
                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="p-4 bg-obsidian-800/40 border border-white/5 rounded-lg text-xs font-mono text-slate-500">

                  No correlated events were found for this alert.

                </div>

              )}

            </div>


            {/* ================= ALERT METADATA ================= */}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

              <InfoBox
                label="Alert ID"
                value={`#${alertData.id || alertId}`}
              />

              <InfoBox
                label="Rule"
                value={alertData.rule_name}
              />

              <InfoBox
                label="Logon ID"
                value={alertData.logon_id}
              />

            </div>


            {/* ================= ACTIONS ================= */}

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">

              <button
                onClick={onClose}
                className="px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 rounded-lg text-xs font-mono text-slate-300"
              >
                Close
              </button>

              <button
                onClick={() =>
                  window.alert(
                    'Alert acknowledged. Analyst workflow will be connected here next.'
                  )
                }
                className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 border border-gold-500/40 rounded-lg text-xs font-mono flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Acknowledge Alert
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================================================
   ENTITY BOX
========================================================= */

function EntityBox({ icon: Icon, label, value }) {

  return (

    <div className="p-3 bg-obsidian-800/60 border border-white/5 rounded-lg">

      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase mb-1">

        <Icon className="w-3.5 h-3.5 text-gold-400" />

        <span>{label}</span>

      </div>

      <p className="text-slate-200 truncate font-semibold">
        {value || 'N/A'}
      </p>

    </div>

  );
}


/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({ label, value }) {

  return (

    <div className="p-3 bg-obsidian-800/40 border border-white/5 rounded-lg">

      <p className="text-[10px] font-mono text-slate-500 uppercase">
        {label}
      </p>

      <p className="text-xs font-mono text-slate-200 mt-1 truncate">
        {value || 'N/A'}
      </p>

    </div>

  );
}