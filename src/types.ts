/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InboundDeal {
  id: string;
  maskedDestination: string;
  plannedMinutes: number;
  rpm: number; // Revenue Per Minute
}

export interface OutboundDeal {
  id: string;
  maskedDestination: string;
  plannedMinutes: number;
  cost: number; // Cost Per Minute (CPM)
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: "Electronics" | "Automotive" | "Apparel" | "Medical" | "General";
  stockLevel: number;
  maxCapacity: number;
  status: "In Stock" | "Low Stock" | "Overstocked";
}

export interface Destination {
  id: string;
  originalName: string;
  maskedName: string;
}
