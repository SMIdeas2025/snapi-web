"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

const styleOptions = [
  {
    id: "urban-edge",
    name: "Urban Edge",
    description: "Bold designs, industrial accents",
    image: "/urban-industrial-geometric.png",
    height: "h-64",
  },
  {
    id: "classic-elegance-1",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/elegant-neutral-living-room.png",
    height: "h-72",
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description: "Eclectic mix of patterns and textures",
    image: "/bohemian-bedroom.png",
    height: "h-80",
  },
  {
    id: "classic-elegance-2",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/placeholder-kiyop.png",
    height: "h-56",
  },
  {
    id: "minimalist-chic",
    name: "Minimalist Chic",
    description: "clean lines, natural textures, subtle",
    image: "/minimalist-modern-living-room.png",
    height: "h-76",
  },
  {
    id: "classic-elegance-3",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/elegant-geometric-bedroom.png",
    height: "h-64",
  },
  {
    id: "classic-elegance-4",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/elegant-gray-living-room.png",
    height: "h-56",
  },
  {
    id: "classic-elegance-5",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/eclectic-kids-bedroom.png",
    height: "h-72",
  },
  {
    id: "classic-elegance-6",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/elegant-geometric-bedroom.png",
    height: "h-80",
  },
  {
    id: "classic-elegance-7",
    name: "Classic Elegance",
    description: "Timeless Designs, refined details",
    image: "/urban-industrial-geometric.png",
    height: "h-68",
  },
];

export default function StyleSelector() {
  const [selectedStyles, setSelectedStyles] = useState([]);
  const router = useRouter();

  const toggleStyle = (styleId) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  };

  const updateStyle = () => {
    //
    console.log(selectedStyles);
    localStorage.setItem("signupStyle", JSON.stringify(selectedStyles));
    router.push("/category");
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
            Tell Us your Style
          </h2>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-xl font-sans text-white font-semibold mb-2">
            Choose your Aesthetics
          </h3>
          <p className="text-slate-300 font-sans">
            Select styles that resonate with your personal taste. you can choose
            as many as you like !
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 mb-8">
          {styleOptions.map((style) => (
            <div
              key={style.id}
              className={`break-inside-avoid cursor-pointer transition-all duration-300 ${
                style.height
              } ${
                selectedStyles.includes(style.id)
                  ? "ring-4 ring-cyan-400 ring-opacity-80"
                  : "hover:ring-2 hover:ring-cyan-300 hover:ring-opacity-50"
              }`}
              onClick={() => toggleStyle(style.id)}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden group">
                <img
                  src={style.image || "/placeholder.svg"}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="font-sans font-bold text-lg mb-1">
                    {style.name}
                  </h4>
                  <p className="font-sans text-sm text-slate-200 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            className="bg-slate-600 hover:bg-slate-500 text-white px-12 py-3 rounded-lg font-sans font-medium text-lg transition-colors duration-200"
            disabled={selectedStyles.length === 0}
            onClick={() => updateStyle()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
