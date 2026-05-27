import React from 'react';

// Assuming 80mm generic styling
// Width: approx 300px for paper width simulation in browser, actual print takes full width of paper
// Monospace, generic printer styling

interface ReceiptProps {
  sale: any;
  items: any[];
  userSettings?: any;
}

export const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptProps>(({ sale, items, userSettings }, ref) => {
  if (!sale) return null;

  const dateStr = new Date(sale.createdAt || Date.now()).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div ref={ref} className="bg-white p-4 font-mono text-sm uppercase text-black max-w-[300px] mx-auto overflow-hidden">
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg mb-1">{userSettings?.store_name || "POS SYSTEM"}</h2>
        <p className="text-xs">{userSettings?.store_address || "Gedung Pusat, Lantai 1"}</p>
        <p className="text-xs">Telp: {userSettings?.store_phone || "0812345678"}</p>
        {userSettings?.tax_id && (
          <p className="text-xs mt-1">NPWP: {userSettings.tax_id}</p>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>
      
      <div className="text-xs mb-2">
        <div className="flex justify-between">
          <span>NO: {sale.reference_no}</span>
        </div>
        <div className="flex justify-between">
          <span>WAKTU: {dateStr}</span>
        </div>
        <div className="flex justify-between">
          <span>KASIR: {sale.user_id?.name || "KASIR-01"}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="mb-2 w-full">
        {items.map((item, idx) => (
          <div key={idx} className="mb-1">
            <div className="font-bold">{item.name} {item.variant_name ? `(${item.variant_name})` : ''}</div>
            <div className="flex justify-between w-full">
              <span>{item.quantity} x {item.unit_price.toLocaleString('id-ID')}</span>
              <span>{(item.quantity * item.unit_price).toLocaleString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="text-xs mb-2 space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL</span>
          <span>{sale.total_price.toLocaleString('id-ID')}</span>
        </div>
        
        {sale.discount > 0 && (
          <div className="flex justify-between">
            <span>DISKON</span>
            <span>-{sale.discount.toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {sale.tax > 0 && (
          <div className="flex justify-between">
            <span>PAJAK</span>
            <span>{sale.tax.toLocaleString('id-ID')}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-sm mt-1">
          <span>TOTAL</span>
          <span>{sale.grand_total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      <div className="text-xs mb-4 space-y-1">
        <div className="flex justify-between font-bold">
          <span>METODE</span>
          <span>{sale.payment_method}</span>
        </div>
        
        {sale.payment_provider && (
          <div className="flex justify-between">
            <span>PROVIDER</span>
            <span>{sale.payment_provider}</span>
          </div>
        )}

        {sale.payment_method === 'CASH' && sale.paid_amount !== undefined && (
          <>
            <div className="flex justify-between">
              <span>TUNAI</span>
              <span>{sale.paid_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>KEMBALI</span>
              <span>{(sale.change_amount || 0).toLocaleString('id-ID')}</span>
            </div>
          </>
        )}
      </div>

      <div className="text-center text-xs mt-6 mb-2">
        <p className="whitespace-pre-wrap">
          {userSettings?.receipt_footer || "TERIMA KASIH ATAS KUNJUNGAN ANDA"}
        </p>
      </div>
      <div className="text-center font-mono text-[10px] mt-4">
        Powered by POS Advance
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';
