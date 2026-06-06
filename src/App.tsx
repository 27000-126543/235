import React from 'react';
import { useHospitalStore } from './store/useHospitalStore';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Hospital3DScene from './components/Hospital3DScene';
import NotificationPanel from './components/NotificationPanel';
import OverviewPanel from './components/panels/OverviewPanel';
import OutpatientPanel from './components/panels/OutpatientPanel';
import InpatientPanel from './components/panels/InpatientPanel';
import EmergencyPanel from './components/panels/EmergencyPanel';
import PharmacyPanel from './components/panels/PharmacyPanel';
import OperatingPanel from './components/panels/OperatingPanel';
import CSSDPanel from './components/panels/CSSDPanel';
import WastePanel from './components/panels/WastePanel';
import EmergencyPlanPanel from './components/panels/EmergencyPlanPanel';

const App: React.FC = () => {
  const { isLoggedIn, currentView } = useHospitalStore();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  const renderPanel = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewPanel />;
      case 'outpatient':
        return <OutpatientPanel />;
      case 'inpatient':
        return <InpatientPanel />;
      case 'emergency':
        return <EmergencyPanel />;
      case 'pharmacy':
        return <PharmacyPanel />;
      case 'operating':
        return <OperatingPanel />;
      case 'cssd':
        return <CSSDPanel />;
      case 'waste':
        return <WastePanel />;
      case 'emergencyPlan':
        return <EmergencyPlanPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-dark">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Hospital3DScene />
          </div>
          <div className="w-[480px] border-l border-info/20 overflow-hidden">
            {renderPanel()}
          </div>
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default App;
