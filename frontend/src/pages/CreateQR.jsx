import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { qrService } from '../services/api';
import { Button, Input, Label, Select, Card, CardContent } from '../components/ui';
import { QrCode, Loader2, Check } from 'lucide-react';

const QR_TYPES = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'circle', label: 'Circle' },
  { value: 'frame', label: 'Frame' },
  { value: 'scanme', label: 'Scan Me' },
];

export function CreateQR() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [createdQR, setCreatedQR] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destinationUrl: '',
    qrType: 'square',
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    frameText: ''
  });

  useEffect(() => {
    // Check if editing
    const state = location.state;
    if (state?.editMode && state?.qr) {
      setEditMode(true);
      setFormData({
        title: state.qr.title || '',
        destinationUrl: state.qr.destinationUrl || '',
        qrType: state.qr.qrType || 'square',
        foregroundColor: state.qr.foregroundColor || '#000000',
        backgroundColor: state.qr.backgroundColor || '#FFFFFF',
        frameText: state.qr.frameText || ''
      });
      setCreatedQR(state.qr);
      if (state.qr.qrImage) {
        setQrImage(state.qr.qrImage);
      }
    }
  }, [location.state]);

  const generateQRPreview = async () => {
    try {
      const domain = import.meta.env.VITE_DOMAIN || 'http://localhost:5000';
      const tempRedirectUrl = `${domain}/r/preview`;
      
      const dataUrl = await QRCode.toDataURL(tempRedirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: formData.foregroundColor,
          light: formData.backgroundColor
        }
      });
      setQrImage(dataUrl);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  useEffect(() => {
    if (formData.destinationUrl && !editMode) {
      generateQRPreview();
    }
  }, [formData.foregroundColor, formData.backgroundColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      if (editMode && createdQR) {
        // Update existing QR
        await qrService.updateQR(createdQR.code, {
          title: formData.title,
          destinationUrl: formData.destinationUrl,
          qrType: formData.qrType,
          foregroundColor: formData.foregroundColor,
          backgroundColor: formData.backgroundColor,
          frameText: formData.frameText
        });
        
        alert('QR Code updated successfully!');
        navigate('/qrcodes');
      } else {
        // Create new QR
        const response = await qrService.createQR(formData);
        setCreatedQR(response.data);
        setQrImage(response.data.qrImage);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format) => {
    if (!qrImage) return;
    
    const link = document.createElement('a');
    link.download = `qr-${createdQR?.code || 'preview'}.${format}`;
    link.href = qrImage;
    link.click();
  };

  const handleCopyUrl = async () => {
    if (!createdQR) return;
    
    const domain = import.meta.env.VITE_DOMAIN || 'http://localhost:5000';
    const redirectUrl = `${domain}/r/${createdQR.code}`;
    
    await navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{editMode ? 'Edit QR Code' : 'Create QR Code'}</h1>
        <p className="text-muted-foreground">Generate dynamic QR codes that can be edited anytime</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="My QR Code"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL</Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrType">QR Style</Label>
                <Select
                  id="qrType"
                  value={formData.qrType}
                  onChange={(e) => setFormData({ ...formData, qrType: e.target.value })}
                >
                  {QR_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fgColor">Foreground Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="fgColor"
                      value={formData.foregroundColor}
                      onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                      className="w-10 h-10 rounded border"
                    />
                    <Input
                      value={formData.foregroundColor}
                      onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="bgColor"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded border"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {formData.qrType === 'frame' && (
                <div className="space-y-2">
                  <Label htmlFor="frameText">Frame Text</Label>
                  <Input
                    id="frameText"
                    placeholder="Scan me!"
                    value={formData.frameText}
                    onChange={(e) => setFormData({ ...formData, frameText: e.target.value })}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editMode ? 'Update QR Code' : 'Generate QR Code'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">QR Preview</h3>
              
              {qrImage ? (
                <div className="space-y-4">
                  <img 
                    src={qrImage} 
                    alt="QR Preview"
                    className="mx-auto max-w-[300px] rounded-lg border"
                  />
                  
                  {createdQR && (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Short URL:</p>
                        <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                          {`${import.meta.env.VITE_DOMAIN || 'http://localhost:5000'}/r/${createdQR.code}`}
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleCopyUrl}
                        className="w-full"
                      >
                        {copied ? <Check className="h-4 w-4 mr-2" /> : null}
                        {copied ? 'Copied!' : 'Copy URL'}
                      </Button>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleDownload('png')}
                          className="flex-1"
                        >
                          Download PNG
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleDownload('svg')}
                          className="flex-1"
                        >
                          Download SVG
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
