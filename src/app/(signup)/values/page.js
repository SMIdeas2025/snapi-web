"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

const valueOptions = [
  { id: "best-deals", name: "Best Deals First", icon: "🚀" },
  { id: "balanced-value", name: "Balanced Value & Quality", icon: "📊" },
  { id: "premium-finds", name: "Premium Finds", icon: "💡" },
  { id: "ethical-brands", name: "Ethical Brands", icon: "🤝" },
  { id: "used-resale", name: "Used / Resale Options", icon: "🏋️" },
  { id: "fast-shipping", name: "Fast Shipping", icon: "⚙️" },
  { id: "bundles-sets", name: "Bundles & Sets", icon: "👑" },
  { id: "visual-appeal", name: "Visual Appeal", icon: "🖼️" },
  { id: "compare-everything", name: "I Compare Everything", icon: "👥" },
  { id: "trend-inspired", name: "Trend Inspired", icon: "🖼️" },
  { id: "ai-lead", name: "Ai, Take the Lead", icon: "🚀" },
];

export default function ValuesSelector() {
  const [selectedValues, setSelectedValues] = useState([]);
  const router = useRouter();

  const toggleValue = (valueId) => {
    setSelectedValues((prev) => {
      if (prev.includes(valueId)) {
        return prev.filter((id) => id !== valueId);
      } else if (prev.length < 3) {
        return [...prev, valueId];
      }
      return prev;
    });
  };

  return (
    <div
      className="min-h-screen  p-6"
      style={{
        background: `radial-gradient(50% 50% at 50% 50%, #83CBEB 0%, #186B91 50%, #0D3A4E 100%);`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative">
          <h1 className="text-3xl font-serif text-white italic">Snapi</h1>
          <h2 className="text-2xl font-sans text-white font-medium absolute left-1/2 transform -translate-x-1/2">
            Values I Care
          </h2>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-slate-300 font-sans text-lg">
            Choose up to 3 values that reflect your priorities !
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto">
          {valueOptions.map((value) => (
            <div
              key={value.id}
              className={`cursor-pointer transition-all duration-300 ${
                selectedValues.includes(value.id)
                  ? "ring-4 ring-cyan-400 ring-opacity-80"
                  : selectedValues.length >= 3
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:ring-2 hover:ring-cyan-300 hover:ring-opacity-50"
              }`}
              onClick={() => toggleValue(value.id)}
            >
              <div className="relative w-full h-48 rounded-xl border border-slate-500/50 bg-slate-600/30 hover:bg-slate-600/50 transition-colors duration-300 flex flex-col items-center justify-center p-6">
                <div className="text-white text-center">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-white rounded-lg flex items-center justify-center">
                      <span className="text-lg">{value.icon}</span>
                    </div>
                  </div>
                  <h4 className="font-sans font-medium text-center text-base leading-tight">
                    {value.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            className="bg-slate-600 hover:bg-slate-500 text-white px-12 py-3 rounded-lg font-sans font-medium text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedValues.length === 0}
            onClick={() => router.push("/dashboard")}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
