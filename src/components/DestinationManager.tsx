/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Destination } from "../types";
import { 
  Upload, FileText, Check, Plus, Trash2, AlertCircle, Sparkles, HelpCircle, ArrowRight 
} from "lucide-react";

interface DestinationManagerProps {
  destinations: Destination[];
  onAddDestinations: (newDests: Omit<Destination, "id">[]) => void;
  onClearAllDestinations: () => void;
  onRemoveDestination: (id: string) => void;
}

export default function DestinationManager({
  destinations,
  onAddDestinations,
  onClearAllDestinations,
  onRemoveDestination,
}: DestinationManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: dynamic mask generator for uploaded plain text
  const generateMaskForName = (originalName: string): string => {
    const clean = originalName.replace(/[^a-zA-Z\s]/g, "").trim();
    const words = clean.split(/\s+/).filter(Boolean);
    
    let prefix = "LOC";
    let suffix = "HUB";

    if (words.length >= 1) {
      // Look for airport codes or take first letters
      const firstWord = words[0].toUpperCase();
      if (firstWord.length === 3) {
        prefix = firstWord;
      } else {
        prefix = firstWord.substring(0, 3);
      }

      if (words.length >= 2) {
        const lastWord = words[words.length - 1].toUpperCase();
        suffix = lastWord.substring(0, 7);
      } else {
        suffix = firstWord.substring(Math.max(0, firstWord.length - 5)).toUpperCase();
      }
    }

    if (prefix.length < 3) prefix = (prefix + "XXX").substring(0, 3);
    
    return `${prefix}-***-${suffix}`;
  };

  // Helper: Parse lines into Destination objects
  const processPlainText = (text: string) => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      setErrorStatus("The file or pasted input was empty.");
      return;
    }

    const parsed: Omit<Destination, "id">[] = [];
    
    lines.forEach(line => {
      // Support comma separated parameters: original, masked (optional)
      if (line.includes(",")) {
        const parts = line.split(",").map(p => p.trim());
        const originalName = parts[0];
        const maskedName = parts[1] || generateMaskForName(originalName);
        parsed.push({ originalName, maskedName });
      } else {
        // Just raw destination
        parsed.push({ 
          originalName: line, 
          maskedName: generateMaskForName(line) 
        });
      }
    });

    if (parsed.length > 0) {
      onAddDestinations(parsed);
      setSuccessStatus(`Successfully processed and loaded ${parsed.length} destinations.`);
      setPasteValue("");
      setErrorStatus(null);
      setTimeout(() => setSuccessStatus(null), 5000);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (file.type !== "text/plain" && !file.name.endsWith(".txt") && !file.name.endsWith(".csv")) {
      setErrorStatus("Invalid file format. Please upload a pure .txt or .csv text file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        processPlainText(result);
      }
    };
    reader.onerror = () => {
      setErrorStatus("Could not read file details.");
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePasteSubmit = () => {
    if (!pasteValue.trim()) {
      setErrorStatus("Please paste some text destinations before clicking Submit.");
      return;
    }
    processPlainText(pasteValue);
  };

  return (
    <div id="destination-manager-card" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-8">
      {/* Banner */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-display font-semibold text-slate-800">Direct Destination Database Loader</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Upload location lists directly to instantly populate all deal creation tools & dropdown selectors</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            File Layout Guide
          </button>
          {destinations.length > 0 && (
            <button
              onClick={onClearAllDestinations}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear Custom List
            </button>
          )}
        </div>
      </div>

      {showHelp && (
        <div className="bg-indigo-50/40 p-5 border-b border-slate-100 text-slate-700 text-xs text-left grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-indigo-900 block mb-1">Standard Line-by-Line Upload format</span>
            <p className="text-slate-500 mb-2">Simply list each destination location on a separate line. The algorithm automatically generates the strict logistics masking code.</p>
            <pre className="bg-white p-2.5 rounded-lg font-mono text-[11px] text-slate-600 border border-slate-100 leading-snug">
              Chicago OHare Airport<br />
              London Heathrow Terminal 5<br />
              Berlin Tegel Air Traffic Control
            </pre>
          </div>
          <div>
            <span className="font-semibold text-indigo-900 block mb-1">Explicit Comma-separated Custom Mask format</span>
            <p className="text-slate-500 mb-2">You can specify both the friendly original name AND your exact masked routing code separated by a single raw comma.</p>
            <pre className="bg-white p-2.5 rounded-lg font-mono text-[11px] text-slate-600 border border-slate-100 leading-snug">
              Tokyo Haneda International Airport, HND-***-TOKYO<br />
              Singapore Changi, SIN-***-CHANGI<br />
              Sydney Kingsford Smith, SYD-***-AUSTRALIA
            </pre>
          </div>
        </div>
      )}

      {/* Main Upload Box & paste area layout */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Usability Drag & Drop Zone + Paste (Left side 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Drag & Drop File Loader Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-50/40 scale-[1.01]" 
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/40"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".txt,.csv"
                onChange={handleFileChange}
              />
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">Drag & Drop Database file</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Supports csv, txt (click to select)</span>
            </div>

            {/* Manual Line adder Paste Area */}
            <div className="flex flex-col">
              <textarea
                placeholder="Or paste locations here (one per line)...&#10;e.g. Amsterdam Schiphol, AMS-***-NL"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                className="w-full flex-1 min-h-[110px] text-xs font-mono bg-slate-50/60 focus:bg-white text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400 resize-none"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Copied List
              </button>
            </div>

          </div>

          {/* Feedback messages */}
          {errorStatus && (
            <div className="text-xs bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}

          {successStatus && (
            <div className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successStatus}</span>
            </div>
          )}

        </div>

        {/* Loaded set overview (Right side 5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[180px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center bg-white">
            <span>Directly Linked Set ({destinations.length})</span>
            <span className="text-indigo-600 font-normal">Stored in local cluster</span>
          </span>

          <div className="border border-slate-100 rounded-xl overflow-hidden flex-1 bg-slate-50/30 flex flex-col">
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 text-xs px-2">
              {destinations.length > 0 ? (
                destinations.map((dest) => (
                  <div key={dest.id} className="py-2 px-1 flex items-center justify-between group">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-slate-700 truncate block text-[11px]" title={dest.originalName}>
                        {dest.originalName}
                      </span>
                      <span className="font-mono text-[10px] text-indigo-600 font-bold block mt-0.5">
                        {dest.maskedName}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveDestination(dest.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Empty destination pool. Load above, or use the reset action.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
