import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { CreateQR } from './pages/CreateQR';
import { QRCodes } from './pages/QRCodes';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="container mx-auto px-4 py-8 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateQR />} />
              <Route path="/qrcodes" element={<QRCodes />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
