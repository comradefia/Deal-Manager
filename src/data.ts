/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InboundDeal, OutboundDeal, InventoryItem, Destination } from "./types";

export const initialDestinations: Destination[] = [
  { id: "dest-1", originalName: "Chicago O'Hare International Airport (ORD)", maskedName: "ORD-***-CHICAGO" },
  { id: "dest-2", originalName: "Los Angeles International Airport (LAX)", maskedName: "LAX-***-CA" },
  { id: "dest-3", originalName: "John F. Kennedy International Airport (JFK)", maskedName: "JFK-***-NY" },
  { id: "dest-4", originalName: "Miami International Airport (MIA)", maskedName: "MIA-***-FLORIDA" },
  { id: "dest-5", originalName: "London Heathrow Airport (LHR)", maskedName: "LHR-***-LONDON" },
  { id: "dest-6", originalName: "Tokyo Narita International Airport (NRT)", maskedName: "NRT-***-TOKYO" },
  { id: "dest-7", originalName: "Paris Charles de Gaulle Airport (CDG)", maskedName: "CDG-***-PARIS" },
  { id: "dest-8", originalName: "Frankfurt Am Main Airport (FRA)", maskedName: "FRA-***-GERMANY" }
];

export const initialInboundDeals: InboundDeal[] = [
  {
    id: "in-1",
    maskedDestination: "ORD-***-CHICAGO",
    plannedMinutes: 120,
    rpm: 4.5,
  },
  {
    id: "in-2",
    maskedDestination: "LAX-***-CA",
    plannedMinutes: 240,
    rpm: 5.2,
  },
  {
    id: "in-3",
    maskedDestination: "JFK-***-NY",
    plannedMinutes: 180,
    rpm: 6.0,
  },
  {
    id: "in-4",
    maskedDestination: "MIA-***-FLORIDA",
    plannedMinutes: 90,
    rpm: 3.8,
  }
];

export const initialOutboundDeals: OutboundDeal[] = [
  {
    id: "out-1",
    maskedDestination: "LHR-***-LONDON",
    plannedMinutes: 300,
    cost: 3.2,
  },
  {
    id: "out-2",
    maskedDestination: "NRT-***-TOKYO",
    plannedMinutes: 480,
    cost: 4.0,
  },
  {
    id: "out-3",
    maskedDestination: "CDG-***-PARIS",
    plannedMinutes: 150,
    cost: 2.9,
  },
  {
    id: "out-4",
    maskedDestination: "FRA-***-GERMANY",
    plannedMinutes: 210,
    cost: 3.5,
  }
];

export const initialInventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    sku: "EL-9082",
    name: "Microprocessor Units (Tier 1)",
    category: "Electronics",
    stockLevel: 1420,
    maxCapacity: 2000,
    status: "In Stock"
  },
  {
    id: "inv-2",
    sku: "AU-3491",
    name: "Lithium Traction Cells",
    category: "Automotive",
    stockLevel: 180,
    maxCapacity: 1000,
    status: "Low Stock"
  },
  {
    id: "inv-3",
    sku: "MED-550",
    name: "Ventilator Valve Assemblies",
    category: "Medical",
    stockLevel: 1950,
    maxCapacity: 2000,
    status: "Overstocked"
  },
  {
    id: "inv-4",
    sku: "AP-1122",
    name: "Waterproof Outerwear Insulators",
    category: "Apparel",
    stockLevel: 450,
    maxCapacity: 800,
    status: "In Stock"
  }
];
