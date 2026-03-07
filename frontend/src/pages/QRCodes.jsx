import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { qrService } from '../services/api';
import { QRCard } from '../components/QRCard';
import { Button, Input } from '../components/ui';
import { QrCode, Search, Loader2 } from 'lucide-react';

export function QRCodes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrcodes, setQrcodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadQRCodes();
  }, [pagination.page, searchTerm]);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const response = await qrService.getAllQRs({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      
      setQrcodes(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }));
    } catch (error) {
      console.error('Error loading QR codes:', error);
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
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Failed to delete QR code');
    }
  };

  const handleUpdate = (qr) => {
    navigate('/create', { state: { editMode: true, qr } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">QR Codes</h1>
          <p className="text-muted-foreground">Manage all your dynamic QR codes</p>
        </div>
        <Button onClick={() => navigate('/create')} className="w-full sm:w-auto">
          Create New QR
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* QR Codes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : qrcodes.length > 0 ? (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {qrcodes.map((qr) => (
              <QRCard
                key={qr.code}
                qr={qr}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Showing {qrcodes.length} of {pagination.total} QR codes
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="flex-1 sm:flex-none"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No QR Codes Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first dynamic QR code'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/create')}>Create QR Code</Button>
          )}
        </div>
      )}
    </div>
  );
}
