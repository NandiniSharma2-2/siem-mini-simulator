import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CommandCenter from './pages/CommandCenter';
import EventsPage from './pages/EventsPage';
import AlertsPage from './pages/AlertsPage';
import RulesPage from './pages/RulesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import InvestigationModal from './components/InvestigationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-obsidian-900 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 h-full overflow-y-auto bg-obsidian-900">
        {activeTab === 'dashboard' && <CommandCenter onSelectAlert={setSelectedAlertId} />}
        {activeTab === 'events' && <EventsPage />}
        {activeTab === 'alerts' && <AlertsPage onSelectAlert={setSelectedAlertId} />}
        {activeTab === 'rules' && <RulesPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'investigation' && <AlertsPage onSelectAlert={setSelectedAlertId} />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {selectedAlertId && (
        <InvestigationModal
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
        />
      )}
    </div>
  );
}