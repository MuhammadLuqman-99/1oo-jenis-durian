'use client';

import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TreeInfo } from '@/types/tree';
import Button from '@/components/shared/Button';

interface QRCodeGeneratorProps {
  trees: TreeInfo[];
}

export default function QRCodeGenerator({ trees }: QRCodeGeneratorProps) {
  const handlePrintQR = (tree: TreeInfo) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const updateUrl = `${window.location.origin}/admin/tree-update?id=${tree.id}`;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${tree.variety}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              h1 { font-size: 24px; margin-bottom: 10px; }
              p { margin: 5px 0; color: #666; }
              .qr-container {
                margin: 20px auto;
                padding: 20px;
                border: 4px solid #000;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <h1>${tree.variety}</h1>
            <p><strong>Tree ID:</strong> ${tree.id}</p>
            <p><strong>Zone:</strong> ${tree.zone || "N/A"} | <strong>Row:</strong> ${tree.row || "N/A"}</p>
            <p><strong>Location:</strong> ${tree.location}</p>
            <div class="qr-container">
              ${document.querySelector(`#qr-${tree.id}`)?.innerHTML || ''}
            </div>
            <p style="margin-top: 20px;">Scan to update tree condition</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">📱 QR Code Tree Update System</h3>
        <p className="text-gray-700">
          Print these QR codes and attach them to trees. Scan with your phone to quickly update tree conditions from the field.
        </p>
      </div>

      {/* QR Code Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trees.map((tree) => {
          const updateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/tree-update?id=${tree.id}`;

          return (
            <div key={tree.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 mb-2">{tree.variety}</h4>
                <p className="text-sm text-gray-600 mb-4">ID: {tree.id}</p>

                {/* QR Code Display */}
                <div className="flex justify-center mb-4 p-4 bg-white border-4 border-gray-200 rounded-lg" aria-label={`QR code for ${tree.variety}`}>
                  <QRCodeSVG value={updateUrl} size={200} level="H" includeMargin={true} aria-hidden="true" />
                </div>

                {/* Tree Info */}
                <div className="text-xs text-gray-600 mb-4">
                  <p>Zone: {tree.zone || "N/A"}</p>
                  <p>Row: {tree.row || "N/A"}</p>
                  <p>Location: {tree.location}</p>
                </div>

                {/* Print Button */}
                <Button
                  variant="primary"
                  icon={QrCode}
                  fullWidth
                  onClick={() => handlePrintQR(tree)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  aria-label={`Print QR code for ${tree.variety}`}
                >
                  Print QR Code
                </Button>

                {/* Hidden QR for printing (higher resolution) */}
                <div id={`qr-${tree.id}`} style={{ display: 'none' }}>
                  <QRCodeSVG value={updateUrl} size={300} level="H" includeMargin={true} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
