/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { InboundDeal, Destination } from "../types";
import { 
  Plus, Edit2, Trash2, Check, X, Search, ArrowUpDown, RefreshCw, AlertTriangle, Link 
} from "lucide-react";

interface InboundTableProps {
  deals: InboundDeal[];
  destinations: Destination[];
  onAddDeal: (deal: Omit<InboundDeal, "id">) => void;
  onUpdateDeal: (id: string, updated: Partial<InboundDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onResetToDefaults: () => void;
}

type SortField = "maskedDestination" | "plannedMinutes" | "rpm" | "plannedRevenue";
type SortOrder = "asc" | "desc";

export default function InboundTable({
  deals,
  destinations = [],
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onResetToDefaults,
}: InboundTableProps) {
  // Search & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("maskedDestination");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Inline Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDestination, setEditDestination] = useState("");
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editRpm, setEditRpm] = useState<number>(0);

  // New Deal Input States (Quick Add)
  const [newDestination, setNewDestination] = useState("");
  const [newMinutes, setNewMinutes] = useState<string>("");
  const [newRpm, setNewRpm] = useState<string>("");
  const [addError, setAddError] = useState<string | null>(null);

  // Toggle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Start inline editing
  const startEdit = (deal: InboundDeal) => {
    setEditingId(deal.id);
    setEditDestination(deal.maskedDestination);
    setEditMinutes(deal.plannedMinutes);
    setEditRpm(deal.rpm);
  };

  // Save inline edit
  const saveEdit = (id: string) => {
    if (!editDestination.trim()) {
      alert("Destination description/code cannot be blank.");
      return;
    }
    onUpdateDeal(id, {
      maskedDestination: editDestination.trim(),
      plannedMinutes: Math.max(0, Number(editMinutes) || 0),
      rpm: Math.max(0, Number(editRpm) || 0),
    });
    setEditingId(null);
  };

  // Cancel inline editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Handle Quick Add Submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const destinationValue = newDestination.trim();
    if (!destinationValue) {
      setAddError("Please fill out the Destination code or location.");
      return;
    }

    const mins = Number(newMinutes);
    if (isNaN(mins) || mins < 0) {
      setAddError("Planned minutes must be a positive number.");
      return;
    }

    const rpmVal = Number(newRpm);
    if (isNaN(rpmVal) || rpmVal < 0) {
      setAddError("RPM rate must be a positive number.");
      return;
    }

    onAddDeal({
      maskedDestination: destinationValue,
      plannedMinutes: mins,
      rpm: rpmVal,
    });

    // Clear Quick Add inputs
    setNewDestination("");
    setNewMinutes("");
    setNewRpm("");
  };

  // Pre-fill a standard mask format for quick prototyping
  const applyDestinationMask = (prefix: string) => {
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    setNewDestination(`${prefix.toUpperCase()}-***-${randomHex}`);
  };

  // Filter & Sort core logs
  const filteredDeals = deals.filter((deal) =>
    deal.maskedDestination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    let valA: string | number;
    let valB: string | number;

    if (sortField === "plannedRevenue") {
      valA = (a.plannedMinutes || 0) * (a.rpm || 0);
      valB = (b.plannedMinutes || 0) * (b.rpm || 0);
    } else {
      valA = a[sortField];
      valB = b[sortField];
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }
  });

  // SUMMATION CALCULATIONS (Required automatically at bottom of table)
  const totalPlannedMinutes = sortedDeals.reduce(
    (sum, deal) => sum + (deal.plannedMinutes || 0),
    0
  );
  const totalPlannedRevenue = sortedDeals.reduce(
    (sum, deal) => sum + ((deal.plannedMinutes || 0) * (deal.rpm || 0)),
    0
  );

  // Formatting utils
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div id="inbound-billing-card" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Panel */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full pulse-indicator"></div>
            <h2 className="text-lg font-display font-semibold text-slate-800">1. Inbound Logistics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Tracks inbound supply runs, incoming minutes, and planned revenue</p>
        </div>
        <button
          onClick={onResetToDefaults}
          type="button"
          title="Reset to default seed data"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 self-start px-2.5 py-1.5 rounded-md hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Tables
        </button>
      </div>

      {/* Quick Add Form Panel */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">Quick Add New Inbound Entry</h3>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          
          {/* Column 1: Connected Database Select Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 flex justify-between">
              <span>Select Destination Link</span>
              <span className="text-indigo-600 font-normal">Direct upload</span>
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  setNewDestination(e.target.value);
                }
              }}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
            >
              <option value="">-- Choose uploaded set --</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.maskedName}>
                  {d.maskedName} ({d.originalName.length > 20 ? d.originalName.substring(0, 20) + "..." : d.originalName})
                </option>
              ))}
            </select>
          </div>

          {/* Column 2: Selected Mask Code Field */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 flex justify-between">
              <span>Selected Mask Code</span>
              <span className="text-slate-400 font-normal">Active value</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Choose above or enter code"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
              />
              {/* Intelligent quick-generator tags */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => applyDestinationMask("ORD")}
                  className="px-1.5 py-2 text-[10px] uppercase tracking-wider font-semibold border border-slate-200 rounded hover:bg-slate-50 text-slate-500 cursor-pointer text-center flex items-center"
                  title="Generate ORD mask"
                >
                  ORD
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 block">Planned Minutes</label>
            <input
              type="number"
              placeholder="e.g. 150"
              min="0"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500 block">RPM (Rev Per Min)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 4.50"
              value={newRpm}
              onChange={(e) => setNewRpm(e.target.value)}
              className="w-full text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Flow
            </button>
          </div>
        </form>

        {addError && (
          <div className="mt-3 text-xs bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-100 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{addError}</span>
          </div>
        )}
      </div>

      {/* Filters Bench */}
      <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 text-slate-800 bg-white placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>
        <div className="text-[11px] text-slate-400 font-medium self-end">
          Displaying {sortedDeals.length} of {deals.length} flows
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th 
                className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("maskedDestination")}
              >
                <div className="flex items-center gap-1">
                  Masked Destination
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort("plannedMinutes")}
              >
                <div className="flex items-center justify-end gap-1">
                  Planned Minutes
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort("rpm")}
              >
                <div className="flex items-center justify-end gap-1">
                  RPM ($/Min)
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 transition-colors text-right"
                onClick={() => handleSort("plannedRevenue")}
              >
                <div className="flex items-center justify-end gap-1">
                  Planned Revenue
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedDeals.length > 0 ? (
              sortedDeals.map((deal) => {
                const isEditing = editingId === deal.id;
                const plannedRevenue = (deal.plannedMinutes || 0) * (deal.rpm || 0);

                return (
                  <tr 
                    key={deal.id} 
                    className={`group hover:bg-slate-50/50 transition-colors ${
                      isEditing ? "bg-indigo-50/30" : ""
                    }`}
                  >
                    {/* Destination cell */}
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <select
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          className="w-full text-xs font-mono border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                        >
                          <option value={editDestination}>{editDestination} (Current)</option>
                          {destinations.filter(d => d.maskedName !== editDestination).map((d) => (
                            <option key={d.id} value={d.maskedName}>
                              {d.maskedName} ({d.originalName.length > 25 ? d.originalName.substring(0, 25) + "..." : d.originalName})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md w-fit border border-slate-100">
                          {deal.maskedDestination}
                        </div>
                      )}
                    </td>

                    {/* Planned Minutes cell */}
                    <td className="py-2.5 px-4 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(Number(e.target.value) || 0)}
                          className="w-24 text-right text-xs font-mono border border-slate-300 rounded px-2.5 py-1 p-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                        />
                      ) : (
                        <span className="font-mono text-slate-800 font-medium">
                          {formatNumber(deal.plannedMinutes)} min
                        </span>
                      )}
                    </td>

                    {/* RPM cell */}
                    <td className="py-2.5 px-4 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editRpm}
                          onChange={(e) => setEditRpm(Number(e.target.value) || 0)}
                          className="w-24 text-right text-xs font-mono border border-slate-300 rounded px-2.5 py-1 p-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800"
                        />
                      ) : (
                        <span className="font-mono text-emerald-600 font-medium">
                          {formatCurrency(deal.rpm)}
                        </span>
                      )}
                    </td>

                    {/* Planned Revenue (Calculated auto-multiplier) */}
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900 font-mono">
                      {formatCurrency(plannedRevenue)}
                    </td>

                    {/* Actions cell */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(deal.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                              title="Discard changes"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(deal)}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No active inbound matches found. Add high-volume deal records above.
                </td>
              </tr>
            )}
          </tbody>

          {/* AUTOMATIC SUMMATION FOOTER ROW (Mandatory) */}
          <tfoot className="border-t-2 border-slate-200 bg-slate-50/50 text-slate-800 font-semibold font-mono">
            <tr>
              <td className="py-3 px-4 text-xs font-sans font-bold text-slate-500 uppercase tracking-wide">
                Inbound Total
              </td>
              <td className="py-3 px-4 text-right text-slate-900 border-r border-slate-100">
                {formatNumber(totalPlannedMinutes)} min
              </td>
              <td className="py-3 px-4 text-right text-slate-400 font-normal italic text-xs border-r border-slate-100">
                (RPM Summation)
              </td>
              <td className="py-3 px-4 text-right text-indigo-700 font-extrabold text-base bg-indigo-50/20">
                {formatCurrency(totalPlannedRevenue)}
              </td>
              <td className="py-3 px-4 text-center text-slate-300">-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
