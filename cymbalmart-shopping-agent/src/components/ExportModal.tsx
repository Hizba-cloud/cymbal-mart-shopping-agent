import React, { useState } from 'react';
import { useParty } from '../context/PartyContext';
import { 
  X, 
  Check, 
  Download, 
  Printer, 
  Smartphone
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, currentPlan } = useParty();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isExportModalOpen || !currentPlan) return null;

  const { profile, items, signatureRecipes, totalEstimatedCost } = currentPlan;

  // Format 1: Clean Mobile Checklist for Notes / SMS
  const generateNotesText = () => {
    let text = `✦ ${profile.name} — Master Procurement Manifest\n`;
    text += `Capacity: ${profile.adultsCount} Adults, ${profile.kidsCount} Children | Duration: ${profile.durationHours} Hours\n`;
    text += `Target Budget: $${profile.budgetTotal} | Estimated Total: $${totalEstimatedCost.toFixed(2)}\n\n`;

    const categories = ['beverages', 'food_catering', 'tableware_essentials', 'decor_theme', 'entertainment_favors', 'ice_perishables'];
    const catTitles: Record<string, string> = {
      beverages: 'BEVERAGES & SPIRITS',
      food_catering: 'PROVISIONS & CATERING',
      tableware_essentials: 'TABLEWARE & SERVICE',
      decor_theme: 'ATMOSPHERE & DECOR',
      entertainment_favors: 'GAMES & FAVORS',
      ice_perishables: 'COLD STORAGE & ICE',
    };

    categories.forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      if (catItems.length > 0) {
        text += `\n[ ${catTitles[cat] || cat.toUpperCase()} ]\n`;
        catItems.forEach(i => {
          text += `${i.isBought ? '[✓]' : '[ ]'} ${i.name} — ${i.quantity} ${i.unit} (~$${(i.estimatedPrice * (i.quantity || 1)).toFixed(2)})\n`;
        });
      }
    });

    if (signatureRecipes.length > 0) {
      text += `\n\n[ SIGNATURE CURATIONS ]\n`;
      signatureRecipes.forEach(r => {
        text += `• ${r.name} (${r.servings} servings)\n`;
      });
    }

    return text;
  };

  const handleCopyNotes = () => {
    const text = generateNotesText();
    navigator.clipboard.writeText(text);
    setCopiedFormat('notes');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownloadCSV = () => {
    let csv = 'Item Name,Category,Quantity,Unit,Estimated Unit Price,Total Cost,Store,Dietary Tags,Priority,Status\n';
    items.forEach(i => {
      const total = (i.estimatedPrice * (i.quantity || 1)).toFixed(2);
      const badges = `"${i.dietaryBadges.join(', ')}"`;
      const cleanName = `"${i.name.replace(/"/g, '""')}"`;
      csv += `${cleanName},${i.category},${i.quantity},${i.unit},${i.estimatedPrice},${total},${i.storeCategory},${badges},${i.priority},${i.isBought ? 'Bought' : 'Needed'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${profile.name.toLowerCase().replace(/\s+/g, '_')}_shopping_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-black/20 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-black/50 font-bold">Distribution Engine</span>
            <h3 className="font-serif text-xl italic font-normal text-black mt-0.5">Export & Transmit Manifest</h3>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="text-black/40 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Card 1: Copy to Clipboard */}
          <button
            onClick={handleCopyNotes}
            className="p-4 bg-[#FDFCFB] border border-black/15 hover:border-black flex flex-col items-center text-center gap-2.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-[#F4F1EA] text-black flex items-center justify-center transition-transform group-hover:scale-105">
              {copiedFormat === 'notes' ? <Check className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-black block">
                {copiedFormat === 'notes' ? 'Copied' : 'Copy Text'}
              </span>
              <span className="text-[10px] text-black/50 font-sans">
                Formatted checklist
              </span>
            </div>
          </button>

          {/* Card 2: Download CSV */}
          <button
            onClick={handleDownloadCSV}
            className="p-4 bg-[#FDFCFB] border border-black/15 hover:border-black flex flex-col items-center text-center gap-2.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-[#F4F1EA] text-black flex items-center justify-center transition-transform group-hover:scale-105">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-black block">
                Spreadsheet
              </span>
              <span className="text-[10px] text-black/50 font-sans">
                CSV dataset format
              </span>
            </div>
          </button>

          {/* Card 3: Print View */}
          <button
            onClick={handlePrint}
            className="p-4 bg-[#FDFCFB] border border-black/15 hover:border-black flex flex-col items-center text-center gap-2.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-[#F4F1EA] text-black flex items-center justify-center transition-transform group-hover:scale-105">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-black block">
                Print
              </span>
              <span className="text-[10px] text-black/50 font-sans">
                Physical ledger
              </span>
            </div>
          </button>

        </div>

        {/* Text Preview Box */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-black/50 uppercase tracking-[0.2em] block font-sans">
            Plaintext Manifest Preview:
          </span>
          <textarea
            readOnly
            value={generateNotesText()}
            rows={7}
            className="w-full bg-[#FAF9F6] border border-black/15 p-3 text-[11px] text-black font-mono focus:outline-none resize-none select-all"
          />
        </div>

      </div>
    </div>
  );
};

