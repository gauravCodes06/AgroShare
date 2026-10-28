import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Truck,
  ArrowLeft
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { formatINR } from "../utils/formatters";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const refId = `F2V-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderRef(refId);
    setCheckoutComplete(true);
    clearCart();
    toast.success(`Demo Order Placed! Ref: ${refId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F5] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5EAE5]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-1">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </div>
            <h1 className="text-3xl font-black text-[#17231D] tracking-tight">
              Your Farm Basket
            </h1>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-bold text-[#15803D] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
        </div>

        {/* ─── State 1: Order Completed Demo Screen ────────────────────────── */}
        {checkoutComplete ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E5EAE5] shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#15803D] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#17231D]">
                Order Confirmed (Demo)
              </h2>
              <p className="text-xs font-mono font-bold text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full inline-block">
                Reference ID: {orderRef}
              </p>
            </div>

            <p className="text-xs text-[#647067] leading-relaxed">
              Thank you for supporting smallholder farmers. The farmer has received your delivery request. 
              (This is an MVP demonstration simulation; no actual credit card was billed).
            </p>

            <div className="pt-4 flex gap-3">
              <Link
                to="/marketplace"
                className="flex-1 py-3 px-4 rounded-xl bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534]"
              >
                Return to AgroMarket
              </Link>
              <Link
                to="/dashboard"
                className="py-3 px-4 rounded-xl border border-[#E5EAE5] text-[#17231D] text-xs font-semibold hover:bg-gray-50"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : cart.length > 0 ? (
          /* ─── State 2: Active Cart View ─────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items List (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
                <h3 className="font-bold text-sm text-[#17231D]">
                  Cart Items ({cart.length})
                </h3>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#17231D]">
                          {product.name}
                        </h4>
                        <span className="text-[11px] text-gray-500">
                          {formatINR(product.price)} / {product.unit} · {product.farmer}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Qty Adjusters */}
                      <div className="flex items-center gap-2 bg-[#F7F9F5] px-2 py-1 rounded-lg border border-[#E5EAE5]">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#17231D] min-w-[16px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-black text-xs sm:text-sm text-[#15803D] min-w-[60px] text-right">
                        {formatINR(product.price * quantity)}
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E5EAE5] shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#17231D] pb-3 border-b border-[#E5EAE5]">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Produce Subtotal:</span>
                  <span className="font-bold text-[#17231D]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Direct Farm Delivery:</span>
                  <span className="font-semibold text-emerald-700">
                    {deliveryCharge === 0 ? "Free Delivery" : formatINR(deliveryCharge)}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[10px] text-gray-400">
                    Add {formatINR(500 - subtotal)} more for free farm delivery.
                  </p>
                )}
                <div className="pt-3 border-t border-[#E5EAE5] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#17231D]">Total Amount:</span>
                  <span className="text-2xl font-black text-[#15803D]">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>Demonstration Checkout:</strong> Simulates placing direct orders without actual payment gateways.
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirm Demo Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* ─── State 3: Empty Cart View ───────────────────────────────────── */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EAE5] max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#17231D]">Your Basket is Empty</h3>
            <p className="text-xs text-[#647067]">
              You haven't added any fresh farm produce or value-added goods to your basket yet.
            </p>
            <Link
              to="/marketplace"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#15803D] text-white text-xs font-bold hover:bg-[#166534]"
            >
              Explore AgroMarket
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
