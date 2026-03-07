import { useState, useEffect } from 'react';
import { qrService } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { Card, CardContent } from '../components/ui';
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await qrService.getOverallAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="text-muted-foreground">Track your QR code performance</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total QR Codes"
          value={analytics?.totalQRCodes || 0}
          icon={BarChart3}
          description={`${analytics?.activeQRCodes || 0} active`}
        />
        <StatsCard
          title="Total Scans"
          value={analytics?.totalScans || 0}
          icon={TrendingUp}
          description="All time scans"
        />
        <StatsCard
          title="Average Scans per QR"
          value={
            analytics?.totalQRCodes > 0
              ? Math.round(analytics.totalScans / analytics.totalQRCodes)
              : 0
          }
          icon={BarChart3}
          description="Per QR code average"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Recent QR Codes</h3>
            {analytics?.recentQRCodes && analytics.recentQRCodes.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentQRCodes.map((qr) => (
                  <div key={qr.code} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{qr.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-full sm:max-w-[200px]">
                        {qr.destinationUrl}
                      </p>
                    </div>
                    <div className="text-center sm:text-right whitespace-nowrap">
                      <p className="text-sm font-semibold">{qr.scanCount} scans</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No QR codes yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing QRs</h3>
            {analytics?.recentQRCodes && analytics.recentQRCodes.length > 0 ? (
              <div className="space-y-4">
                {[...analytics.recentQRCodes]
                  .sort((a, b) => b.scanCount - a.scanCount)
                  .slice(0, 5)
                  .map((qr, index) => (
                    <div key={qr.code} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{qr.title}</p>
                        <p className="text-sm text-muted-foreground">{qr.scanCount} scans</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No QR codes yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
