import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './ui';

export function QRCard({ qr, onUpdate, onDelete }) {
  const [copied, setCopied] = useState(false);
  const domain = import.meta.env.VITE_DOMAIN || 'https://qrer.er';
  const redirectUrl = `${domain}/r/${qr.code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format) => {
    try {
      if (!qr.qrImage) {
        alert('QR code image not available. Please try refreshing the page.');
        return;
      }
      
      if (format === 'png') {
        // Download PNG directly from data URL
        const link = document.createElement('a');
        link.download = `qr-${qr.code}.png`;
        link.href = qr.qrImage;
        link.click();
      } else if (format === 'svg') {
        alert('SVG download coming soon! For now, please use PNG format.');
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">{qr.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-full sm:max-w-xs">
            {qr.destinationUrl}
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-xs text-muted-foreground">Scans</p>
          <p className="text-lg font-bold">{qr.scanCount || 0}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        {qr.qrImage && (
          <img 
            src={qr.qrImage} 
            alt="QR Code"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded border flex-shrink-0"
          />
        )}
        <div className="flex-1 space-y-2 w-full">
          <div className="text-xs">
            <p className="text-muted-foreground">Short URL:</p>
            <p className="font-mono text-xs sm:text-sm break-all">{redirectUrl}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="w-full"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy URL'}
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleDownload('png')}
          className="flex-1"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          PNG
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleDownload('svg')}
          className="flex-1"
        >
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          SVG
        </Button>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onUpdate(qr)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(qr.code)}
          className="flex-1"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
