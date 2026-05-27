"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    // Start scanner
    const startScanner = async () => {
      try {
        if (!scannerRef.current) return;
        
        html5QrCode.current = new Html5Qrcode(scannerRef.current.id, {
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ]
        });
        
        await html5QrCode.current.start(
          { facingMode: "environment" },
          {
            fps: 20,
            disableFlip: false,
          },
          (decodedText) => {
            if (isMounted) {
              // Pause scanner immediately upon success
              if (html5QrCode.current?.isScanning) {
                 html5QrCode.current.pause();
              }
              onResult(decodedText);
              // Stop it smoothly
              setTimeout(() => {
                onClose();
              }, 300);
            }
          },
          (errorMessage) => {
            // parse errors are normal and happen continuously when no QR code is in frame
          }
        );
      } catch (err: any) {
        if (isMounted) {
          console.error("Error starting scanner", err);
          setErrorMsg("Gagal mengakses kamera. Pastikan memberikan izin perangkat.");
        }
      }
    };
    
    startScanner();

    // Cleanup
    return () => {
      isMounted = false;
      if (html5QrCode.current?.isScanning) {
        html5QrCode.current.stop().catch(console.error);
      }
    };
  }, [onResult, onClose]);

  // CSS injection for scan line
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes scanner-sweep {
        0% { transform: translateY(0); }
        50% { transform: translateY(240px); }
        100% { transform: translateY(0); }
      }
      .animate-scan-line {
        animation: scanner-sweep 2.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm overflow-hidden bg-white/10 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/20 dark:border-gray-700 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            <span className="font-semibold tracking-wide text-sm">Scan Barcode</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-6 flex flex-col items-center">
          {errorMsg ? (
            <div className="text-red-400 text-center text-sm py-8 font-medium">
              {errorMsg}
            </div>
          ) : (
            <div className="w-full aspect-square rounded-2xl overflow-hidden ring-4 ring-indigo-500/50 shadow-2xl bg-black relative">
              <div 
                id="html5-qr-qrcode-scanner" 
                ref={scannerRef}
                className="w-full h-full [&>video]:object-cover"
              ></div>
              {/* Scanline animation */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-indigo-500 shadow-[0_0_12px_4px_rgba(99,102,241,0.8)] animate-scan-line pointer-events-none z-10" />
            </div>
          )}
          
          <p className="mt-6 text-sm text-center text-gray-200 font-medium tracking-wide leading-relaxed">
            Arahkan kamera ke Barcode produk.<br/>Sistem akan mencari secara otomatis.
          </p>
        </div>
        
      </div>
    </div>
  );
}
