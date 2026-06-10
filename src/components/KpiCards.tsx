/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { InboundDeal, OutboundDeal } from "../types";
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, Percent } from "lucide-react";

interface KpiCardsProps {
  inboundDeals: InboundDeal[];
  outboundDeals: OutboundDeal[];
}

export default function KpiCards({ inboundDeals, outboundDeals }: KpiCardsProps) {
  // Calculations
  const totalInboundMinutes = inboundDeals.reduce((sum, d) => sum + (d.plannedMinutes || 0), 0);
  const totalOutboundMinutes = outboundDeals.reduce((sum, d) => sum + (d.plannedMinutes || 0), 0);
  const totalMinutes = totalInboundMinutes + totalOutboundMinutes;

  const totalRevenue = inboundDeals.reduce((sum, d) => sum + ((d.plannedMinutes || 0) * (d.rpm || 0)), 0);
  const totalCost = outboundDeals.reduce((sum, d) => sum + ((d.plannedMinutes || 0) * (d.cost || 0)), 0);

  const netMargin = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatMinutes = (m: number) => {
    return new Intl.NumberFormat("en-US").format(m);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Dynamic Net Margin Card */}
      <div 
        id="kpi-net-margin" 
        className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Deal Margin</span>
          <span className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
            netMargin >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}>
            {netMargin >= 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{marginPercentage.toFixed(1)}%
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5" />
                {marginPercentage.toFixed(1)}%
              </>
            )}
          </span>
        </div>
        <div>
          <span className={`text-2xl lg:text-3xl font-display font-bold tracking-tight ${
            netMargin >= 0 ? "text-slate-900" : "text-rose-600"
          }`}>
            {formatCurrency(netMargin)}
          </span>
          <p className="text-xs text-slate-400 mt-1">Real-time revenue minus cost</p>
        </div>
      </div>

      {/* Gross Revenue Card */}
      <div 
        id="kpi-gross-revenue" 
        className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Planned Revenue</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl lg:text-3xl font-display font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalRevenue)}
          </span>
          <p className="text-xs text-slate-400 mt-1">From {inboundDeals.length} active inbound flows</p>
        </div>
      </div>

      {/* Gross Cost Card */}
      <div 
        id="kpi-gross-cost" 
        className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Gross Planned Cost</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl lg:text-3xl font-display font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalCost)}
          </span>
          <p className="text-xs text-slate-400 mt-1">From {outboundDeals.length} active outbound flows</p>
        </div>
      </div>

      {/* Combined Transit Minutes Card */}
      <div 
        id="kpi-transit-duration" 
        className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Planned Duration</span>
          <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl lg:text-3xl font-display font-bold text-slate-900 tracking-tight">
            {formatMinutes(totalMinutes)} <span className="text-sm text-slate-400 font-sans font-normal">mins</span>
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Inbound: {formatMinutes(totalInboundMinutes)}m | Outbound: {formatMinutes(totalOutboundMinutes)}m
          </p>
        </div>
      </div>
    </div>
  );
}
