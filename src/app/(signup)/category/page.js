"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updatePreferance } from "../../store/actions/Profile/index";
const categoryOptions = [
  { id: "fitness-sports", name: "Fitness & Sports", icon: "🏆" },
  { id: "footwear", name: "Footwear", icon: "👟" },
  { id: "jewelry", name: "Jewelry", icon: "💍" },
  { id: "gaming", name: "Gaming", icon: "🖥️" },
  { id: "bags-wallets", name: "Bags & Wallets", icon: "👜" },
  { id: "eyewear", name: "Eyewear", icon: "🕶️" },
  { id: "pet-supplies", name: "Pet Supplies", icon: "🐶" },
  { id: "health-wellness", name: "Health & Wellness", icon: "💊" },
  { id: "automotive", name: "Automotive", icon: "🚗" },
  { id: "skincare", name: "Skincare", icon: "🧴" },
  { id: "travel-luggage", name: "Travel & Luggage", icon: "🧳" },
  { id: "toys-games", name: "Toys & Games", icon: "🎮" },
  { id: "tools-hardware", name: "Tools & Hardware", icon: "🔨" },
  { id: "books-stationery", name: "Books & Stationery", icon: "📚" },
  { id: "gifts-occasions", name: "Gifts & Occasions", icon: "🎁" },
  { id: "bedding-furnishing", name: "Bedding & Furnishing", icon: "🛏️" },
];

export default function CategorySelector() {
  const dispatch = useDispatch();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { preferanceData, preferanceLoading, prederanceError } = useSelector(
    (state) => state.UPDATE_PREFERANCE
  );
  const router = useRouter();
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateCategory = () => {
    let payload = JSON.stringify({
      userId: localStorage.getItem("userId"),
      preferences: {
        style: JSON.parse(localStorage.getItem("signupStyle")),
        category: selectedCategories,
      },
    });
    dispatch(updatePreferance(payload));
    router.push("/values");
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
            What shopping categories excite you?
          </h2>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="text-slate-300 font-sans text-lg">
            Select all that apply to refine your Snapi recommendations !
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categoryOptions.map((category) => (
            <div
              key={category.id}
              className={`cursor-pointer transition-all duration-300 h-40 ${
                selectedCategories.includes(category.id)
                  ? "ring-4 ring-cyan-400 ring-opacity-80"
                  : "hover:ring-2 hover:ring-cyan-300 hover:ring-opacity-50"
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden group bg-slate-500/60 hover:bg-slate-500/80 transition-colors duration-300">
                <div className="flex flex-col items-center justify-center h-full p-4 text-white">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h4 className="font-sans font-semibold text-center text-sm leading-tight">
                    {category.name}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Button
            className="bg-slate-600 hover:bg-slate-500 text-white px-12 py-3 rounded-lg font-sans font-medium text-lg transition-colors duration-200"
            disabled={selectedCategories.length === 0}
            onClick={() => updateCategory()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
