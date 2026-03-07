import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { QRCard } from '../components/QRCard';
import { Button, Input } from '../components/ui';
import { QrCode, BarChart3, Link as LinkIcon, Loader2 } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [qrcodes, setQrcodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, qrcodesRes] = await Promise.all([
        qrService.getOverallAnalytics(),
        qrService.getAllQRs({ limit: 5 })
      ]);
      
      setAnalytics(analyticsRes.data);
      setQrcodes(qrcodesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;

    try {
      await qrService.deleteQR(code);
      setQrcodes(qrcodes.filter(qr => qr.code !== code));
      alert('QR Code deleted successfully!');
      // Reload analytics to update counts
      const analyticsRes = await qrService.getOverallAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Failed to delete QR code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your QR Code Generator</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total QR Codes"
          value={analytics?.totalQRCodes || 0}
          icon={QrCode}
          description={`${analytics?.activeQRCodes || 0} active`}
        />
        <StatsCard
          title="Total Scans"
          value={analytics?.totalScans || 0}
          icon={BarChart3}
          description="All time scans"
        />
        <StatsCard
          title="Recent QRs"
          value={qrcodes.length}
          icon={LinkIcon}
          description="Last 5 created"
        />
      </div>

      {/* Recent QR Codes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent QR Codes</h2>
          <Button onClick={() => navigate('/qrcodes')}>View All</Button>
        </div>

        {qrcodes.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {qrcodes.map((qr) => (
              <QRCard
                key={qr.code}
                qr={qr}
                onUpdate={(qr) => navigate('/create', { state: { editMode: true, qr } })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No QR Codes Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first dynamic QR code</p>
            <Button onClick={() => navigate('/create')}>Create QR Code</Button>
          </div>
        )}
      </div>
    </div>
  );
}
