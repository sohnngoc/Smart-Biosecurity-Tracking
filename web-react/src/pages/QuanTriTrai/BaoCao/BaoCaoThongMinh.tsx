import { useState } from 'react';
import { LineChart, AlertTriangle, Map as MapIcon, Activity, Settings, ShieldAlert, FileText, DownloadCloud, ActivitySquare, ShieldCheck } from 'lucide-react';
import RiskCommandCenter from './RiskCommandCenter';
import AlertSLAReport from './AlertSLAReport';
import MovementTraceability from './MovementTraceability';
import DisinfectionCompliance from './DisinfectionCompliance';
import PeriodicAssessmentReport from './PeriodicAssessmentReport';
import DeviceHealthReport from './DeviceHealthReport';
import ZoneViolationHeatmap from './ZoneViolationHeatmap';
import IncidentRootCause from './IncidentRootCause';
import SupplyBiosecurity from './SupplyBiosecurity';
import FarmBenchmark from './FarmBenchmark';

export default function BaoCaoThongMinh() {
  const [activeTab, setActiveTab] = useState('r1');

  const tabs = [
    { id: 'r1', name: 'Risk Command Center', icon: <ShieldAlert size={16} /> },
    { id: 'r2', name: 'Realtime Alert & SLA', icon: <AlertTriangle size={16} /> },
    { id: 'r3', name: 'Movement Traceability', icon: <MapIcon size={16} /> },
    { id: 'r4', name: 'Disinfection Compliance', icon: <ShieldCheck size={16} /> },
    { id: 'r5', name: 'Periodic Assessment Trend', icon: <ActivitySquare size={16} /> },
    { id: 'r6', name: 'Device Health & Blind Spot', icon: <Settings size={16} /> },
    { id: 'r7', name: 'Zone Violation Heatmap', icon: <MapIcon size={16} /> },
    { id: 'r8', name: 'Incident Root Cause', icon: <FileText size={16} /> },
    { id: 'r9', name: 'Supply Biosecurity', icon: <Activity size={16} /> },
    { id: 'r10', name: 'Farm Benchmark', icon: <LineChart size={16} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50 -m-6">
      {/* Sidebar Báo cáo */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800">Smart Reports</h2>
          <p className="text-xs text-gray-500 mt-1">Automation Insights</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`mr-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Toolbar */}
        <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm z-10">
          <h2 className="text-lg font-bold text-gray-800">
            {tabs.find(t => t.id === activeTab)?.name}
          </h2>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Hôm nay</option>
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
            <button className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <DownloadCloud size={16} className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Report Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'r1' && <RiskCommandCenter />}
          {activeTab === 'r2' && <AlertSLAReport />}
          {activeTab === 'r3' && <MovementTraceability />}
          {activeTab === 'r4' && <DisinfectionCompliance />}
          {activeTab === 'r5' && <PeriodicAssessmentReport />}
          {activeTab === 'r6' && <DeviceHealthReport />}
          {activeTab === 'r7' && <ZoneViolationHeatmap />}
          {activeTab === 'r8' && <IncidentRootCause />}
          {activeTab === 'r9' && <SupplyBiosecurity />}
          {activeTab === 'r10' && <FarmBenchmark />}
        </div>
      </div>
    </div>
  );
}
