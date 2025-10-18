"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { treesData } from "@/data/trees";
import { Calendar, Droplet, Edit, Save, Shield, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TreeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const treeId = params.id as string;

  const [tree, setTree] = useState(treesData.find(t => t.id === treeId));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(tree);

  useEffect(() => {
    // Check if user is admin
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    setIsAdmin(adminLoggedIn === "true");
  }, []);

  useEffect(() => {
    setEditData(tree);
  }, [tree]);

  if (!tree) {
    return (
      <main>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tree Not Found</h1>
            <p className="text-gray-600 mb-6">The tree you're looking for doesn't exist.</p>
            <a href="/farm-transparency" className="btn-primary">
              Back to Farm Map
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-MY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSave = () => {
    if (editData) {
      // Update local state
      setTree(editData);
      // In production, this would save to database
      alert("Tree data updated successfully! ✅");
      setIsEditMode(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  return (
    <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-tropical-green to-tropical-lime text-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{tree.variety}</h1>
              <p className="text-gray-100">Tree ID: {tree.id}</p>
              <p className="text-gray-100">{tree.location}</p>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <div className="bg-white/20 px-3 py-1 rounded-full flex items-center space-x-2">
                  <Shield size={16} />
                  <span className="text-sm font-semibold">Admin</span>
                </div>
              ) : (
                <div className="bg-white/20 px-3 py-1 rounded-full flex items-center space-x-2">
                  <Eye size={16} />
                  <span className="text-sm font-semibold">View</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Toggle */}
        {isAdmin && !isEditMode && (
          <div className="mb-6">
            <button
              onClick={() => setIsEditMode(true)}
              className="w-full btn-primary flex items-center justify-center space-x-2 text-lg"
            >
              <Edit size={20} />
              <span>Quick Update Tree Info</span>
            </button>
          </div>
        )}

        {/* Edit Mode */}
        {isEditMode && editData && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📝 Quick Update</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save size={20} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Health Status
                </label>
                <select
                  value={editData.health}
                  onChange={(e) => handleChange("health", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                >
                  <option value="Excellent">✅ Excellent</option>
                  <option value="Good">👍 Good</option>
                  <option value="Fair">⚠️ Fair</option>
                  <option value="Needs Attention">🚨 Needs Attention</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Fertilized
                </label>
                <input
                  type="date"
                  value={editData.lastFertilized}
                  onChange={(e) => handleChange("lastFertilized", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fertilizer Type
                </label>
                <input
                  type="text"
                  value={editData.fertilizerType}
                  onChange={(e) => handleChange("fertilizerType", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                  placeholder="e.g., Organic NPK 15-15-15"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Harvest
                </label>
                <input
                  type="date"
                  value={editData.lastHarvest}
                  onChange={(e) => handleChange("lastHarvest", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Next Expected Harvest
                </label>
                <input
                  type="date"
                  value={editData.nextExpectedHarvest}
                  onChange={(e) => handleChange("nextExpectedHarvest", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none resize-none text-lg"
                  placeholder="Add notes about this tree..."
                />
              </div>
            </div>
          </div>
        )}

        {/* View Mode - Tree Info Cards */}
        {!isEditMode && (
          <div className="space-y-6">
            {/* Tree Age */}
            <div className="card p-6 border-l-4 border-blue-500">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="text-blue-600" size={28} />
                <h3 className="text-xl font-bold text-gray-900">Tree Age</h3>
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {tree.treeAge} years old
              </p>
              <p className="text-gray-600">
                Planted: {formatDate(tree.plantedDate)}
              </p>
            </div>

            {/* Fertilization */}
            <div className="card p-6 border-l-4 border-green-500">
              <div className="flex items-center space-x-3 mb-3">
                <Droplet className="text-green-600" size={28} />
                <h3 className="text-xl font-bold text-gray-900">Fertilization</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Last Fertilized</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatDate(tree.lastFertilized)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {calculateDaysSince(tree.lastFertilized)} days ago
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Type Used</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {tree.fertilizerType}
                  </p>
                </div>
              </div>
            </div>

            {/* Harvest Info */}
            <div className="card p-6 border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Harvest Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Last Harvest</p>
                  <p className="text-lg font-bold text-amber-600">
                    {formatDate(tree.lastHarvest)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {calculateDaysSince(tree.lastHarvest)} days ago
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Harvest</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatDate(tree.nextExpectedHarvest)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Annual Yield</p>
                <p className="text-2xl font-bold text-gray-900">{tree.yield}</p>
              </div>
            </div>

            {/* Health Status */}
            <div className={`card p-6 border-l-4 ${
              tree.health === "Excellent" ? "border-green-500" :
              tree.health === "Good" ? "border-blue-500" :
              tree.health === "Fair" ? "border-yellow-500" :
              "border-red-500"
            }`}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Health Status</h3>
              <p className={`text-3xl font-bold ${
                tree.health === "Excellent" ? "text-green-600" :
                tree.health === "Good" ? "text-blue-600" :
                tree.health === "Fair" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {tree.health}
              </p>
            </div>

            {/* Notes */}
            {tree.notes && (
              <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📋 Notes from Farm Manager
                </h3>
                <p className="text-gray-700 italic">{tree.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <a
            href="/farm-transparency"
            className="w-full btn-secondary text-center inline-block"
          >
            ← Back to Farm Map
          </a>

          {!isAdmin && (
            <a
              href="/admin/login"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg text-center inline-block transition-colors"
            >
              🔒 Admin Login to Update
            </a>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
