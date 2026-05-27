"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

function Barcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.5,
          height: 35,
          displayValue: true,
          fontSize: 12,
          margin: 0,
          background: "transparent",
        });
      } catch (e) {
        console.error("Invalid barcode value", value);
      }
    }
  }, [value]);

  return <svg ref={svgRef} className="max-w-full h-auto"></svg>;
}

export default function PrintLabelsClient({ labels }: { labels: any[] }) {
  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white text-black font-sans">
      <div className="print-container max-w-[210mm] mx-auto bg-white p-8 shadow-lg print:shadow-none print:p-0 print:max-w-none">
        
        {/* Header - Only visible on screen */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Cetak Label Harga</h1>
            <p className="text-gray-500 text-sm">Gunakan rasio kertas A4 untuk hasil cetak maksimal.</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition-colors"
          >
            Print Sekarang
          </button>
        </div>

        {/* Labels Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2">
          {labels.length > 0 ? (
            labels.map((label, index) => (
              <div 
                key={`${label.id}-${index}`} 
                className="border-2 border-dashed border-gray-300 outline outline-1 outline-gray-200 print:outline-none p-3 rounded-xl flex flex-col justify-between items-center bg-white" 
                style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
              >
                <div className="text-center w-full mb-2">
                  <div className="font-bold text-[13px] leading-tight line-clamp-2 uppercase min-h-[26px]">
                    {label.name}
                  </div>
                  {label.variant_name && (
                    <div className="text-[11px] text-gray-600 truncate mt-0.5 font-medium">
                      {label.variant_name}
                    </div>
                  )}
                </div>
                
                <div className="my-1 flex justify-center w-full bg-white px-2 py-1 rounded">
                  {label.barcode ? (
                    <Barcode value={label.barcode} />
                  ) : (
                    <div className="text-xs text-red-500 italic h-[35px] flex items-center">No Barcode</div>
                  )}
                </div>
                
                <div className="font-extrabold text-[#000] text-lg mt-2 tracking-tight flex flex-col items-center">
                  {label.discount_price > 0 ? (
                    <>
                       <span className="text-[10px] text-gray-500 line-through font-normal mb-0.5">
                         Rp {label.price.toLocaleString('id-ID')}
                       </span>
                       <span className="text-red-600">
                         Rp {label.discount_price.toLocaleString('id-ID')}
                       </span>
                    </>
                  ) : (
                    <span>Rp {label.price.toLocaleString('id-ID')}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 print:hidden">
              Data label tidak ditemukan.
            </div>
          )}
        </div>
      </div>
      
      {/* Print Specific Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
