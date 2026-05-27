"use client";

import { useState, useMemo, useRef } from "react";
import { Search, ShoppingCart, User, Plus, Minus, Trash2, Banknote, CreditCard, QrCode, Save, X, Printer, ScanLine } from "lucide-react";
import BarcodeScanner from "./BarcodeScanner";
import { createSale } from "@/lib/actions/sale";
import { useReactToPrint } from "react-to-print";
import { ReceiptTemplate } from "./ReceiptTemplate";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CashierViewProps {
  products: any[];
  customers: any[];
  settings?: any;
}

export default function CashierView({ products, customers, settings }: CashierViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS'>("CASH");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRef, setLastRef] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [paymentProvider, setPaymentProvider] = useState("");
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const [lastCart, setLastCart] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    const lowerSearch = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) || 
      p.sku.toLowerCase().includes(lowerSearch) ||
      p.barcode?.includes(lowerSearch)
    ).slice(0, 10);
  }, [search, products]);

  const addToCart = (product: any, variant: any = null) => {
    const cartId = variant ? `${product._id}-${variant._id}` : product._id;
    const existingIndex = cart.findIndex(item => item.cartId === cartId);

    // Get current price
    const priceObj = variant ? product.prices?.find((p: any) => p.variant_id === variant._id) : product.prices?.find((p: any) => !p.variant_id);
    const original_price = priceObj?.sell_price || 0;
    const discount_price = priceObj?.discount_price || 0;
    const final_price = discount_price > 0 ? discount_price : original_price;

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartId,
        product_id: product._id,
        variant_id: variant?._id || null,
        name: product.name,
        variant_name: variant?.name || null,
        unit_price: final_price,
        original_price: discount_price > 0 ? original_price : null,
        quantity: 1,
        image_url: product.image_url
      }]);
    }
    setSearch("");
  };

  const updateQty = (cartId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const taxPercentage = settings?.tax_percentage ?? 11;
  const tax = Math.round(totalPrice * (taxPercentage / 100));
  const grandTotal = totalPrice + tax - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const numericPaid = typeof paidAmount === 'number' ? paidAmount : 0;
    if (paymentMethod === 'CASH' && numericPaid > 0 && numericPaid < grandTotal) {
      alert("Uang dibayarkan kurang dari total tagihan!");
      return;
    }

    setLoading(true);
    try {
      const changeAmount = paymentMethod === 'CASH' && numericPaid > 0 ? numericPaid - grandTotal : 0;
      
      const saleData = {
        customer_id: customerId,
        total_price: totalPrice,
        tax,
        discount,
        grand_total: grandTotal,
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        paid_amount: numericPaid > 0 ? numericPaid : grandTotal,
        change_amount: Math.max(0, changeAmount),
        items: cart
      };
      const res = await createSale(saleData);
      if (res.success) {
        setLastRef(res.reference_no);
        setLastSaleData(res.sale);
        setLastCart([...cart]);
        setShowSuccess(true);
        setCart([]);
        setCustomerId("");
        setDiscount(0);
        setPaidAmount("");
        setPaymentProvider("");
      }
    } catch (err) {
      alert("Checkout gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = (result: string) => {
    setSearch(result);
    // Find if exactly one product matches, maybe add it instantly if desired,
    // but the requirement says "otomatis mengisi kolom pencarian dan memperbarui daftar produk". 
    // Setting the state accomplishes this.
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 overflow-hidden">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input 
              type="text" 
              disabled={loading}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-600 focus:border-indigo-600 block w-full ps-10 pe-12 p-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              placeholder="Cari Produk atau Kode SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="absolute inset-y-0 end-2 flex items-center">
              <button 
                onClick={() => setShowScanner(true)}
                title="Scan Barcode via Kamera"
                className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              >
                <ScanLine className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {search ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(p => (
                p.is_variant ? (
                  p.variants?.map((v: any) => (
                    <button 
                      key={`${p._id}-${v._id}`}
                      onClick={() => addToCart(p, v)}
                      className="flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} width={48} height={48} className="object-cover rounded-lg" />
                        ) : (
                          <ShoppingCart className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-indigo-600">Varian: {v.name}</div>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const pr = p.prices?.find((priceObj: any) => priceObj.variant_id === v._id);
                          const sellPrice = pr?.sell_price || 0;
                          const discPrice = pr?.discount_price || 0;
                          if (discPrice > 0) {
                            return (
                              <>
                                <div className="text-[10px] text-gray-400 line-through">Rp {sellPrice.toLocaleString()}</div>
                                <div className="font-bold text-red-600">Rp {discPrice.toLocaleString()}</div>
                              </>
                            );
                          }
                          return <div className="font-bold text-indigo-600">Rp {sellPrice.toLocaleString()}</div>;
                        })()}
                      </div>
                    </button>
                  ))
                ) : (
                  <button 
                    key={p._id}
                    onClick={() => addToCart(p)}
                    className="flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                       {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} width={48} height={48} className="object-cover rounded-lg" />
                        ) : (
                          <ShoppingCart className="text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.sku}</div>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const pr = p.prices?.find((priceObj: any) => !priceObj.variant_id);
                        const sellPrice = pr?.sell_price || 0;
                        const discPrice = pr?.discount_price || 0;
                        if (discPrice > 0) {
                          return (
                            <>
                              <div className="text-[10px] text-gray-400 line-through">Rp {sellPrice.toLocaleString()}</div>
                              <div className="font-bold text-red-600">Rp {discPrice.toLocaleString()}</div>
                            </>
                          );
                        }
                        return <div className="font-bold text-indigo-600">Rp {sellPrice.toLocaleString()}</div>;
                      })()}
                    </div>
                  </button>
                )
              ))}
              {filteredProducts.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">Produk tidak ditemukan.</div>}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 italic">
              <Search className="w-16 h-16 mb-4" />
              <p>Masukkan kata kunci untuk mencari produk</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Keranjang Belanja</span>
          </div>
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{cart.length} Item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map((item) => (
            <div key={item.cartId} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</div>
                {item.variant_name && <div className="text-[10px] text-indigo-600 truncate">{item.variant_name}</div>}
                <div className="flex items-baseline gap-1 mt-1">
                  {item.original_price && <span className="text-[10px] text-gray-400 line-through">Rp {item.original_price.toLocaleString()}</span>}
                  <div className={`text-xs font-bold ${item.original_price ? 'text-red-500' : 'text-indigo-600'}`}>Rp {item.unit_price.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={loading} onClick={() => updateQty(item.cartId, -1)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"><Minus className="w-3 h-3" /></button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button disabled={loading} onClick={() => updateQty(item.cartId, 1)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                <button disabled={loading} onClick={() => removeFromCart(item.cartId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-1 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
               <p className="text-sm">Keranjang masih kosong</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2 mb-4">
             <div className="flex justify-between items-center text-sm text-gray-500">
               <span>Total</span>
               <span>Rp {totalPrice.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-gray-500">
               <span>Pajak (PPN {taxPercentage}%)</span>
               <span>Rp {tax.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
               <span>Grand Total</span>
               <span className="text-indigo-600 font-black">Rp {grandTotal.toLocaleString()}</span>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
             <button 
               disabled={loading}
               onClick={() => { setPaymentMethod('CASH'); setPaymentProvider(""); }}
               className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all disabled:opacity-50 ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}
             >
               <Banknote className="w-5 h-5 mb-1" /> TUNAI
             </button>
             <button 
               disabled={loading}
               onClick={() => { setPaymentMethod('TRANSFER'); setPaymentProvider(""); }}
               className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all disabled:opacity-50 ${paymentMethod === 'TRANSFER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}
             >
               <CreditCard className="w-5 h-5 mb-1" /> BANK
             </button>
             <button 
               disabled={loading}
               onClick={() => { setPaymentMethod('QRIS'); setPaymentProvider(""); }}
               className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-bold transition-all disabled:opacity-50 ${paymentMethod === 'QRIS' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}
             >
               <QrCode className="w-5 h-5 mb-1" /> QRIS
             </button>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Uang Diterima (Rp)</label>
              <input 
                type="number"
                disabled={loading}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-indigo-600 focus:border-indigo-600 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 50000 (Kosongkan bila Pas)"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value ? parseInt(e.target.value) : "")}
              />
              {typeof paidAmount === 'number' && paidAmount > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 font-bold dark:text-gray-400">Kembalian</span>
                  <span className={`text-sm font-bold ${paidAmount - grandTotal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Rp {(paidAmount - grandTotal).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'TRANSFER' && (
            <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
               <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pilih Bank</label>
               <select disabled={loading} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)}>
                 <option value="">- Pilih Bank -</option>
                 <option value="BCA">BCA</option>
                 <option value="Mandiri">Mandiri</option>
                 <option value="BNI">BNI</option>
                 <option value="BRI">BRI</option>
                 <option value="Lainnya">Bank Lainnya</option>
               </select>
            </div>
          )}

          {paymentMethod === 'QRIS' && (
             <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
               <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Penyedia QRIS</label>
               <select disabled={loading} className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)}>
                 <option value="">- Pilih Provider -</option>
                 <option value="Gopay">Gopay</option>
                 <option value="OVO">OVO</option>
                 <option value="Dana">Dana</option>
                 <option value="ShopeePay">ShopeePay</option>
                 <option value="LinkAja">LinkAja</option>
                 <option value="QRIS Bank">QRIS Mobile Banking</option>
               </select>
            </div>
          )}

          <button 
            disabled={loading || cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? "PROSES..." : <><Save className="w-5 h-5" /> BAYAR SEKARANG</>}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center max-h-[95vh] overflow-y-auto flex flex-col">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shrink-0">
                <Save className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Transaksi Berhasil!</h3>
              <p className="text-gray-500 text-sm mb-4">Ref: <span className="font-bold text-gray-900 dark:text-white">{lastRef}</span></p>
              
              {/* Receipt Preview */}
              <div className="mb-6 bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-inner flex justify-center w-full min-h-[300px]">
                <div className="scale-90 origin-top h-[350px] overflow-y-auto scrollbar-hide py-2 w-full flex justify-center bg-white shadow">
                  <ReceiptTemplate ref={receiptRef} sale={lastSaleData} items={lastCart} userSettings={settings} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button 
                  onClick={() => handlePrint()}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-5 h-5" /> Cetak
                </button>
                <button 
                  onClick={() => setShowSuccess(false)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                >
                  Transaksi Baru
                </button>
              </div>
           </div>
        </div>
      )}

      {/* WebCam Barcode Scanner */}
      {showScanner && (
        <BarcodeScanner 
          onResult={handleScanResult} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}
