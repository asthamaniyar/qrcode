import { Card, CardContent } from '../components/ui';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Application Information</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Domain Configuration</p>
              <p className="text-muted-foreground">
                Production Domain: http://qrer.errorinfotech.in
              </p>
              <p className="text-muted-foreground">
                Local Development: http://localhost:5003
              </p>
              <p className="text-muted-foreground">
                Production: https://qrer.er
              </p>
            </div>
            
            <div>
              <p className="font-medium">QR Code Format</p>
              <p className="text-muted-foreground">
                All QR codes are generated with the format: https://qrer.er/r/{'{code}'}
              </p>
            </div>

            <div>
              <p className="font-medium">Database</p>
              <p className="text-muted-foreground">MongoDB</p>
            </div>

            <div>
              <p className="font-medium">Features</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Unlimited dynamic QR codes</li>
                <li>Edit destination URLs anytime</li>
                <li>Scan tracking and analytics</li>
                <li>PNG and SVG downloads</li>
                <li>Custom colors and styles</li>
                <li>QR code management dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
          <div className="space-y-2 text-sm font-mono bg-muted p-4 rounded">
            <div>
              <p className="font-semibold text-primary">POST /api/qr/create</p>
              <p className="text-muted-foreground">Create new QR code</p>
            </div>
            <div className="border-t pt-2">
              <p className="font-semibold text-primary">GET /api/qr</p>
              <p className="text-muted-foreground">Get all QR codes</p>
            </div>
            <div className="border-t pt-2">
              <p className="font-semibold text-primary">GET /api/qr/:code</p>
              <p className="text-muted-foreground">Get QR details</p>
            </div>
            <div className="border-t pt-2">
              <p className="font-semibold text-primary">PUT /api/qr/:code</p>
              <p className="text-muted-foreground">Update QR code</p>
            </div>
            <div className="border-t pt-2">
              <p className="font-semibold text-primary">DELETE /api/qr/:code</p>
              <p className="text-muted-foreground">Delete QR code</p>
            </div>
            <div className="border-t pt-2">
              <p className="font-semibold text-primary">GET /r/:code</p>
              <p className="text-muted-foreground">Redirect endpoint</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
