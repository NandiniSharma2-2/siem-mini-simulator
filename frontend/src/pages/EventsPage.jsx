import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [eventIdFilter, setEventIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [loading, setLoading] = useState(false);

  const LIMIT = 15;

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/events`, {
        params: {
          page,
          limit: LIMIT,
          search,
          event_id: eventIdFilter,
          start_date: startDate,
          end_date: endDate,
          start_time: startTime,
          end_time: endTime
        }
      });

      setEvents(response.data.data || []);
      setTotal(response.data.total || 0);

    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever page changes
  useEffect(() => {
    fetchEvents();
  }, [page]);

  // Apply filters
  const handleApplyFilters = () => {
    setPage(1);
    fetchEvents();
  };

  // Reset everything
  const handleReset = () => {
    setSearch('');
    setEventIdFilter('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setPage(1);

    // Fetch with cleared filters immediately
    setTimeout(() => {
      fetchEvents();
    }, 0);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-xl font-bold text-white">
            Security Log Events
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Raw Windows Event Telemetry captured from win32evtlog
          </p>
        </div>

        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-obsidian-800 border border-white/10
                     text-xs text-slate-300
                     hover:text-white hover:border-white/20
                     transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>

      </div>


      {/* Filter Panel */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-4">

        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div
            className="flex items-center gap-3
                       flex-1 min-w-[250px]
                       bg-obsidian-800
                       px-3 py-2
                       rounded-lg
                       border border-white/10"
          >

            <Search className="w-4 h-4 text-slate-500" />

            <input
              type="text"
              placeholder="Search host, process, logon ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              className="bg-transparent
                         border-none
                         outline-none
                         text-xs
                         text-slate-200
                         placeholder-slate-500
                         w-full
                         font-mono"
            />

          </div>


          {/* Event ID */}
          <select
            value={eventIdFilter}
            onChange={(e) => {
              setEventIdFilter(e.target.value);
              setPage(1);
            }}
            className="bg-obsidian-800
                       border border-white/10
                       text-xs
                       font-mono
                       text-slate-300
                       rounded-lg
                       px-3 py-2
                       outline-none"
          >

            <option value="">
              All Event IDs
            </option>

            <option value="4624">
              4624 - Successful Logon
            </option>

            <option value="4672">
              4672 - Special Privileges
            </option>

            <option value="4798">
              4798 - User Group Enumeration
            </option>

          </select>

        </div>


        {/* Date / Time Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Start Date */}
          <FilterInput
            label="START DATE"
            type="date"
            value={startDate}
            onChange={setStartDate}
          />

          {/* End Date */}
          <FilterInput
            label="END DATE"
            type="date"
            value={endDate}
            onChange={setEndDate}
          />

          {/* Start Time */}
          <FilterInput
            label="START TIME"
            type="time"
            value={startTime}
            onChange={setStartTime}
          />

          {/* End Time */}
          <FilterInput
            label="END TIME"
            type="time"
            value={endTime}
            onChange={setEndTime}
          />

        </div>


        {/* Filter Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/5">

          <button
            onClick={handleReset}
            className="flex items-center gap-2
                       px-3 py-2
                       rounded-lg
                       bg-obsidian-800
                       border border-white/10
                       text-xs font-mono
                       text-slate-400
                       hover:text-white
                       transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleApplyFilters}
            className="px-4 py-2
                       rounded-lg
                       bg-gold-500/15
                       border border-gold-500/30
                       text-gold-400
                       text-xs font-mono
                       hover:bg-gold-500/25
                       transition-colors"
          >
            Apply Filters
          </button>

        </div>

      </div>


      {/* Events Table */}
      <div
        className="glass-panel
                   rounded-xl
                   p-5
                   border border-white/5"
      >

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs font-mono">

            <thead>

              <tr
                className="border-b
                           border-white/10
                           text-slate-400
                           uppercase
                           text-[10px]"
              >

                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Event ID</th>
                <th className="pb-2">Event Type</th>
                <th className="pb-2">Target User</th>
                <th className="pb-2">Subject Account</th>
                <th className="pb-2">Host</th>
                <th className="pb-2">Logon Type</th>
                <th className="pb-2">Process</th>
                <th className="pb-2">Logon ID</th>

              </tr>

            </thead>


            <tbody className="divide-y divide-white/5">

              {loading ? (

                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-8 text-slate-500"
                  >
                    Querying SQLite database...
                  </td>
                </tr>

              ) : events.length > 0 ? (

                events.map((evt) => (

                  <tr
                    key={evt.id}
                    className="hover:bg-white/5 transition-colors"
                  >

                    <td className="py-2.5 text-slate-400">
                      {evt.timestamp || '—'}
                    </td>

                    <td className="py-2.5">
                      <span className="font-bold text-gold-400">
                        {evt.event_id}
                      </span>
                    </td>

                    <td className="py-2.5 text-slate-300">
                      {evt.event_type || '—'}
                    </td>

                    <td className="py-2.5 text-slate-200">
                      {evt.target_user || '—'}
                    </td>

                    <td className="py-2.5 text-slate-300">
                      {evt.subject_account || '—'}
                    </td>

                    <td className="py-2.5 text-slate-400">
                      {evt.computer || '—'}
                    </td>

                    <td className="py-2.5">

                      {evt.logon_type ? (
                        <span
                          className="px-2 py-0.5 rounded
                                     bg-obsidian-800
                                     border border-white/10
                                     text-slate-300"
                        >
                          {evt.logon_type}
                        </span>
                      ) : (
                        '—'
                      )}

                    </td>

                    <td
                      className="py-2.5
                                 text-slate-400
                                 truncate
                                 max-w-[200px]"
                      title={evt.process || ''}
                    >
                      {evt.process || '—'}
                    </td>

                    <td className="py-2.5 text-slate-500">
                      {evt.logon_id || '—'}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-8 text-slate-500"
                  >
                    No events found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* Pagination */}
        <div
          className="flex
                     justify-between
                     items-center
                     mt-4
                     pt-4
                     border-t
                     border-white/5
                     text-xs
                     font-mono
                     text-slate-400"
        >

          <div>
            Total Matching Records: {total}
          </div>


          <div className="flex items-center gap-3">

            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5
                         rounded
                         bg-obsidian-800
                         disabled:opacity-40
                         border border-white/10
                         hover:border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>


            <span>
              Page {page} of {totalPages || 1}
            </span>


            <button
              disabled={
                page >= totalPages ||
                loading ||
                events.length === 0
              }
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5
                         rounded
                         bg-obsidian-800
                         disabled:opacity-40
                         border border-white/10
                         hover:border-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ---------------------------------------------------------
   Reusable Filter Input
--------------------------------------------------------- */

function FilterInput({ label, type, value, onChange }) {

  return (
    <div className="space-y-1">

      <label className="block text-[9px] font-mono text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full
                   bg-obsidian-800
                   border border-white/10
                   rounded-lg
                   px-3 py-2
                   text-xs
                   font-mono
                   text-slate-300
                   outline-none
                   focus:border-gold-500/40"
      />

    </div>
  );
}