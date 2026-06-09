// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Toast, useToast } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Components from './pages/Components';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Revenue from './pages/Revenue';

export default function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard addToast={addToast} />} />
            <Route path="/components" element={<Components addToast={addToast} />} />
            <Route path="/vehicles" element={<Vehicles addToast={addToast} />} />
            <Route path="/services" element={<Services addToast={addToast} />} />
            <Route path="/services/:id" element={<ServiceDetail addToast={addToast} />} />
            <Route path="/revenue" element={<Revenue addToast={addToast} />} />
          </Routes>
        </main>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </BrowserRouter>
  );
}
