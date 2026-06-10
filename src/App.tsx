/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { InboundDeal, OutboundDeal, InventoryItem, Destination } from "./types";
import { 
  initialInboundDeals, 
  initialOutboundDeals, 
  initialInventoryItems,
  initialDestinations
} from "./data";
import KpiCards from "./components/KpiCards";
import InboundTable from "./components/InboundTable";
import OutboundTable from "./components/OutboundTable";
import RealTimeInventoryWidget from "./components/RealTimeInventoryWidget";
import DestinationManager from "./components/DestinationManager";
import { 
  FileSpreadsheet, ShieldCheck, Truck, RefreshCcw, Info, ArrowUpRight, ListTodo 
} from "lucide-react";

export default function App() {
  // ---- 1. State Hub & Local Storage Integration ----
  const [inboundDeals, setInboundDeals] = useState<InboundDeal[]>(() => {
    const saved = localStorage.getItem("logistics_inbound");
    return saved ? JSON.parse(saved) : initialInboundDeals;
  });

  const [outboundDeals, setOutboundDeals] = useState<OutboundDeal[]>(() => {
    const saved = localStorage.getItem("logistics_outbound");
    return saved ? JSON.parse(saved) : initialOutboundDeals;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("logistics_inventory");
    return saved ? JSON.parse(saved) : initialInventoryItems;
  });

  const [destinations, setDestinations] = useState<Destination[]>(() => {
    const saved = localStorage.getItem("logistics_destinations");
    return saved ? JSON.parse(saved) : initialDestinations;
  });

  // Keep localStorage updated on adjustments
  useEffect(() => {
    localStorage.setItem("logistics_inbound", JSON.stringify(inboundDeals));
  }, [inboundDeals]);

  useEffect(() => {
    localStorage.setItem("logistics_outbound", JSON.stringify(outboundDeals));
  }, [outboundDeals]);

  useEffect(() => {
    localStorage.setItem("logistics_inventory", JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem("logistics_destinations", JSON.stringify(destinations));
  }, [destinations]);

  // ---- Destinations Handlers ----
  const handleAddDestinations = (newDests: Omit<Destination, "id">[]) => {
    setDestinations((prev) => {
      const added = newDests.map((d) => ({
        ...d,
        id: `dest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }));
      return [...prev, ...added];
    });
  };

  const handleClearAllDestinations = () => {
    setDestinations([]);
  };

  const handleRemoveDestination = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };


  // ---- 2. Inbound Table Handlers ----
  const handleAddInbound = (deal: Omit<InboundDeal, "id">) => {
    const newId = `in-${Date.now()}`;
    setInboundDeals((prev) => [...prev, { ...deal, id: newId }]);
  };

  const handleUpdateInbound = (id: string, updated: Partial<InboundDeal>) => {
    setInboundDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
  };

  const handleDeleteInbound = (id: string) => {
    setInboundDeals((prev) => prev.filter((d) => d.id !== id));
  };


  // ---- 3. Outbound Table Handlers ----
  const handleAddOutbound = (deal: Omit<OutboundDeal, "id">) => {
    const newId = `out-${Date.now()}`;
    setOutboundDeals((prev) => [...prev, { ...deal, id: newId }]);
  };

  const handleUpdateOutbound = (id: string, updated: Partial<OutboundDeal>) => {
    setOutboundDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
  };

  const handleDeleteOutbound = (id: string) => {
    setOutboundDeals((prev) => prev.filter((d) => d.id !== id));
  };


  // ---- 4. Inventory Widget Handlers ----
  const handleUpdateStock = (id: string, newLevel: number) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Recalculate status based on new inventory thresholds
          let status: "In Stock" | "Low Stock" | "Overstocked" = "In Stock";
          if (newLevel <= item.maxCapacity * 0.2) {
            status = "Low Stock";
          } else if (newLevel >= item.maxCapacity * 0.9) {
            status = "Overstocked";
          }
          return { ...item, stockLevel: newLevel, status };
        }
        return item;
      })
    );
  };

  const handleEditItemName = (id: string, newName: string) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  // Simulated operational cargo pulse (linking inbound items to stock levels)
  const handleSimulateCargoPulse = () => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        // Adjust stock level randomly based on some typical loading parameters
        const adjustment = Math.floor((Math.random() - 0.45) * 120);
        const nextLevel = Math.max(0, Math.min(item.maxCapacity, item.stockLevel + adjustment));
        
        // Recalculations
        let status: "In Stock" | "Low Stock" | "Overstocked" = "In Stock";
        if (nextLevel <= item.maxCapacity * 0.2) {
          status = "Low Stock";
        } else if (nextLevel >= item.maxCapacity * 0.9) {
          status = "Overstocked";
        }

        return { ...item, stockLevel: nextLevel, status };
      })
    );
  };


  // ---- 5. Global Command Controls ----
  const resetAllTables = () => {
    if (window.confirm("Restore factory default logistics rows? This will overwrite your current draft.")) {
      setInboundDeals(initialInboundDeals);
      setOutboundDeals(initialOutboundDeals);
      setInventoryItems(initialInventoryItems);
      setDestinations(initialDestinations);
      localStorage.removeItem("logistics_inbound");
      localStorage.removeItem("logistics_outbound");
      localStorage.removeItem("logistics_inventory");
      localStorage.removeItem("logistics_destinations");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Dynamic Navigation Upper Header */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-base tracking-tight block">
                  Logistics Deal Tracker
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Operational Control System v2.10
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sandbox Active</span>
              </div>
              <button
                onClick={resetAllTables}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer"
                title="Overwrite workspace storage to restore initial parameters"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Reset Board
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Welcome Banner */}
      <header className="bg-white border-b border-slate-100 py-6 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-7 h-7 text-indigo-500" />
                Double-Entry Deal Operations Layout
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Perform rapid logistics analysis, track double-entry transit minutes, monitor operational revenues vs dispatch costs, and observe real-time inventory levels.
              </p>
            </div>
            {/* System Info Tag */}
            <div className="bg-indigo-50/60 text-indigo-800 p-3 rounded-xl border border-indigo-100/50 text-xs max-w-sm flex gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Automatic Equation Multipliers</span>
                <span className="text-indigo-600/90 leading-tight block mt-0.5 font-mono">
                  Inbound Revenue = Minutes * RPM <br />
                  Outbound Cost = Minutes * CPM
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top calculating KPI statistics blocks */}
        <KpiCards 
          inboundDeals={inboundDeals} 
          outboundDeals={outboundDeals} 
        />

        {/* Dynamic Connected Database File/Clipboard Loader */}
        <DestinationManager
          destinations={destinations}
          onAddDestinations={handleAddDestinations}
          onClearAllDestinations={handleClearAllDestinations}
          onRemoveDestination={handleRemoveDestination}
        />

        {/* Dynamic Dual-Layout Data Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          
          {/* Table One: Inbound Table */}
          <InboundTable
            deals={inboundDeals}
            destinations={destinations}
            onAddDeal={handleAddInbound}
            onUpdateDeal={handleUpdateInbound}
            onDeleteDeal={handleDeleteInbound}
            onResetToDefaults={resetAllTables}
          />

          {/* Table Two: Outbound Table */}
          <OutboundTable
            deals={outboundDeals}
            destinations={destinations}
            onAddDeal={handleAddOutbound}
            onUpdateDeal={handleUpdateOutbound}
            onDeleteDeal={handleDeleteOutbound}
            onResetToDefaults={resetAllTables}
          />

        </section>

        {/* Real-time Inventory Monitor Area */}
        <section>
          <RealTimeInventoryWidget
            items={inventoryItems}
            onUpdateStock={handleUpdateStock}
            onEditItemName={handleEditItemName}
            onSimulateCargoArrivals={handleSimulateCargoPulse}
          />
        </section>

      </main>

      {/* Elegant minimalist page footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-400">
        <p>Logistics Double-Entry Deal Layout Dashboard • Operational Analytics Control Suite</p>
        <p className="mt-1 text-[10px]">Built with React, Vite, and absolute mathematical precision using real-time calculations.</p>
      </footer>
    </div>
  );
}
