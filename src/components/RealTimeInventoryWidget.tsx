/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { InventoryItem } from "../types";
import { 
  Package, Plus, Minus, Edit, Tag, Check, ChevronRight, Activity, TrendingUp 
} from "lucide-react";

interface RealTimeInventoryWidgetProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newLevel: number) => void;
  onEditItemName: (id: string, newName: string) => void;
  onSimulateCargoArrivals: () => void;
}

export default function RealTimeInventoryWidget({
  items,
  onUpdateStock,
  onEditItemName,
  onSimulateCargoArrivals,
}: RealTimeInventoryWidgetProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  // Real-time operations feed simulation logs
  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: "in" | "out" | "info" }>>([
    { id: "log-1", time: "11:24:10", text: "System Boot: Real-time inventory monitors active.", type: "info" },
    { id: "log-2", time: "11:25:40", text: "Inbound ORD-***-CHICAGO: Pre-allocated 450 units.", type: "in" },
    { id: "log-3", time: "11:27:12", text: "Dispatched LHR-***-LONDON shipment: 200 items.", type: "out" },
  ]);

  // Adjust stock
  const handleStockAdjust = (id: string, amount: number, currentStock: number, maxCap: number) => {
    const nextLevel = Math.max(0, Math.min(maxCap, currentStock + amount));
    onUpdateStock(id, nextLevel);
    
    // Add real-time log entry
    const timeString = new Date().toTimeString().split(" ")[0];
    const targetItem = items.find(i => i.id === id);
    if (targetItem) {
      const direction = amount > 0 ? "Increased" : "Decreased";
      const logType = amount > 0 ? "in" : "out";
      const newLog = {
        id: `log-${Date.now()}`,
        time: timeString,
        text: `${direction} ${targetItem.sku} (${targetItem.name}) stock level to ${nextLevel}.`,
        type: logType as "in" | "out"
      };
      setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
    }
  };

  // Run simulation block
  const handleTriggerArrival = () => {
    // Increment all active items slightly or simulate a standard shipping pulse
    onSimulateCargoArrivals();
    
    const timeString = new Date().toTimeString().split(" ")[0];
    const newLog = {
      id: `log-${Date.now()}`,
      time: timeString,
      text: "⚡ Simulated Logistics Pulse: Processing inbound receipts & dispatches.",
      type: "info" as const
    };
    setLogs(prev => [newLog, ...prev.slice(0, 9)]);
  };

  const getStatusColor = (status: "In Stock" | "Low Stock" | "Overstocked") => {
    switch (status) {
      case "Low Stock":
        return "bg-amber-100 text-amber-700 border-amber-20 border";
      case "Overstocked":
        return "bg-rose-100 text-rose-700 border-rose-200 border";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200 border";
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveItemName = (id: string) => {
    if (editName.trim()) {
      onEditItemName(id, editName.trim());
    }
    setEditingId(null);
  };

  // Helper values
  const totalStockVolume = items.reduce((sum, item) => sum + item.stockLevel, 0);
  const totalMaxCapacity = items.reduce((sum, item) => sum + item.maxCapacity, 0);
  const overallFacilityUsage = totalMaxCapacity > 0 ? (totalStockVolume / totalMaxCapacity) * 100 : 0;

  return (
    <div id="real-time-inventory-card" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-display font-semibold text-slate-800">Inventory Status Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time status updates tied to inbound and outbound freight capacity</p>
        </div>
        <button
          onClick={handleTriggerArrival}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-100 transition-all cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Pulse Logistics Hub
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Warehouse Usage Stats Panel */}
        <div className="lg:col-span-1 bg-slate-50/70 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Occupancy</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-slate-800">{overallFacilityUsage.toFixed(1)}%</span>
              <span className="text-xs text-slate-400">Total capacity utilized</span>
            </div>
            
            {/* Visual Occupancy Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${overallFacilityUsage}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Stored Units</span>
                <span className="font-bold text-slate-800">{totalStockVolume}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-sans">Total Cap</span>
                <span className="font-bold text-slate-800">{totalMaxCapacity}</span>
              </div>
            </div>
          </div>

          {/* Operational logs list */}
          <div className="mt-5 lg:mt-0">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-500" />
              Live Operations Feed
            </h4>
            <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-slate-300 h-36 overflow-y-auto space-y-1.5 shadow-inner">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2 leading-relaxed">
                  <span className="text-slate-500 flex-shrink-0">{log.time}</span>
                  <span className={`${
                    log.type === "in" ? "text-emerald-400" : log.type === "out" ? "text-amber-400" : "text-sky-300"
                  }`}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Item Controls Panel */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dynamic Stock Levels</h3>
          
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
            {items.map((item) => {
              const itemCapacityPercentage = (item.stockLevel / item.maxCapacity) * 100;
              const isCurrentlyEditing = editingId === item.id;

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
                  
                  {/* Left Info Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-slate-100 text-slate-600 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                        {item.sku}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    {isCurrentlyEditing ? (
                      <div className="flex gap-2 max-w-sm mt-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                        <button
                          onClick={() => saveItemName(item.id)}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1 group">
                        {item.name}
                        <button
                          onClick={() => startEditing(item)}
                          className="text-slate-300 hover:text-slate-500 p-0.5 rounded cursor-pointer"
                          title="Rename item"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </h4>
                    )}

                    {/* Progress Bar of Stock */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.status === "Low Stock" ? "bg-amber-500" : item.status === "Overstocked" ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${itemCapacityPercentage}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs text-slate-500 flex-shrink-0">
                        {item.stockLevel} / {item.maxCapacity} units
                      </span>
                    </div>
                  </div>

                  {/* Right Adjuster Operations */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleStockAdjust(item.id, -50, item.stockLevel, item.maxCapacity)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Dispatch 50 items"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold w-12 text-center bg-slate-50 border border-slate-100 rounded-md py-1">
                      ±50
                    </span>
                    <button
                      onClick={() => handleStockAdjust(item.id, 50, item.stockLevel, item.maxCapacity)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Receive 50 items"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
