import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { FulfillmentType, CymbalOrderConfirmation } from '../types/party';
import { 
  X, 
  Check, 
  Car, 
  Truck, 
  MapPin, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  QrCode, 
  Calendar, 
  Copy, 
  Share2, 
  ArrowRight,
  CreditCard,
  Percent,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CymbalCheckoutModal: React.FC = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    currentPlan, 
    confirmCymbalOrder 
  } = useParty();

  const [fulfillment, setFulfillment] = useState<FulfillmentType>('curbside_pickup');
  const [selectedSlot, setSelectedSlot] = useState<string>('Today, 3:00 PM – 4:00 PM');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('742 Evergreen Terrace, North Valley');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Leave ice bags on shaded front porch in cooler');
  const [substitutionPref, setSubstitutionPref] = useState<'best_organic_match' | 'contact_first' | 'no_substitutions'>('best_organic_match');
  const [memberId, setMemberId] = useState<string>('CYMBAL-PLUS-8842');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<CymbalOrderConfirmation | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isCheckoutModalOpen || !currentPlan) return null;

  const { profile, items, totalEstimatedCost } = currentPlan;
  
  // Calculate member savings
  const totalMemberSavings = items.reduce((acc, it) => acc + (it.memberSavings || 1.25) * (it.quantity || 1), 0);
  const subtotal = totalEstimatedCost;
  const discountedSubtotal = Math.max(0, subtotal - totalMemberSavings);
  const estimatedTax = Number((discountedSubtotal * 0.0825).toFixed(2));
  const finalTotal = Number((discountedSubtotal + estimatedTax).toFixed(2));

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const orderId = `CYMBAL-FÊTE-${Math.floor(1000 + Math.random() * 9000)}`;
    const confirmation: CymbalOrderConfirmation = {
      orderId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scheduledTime: selectedSlot,
      fulfillmentType: fulfillment,
      pickupLocation: 'CymbalMart Supercenter #1042 — Curbside Bays 1–8',
      deliveryAddress: fulfillment === 'same_day_delivery' ? deliveryAddress : undefined,
      itemCount: items.length,
      subtotal,
      memberSavings: totalMemberSavings,
      estimatedTax,
      finalTotal,
      barcode: `*${orderId.replace(/[^0-9]/g, '') || '884210'}*`,
      status: 'confirmed',
      substitutionPreference: substitutionPref,
    };

    confirmCymbalOrder(confirmation);
    setConfirmedOrder(confirmation);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch (_) {}
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setConfirmedOrder(null);
  };

  const copyOrderCode = () => {
    if (!confirmedOrder) return;
    navigator.clipboard.writeText(confirmedOrder.orderId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-black/20 p-5 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">
                CymbalMart Express Fulfillment
              </span>
              <span className="px-2 py-0.5 bg-black text-white text-[9px] font-mono uppercase tracking-widest font-semibold">
                CUJ Checkout
              </span>
            </div>
            <h3 className="font-serif text-2xl italic font-normal text-black mt-1">
              {confirmedOrder ? 'Order Confirmed & Staged' : 'Finalize & Checkout Order'}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="text-black/40 hover:text-black transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmedOrder ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Success Banner */}
            <div className="p-5 bg-[#FAF9F6] border border-black/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif italic text-lg text-black font-semibold">
                      Party Manifest Transmitted
                    </h4>
                    <p className="text-[11px] text-black/60">
                      Your CymbalMart personal shopper is assembling your {confirmedOrder.itemCount} items.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold block">
                    Order Reference
                  </span>
                  <button
                    onClick={copyOrderCode}
                    className="font-mono text-sm font-bold text-black flex items-center gap-1 hover:text-neutral-700"
                    title="Click to copy order ID"
                  >
                    <span>{confirmedOrder.orderId}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-black/40" />}
                  </button>
                </div>
              </div>

              {/* Order Status Progress bar */}
              <div className="pt-3 border-t border-black/10">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-black/60 font-semibold mb-2">
                  <span className="text-black font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    1. Confirmed
                  </span>
                  <span className="text-black font-bold">2. Picking & Chilling</span>
                  <span className="opacity-40">3. Ready at Curbside</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-black" />
                </div>
              </div>
            </div>

            {/* Pickup Pass & Barcode */}
            <div className="p-6 bg-white border border-black/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold block">
                  Digital Pass & Scanner
                </span>
                <h5 className="font-serif text-lg text-black">
                  {confirmedOrder.fulfillmentType === 'curbside_pickup'
                    ? 'Express Curbside Pickup Bay Pass'
                    : confirmedOrder.fulfillmentType === 'same_day_delivery'
                    ? 'Contactless Local Delivery Track'
                    : 'In-Store Smart Route Navigation'}
                </h5>
                <p className="text-xs text-black/70">
                  {confirmedOrder.fulfillmentType === 'curbside_pickup'
                    ? `${confirmedOrder.pickupLocation} • Window: ${confirmedOrder.scheduledTime}`
                    : `Destination: ${confirmedOrder.deliveryAddress} • Window: ${confirmedOrder.scheduledTime}`}
                </p>
                <div className="inline-block px-2.5 py-1 bg-[#F4F1EA] text-black text-[10px] font-mono uppercase font-bold tracking-wider">
                  Substitution: {confirmedOrder.substitutionPreference.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Barcode Graphic */}
              <div className="p-4 bg-[#F8F7F4] border border-black/10 flex flex-col items-center gap-1 shrink-0">
                <div className="font-mono text-2xl tracking-[0.3em] font-black select-all">
                  ||||| | |||| ||| ||
                </div>
                <span className="font-mono text-[10px] tracking-widest text-black/60">
                  {confirmedOrder.orderId}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#FAF9F6] border border-black/10 space-y-2 text-xs">
              <div className="flex justify-between text-black/70">
                <span>Grocery Items ({confirmedOrder.itemCount} items)</span>
                <span className="font-mono">${confirmedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Cymbal Club Member Savings</span>
                <span className="font-mono">-${confirmedOrder.memberSavings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Estimated Sales Tax</span>
                <span className="font-mono">${confirmedOrder.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black border-t border-black/10 pt-2">
                <span>Total Paid</span>
                <span className="font-mono">${confirmedOrder.finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleClose}
                className="w-full sm:flex-1 py-3 px-4 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 transition-colors"
              >
                Return to Master Manifest
              </button>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto py-3 px-5 text-[11px] font-sans uppercase tracking-widest font-semibold border border-black/20 text-black hover:border-black transition-colors"
              >
                Print Receipt & Pass
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Config Form */
          <div className="space-y-6">
            
            {/* Step 1: Select Fulfillment Method */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-bold text-black/60 mb-3">
                1. Select CymbalMart Fulfillment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Pickup Option */}
                <button
                  type="button"
                  onClick={() => setFulfillment('curbside_pickup')}
                  className={`p-3.5 border text-left flex flex-col justify-between transition-all ${
                    fulfillment === 'curbside_pickup'
                      ? 'border-black bg-[#FAF9F6] shadow-xs'
                      : 'border-black/15 bg-white hover:border-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Car className="w-4 h-4 text-black" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold">
                      FREE
                    </span>
                  </div>
                  <div>
                    <h5 className="font-serif italic text-sm font-semibold text-black">Curbside Express</h5>
                    <p className="text-[10px] text-black/60 mt-0.5">Ready in 2h • Bays 1–8</p>
                  </div>
                </button>

                {/* Delivery Option */}
                <button
                  type="button"
                  onClick={() => setFulfillment('same_day_delivery')}
                  className={`p-3.5 border text-left flex flex-col justify-between transition-all ${
                    fulfillment === 'same_day_delivery'
                      ? 'border-black bg-[#FAF9F6] shadow-xs'
                      : 'border-black/15 bg-white hover:border-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-4 h-4 text-black" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-black/5 text-black font-bold">
                      $4.99
                    </span>
                  </div>
                  <div>
                    <h5 className="font-serif italic text-sm font-semibold text-black">Doorstep Delivery</h5>
                    <p className="text-[10px] text-black/60 mt-0.5">Same-day refrigerated</p>
                  </div>
                </button>

                {/* In-Store Walk Option */}
                <button
                  type="button"
                  onClick={() => setFulfillment('instore_smart_route')}
                  className={`p-3.5 border text-left flex flex-col justify-between transition-all ${
                    fulfillment === 'instore_smart_route'
                      ? 'border-black bg-[#FAF9F6] shadow-xs'
                      : 'border-black/15 bg-white hover:border-black/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-4 h-4 text-black" />
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-black/5 text-black font-bold">
                      MAP
                    </span>
                  </div>
                  <div>
                    <h5 className="font-serif italic text-sm font-semibold text-black">Smart Aisle Route</h5>
                    <p className="text-[10px] text-black/60 mt-0.5">Self-guided store tour</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Time Slot & Address details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F8F7F4] border border-black/10">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-bold text-black/60 mb-1.5">
                  Scheduled Time Window
                </label>
                <select
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value)}
                  className="w-full bg-white border border-black/15 px-3 py-2 text-xs text-black font-sans focus:outline-none focus:border-black"
                >
                  <option value="Today, 2:00 PM – 3:00 PM">Today, 2:00 PM – 3:00 PM</option>
                  <option value="Today, 3:00 PM – 4:00 PM">Today, 3:00 PM – 4:00 PM</option>
                  <option value="Today, 5:00 PM – 6:00 PM">Today, 5:00 PM – 6:00 PM (Pre-party rush)</option>
                  <option value="Tomorrow, 10:00 AM – 11:00 AM">Tomorrow, 10:00 AM – 11:00 AM</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-sans uppercase tracking-widest font-bold text-black/60 mb-1.5">
                  Cymbal Club Rewards Card #
                </label>
                <input
                  type="text"
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                  className="w-full bg-white border border-black/15 px-3 py-2 text-xs font-mono text-black focus:outline-none focus:border-black"
                  placeholder="CYMBAL-XXXX-XXXX"
                />
              </div>

              {fulfillment === 'same_day_delivery' && (
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-[10px] font-sans uppercase tracking-widest font-bold text-black/60">
                    Host Delivery Address & Gate/Cooler Instructions
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full bg-white border border-black/15 px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                    placeholder="Street address, City, Zip"
                  />
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    className="w-full bg-white border border-black/15 px-3 py-1.5 text-xs text-black/70 focus:outline-none focus:border-black"
                    placeholder="e.g. Leave ice bags in shaded front cooler"
                  />
                </div>
              )}
            </div>

            {/* Substitution policy */}
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-widest font-bold text-black/60 mb-2">
                2. Out-of-Stock Substitution Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'best_organic_match', label: 'Best Match / Organic', desc: 'Auto-substitute premium store brand' },
                  { id: 'contact_first', label: 'SMS Me First', desc: 'Shopper texts before replacing' },
                  { id: 'no_substitutions', label: 'No Substitutions', desc: 'Refund item if unavailable' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSubstitutionPref(opt.id as any)}
                    className={`p-3 border text-left transition-all ${
                      substitutionPref === opt.id
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 bg-white text-black hover:border-black/40'
                    }`}
                  >
                    <span className="font-semibold block text-[11px]">{opt.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${substitutionPref === opt.id ? 'text-white/70' : 'text-black/50'}`}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Order Review & Total */}
            <div className="p-4 bg-[#FAF9F6] border border-black/15 space-y-2.5">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-black/60">
                  Cart Order Summary ({items.length} Items for {profile.name})
                </span>
                <span className="text-xs font-mono font-bold text-black">
                  Budget Target: ${profile.budgetTotal}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-black/70">
                  <span>Store Catalog Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Cymbal Member Instant Savings
                  </span>
                  <span className="font-mono">-${totalMemberSavings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-black/70">
                  <span>Estimated Tax & Bags</span>
                  <span className="font-mono">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-black border-t border-black/10 pt-2">
                  <span>Final Charged Amount</span>
                  <span className="font-mono text-base">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 text-[11px] font-sans uppercase tracking-widest font-semibold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Routing Order to CymbalMart Supercenter #1042...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Confirm & Authorize CymbalMart Order (${finalTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
