"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Stethoscope, X, Camera } from "lucide-react";
import { treesData as initialTreesData } from "@/data/trees";
import { TreeInfo, TreeHealthRecord } from "@/types/tree";
import Link from "next/link";
import { getTreeById, updateTree, createHealthRecord } from "@/lib/firebaseService";
import {
  saveHealthRecordOffline,
  isOnline,
} from "@/lib/offlineStorage";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

export default function TreeUpdatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const treeId = searchParams.get("id");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<TreeInfo | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthFormData, setHealthFormData] = useState<Partial<TreeHealthRecord>>({
    treeId: "",
    treeNo: "",
    variety: "",
    location: "",
    zone: "",
    row: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    healthStatus: "Sihat",
    diseaseType: "",
    attackLevel: "",
    treatment: "",
    notes: "",
    photos: [],
    inspectedBy: "",
  });
  const [updateForm, setUpdateForm] = useState({
    // Health & Condition
    health: "",
    currentCondition: "",
    requiresAttention: false,
    notes: "",

    // Annual Measurements (Ukuran Tahunan)
    tarikhBaru: "",
    saizKanopiBaru: "",
    saizUkurLilitBaru: "",
    tarikhLama: "",
    saizKanopiLama: "",
    saizUkurLilitLama: "",

    // Weekly Maintenance (Rawatan Mingguan)
    tarikhBaja: "",
    jenisBaja: "",
    tarikhRacun: "",
    jenisRacun: "",

    // Other monitoring dates
    lastInspectionDate: new Date().toISOString().split('T')[0],
    lastPruningDate: "",
    lastPestControlDate: "",
    lastWateringDate: "",
    lastFertilized: "",
  });

  const diseaseTypes = [
    "Tiada",
    "Phytophthora (Busuk akar)",
    "Stem Canker",
    "Patch Canker",
    "Serangan Penggerek Batang",
    "Serangan Ulat",
    "Serangan Kumbang",
    "Penyakit Daun",
    "Lain-lain"
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const adminUser = localStorage.getItem("adminUser");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
      setHealthFormData(prev => ({ ...prev, inspectedBy: adminUser || "" }));
    } else {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (treeId) {
      const foundTree = initialTreesData.find((t) => t.id === treeId);
      if (foundTree) {
        setTree(foundTree);

        // Populate health form with tree info
        const adminUser = localStorage.getItem("adminUser");
        setHealthFormData(prev => ({
          ...prev,
          treeId: foundTree.id,
          treeNo: foundTree.no || foundTree.id,
          variety: foundTree.variety,
          location: foundTree.location,
          zone: foundTree.zone || "",
          row: foundTree.row || "",
          inspectedBy: adminUser || "",
        }));

        setUpdateForm({
          health: foundTree.health,
          currentCondition: foundTree.currentCondition || "",
          requiresAttention: foundTree.requiresAttention || false,
          notes: foundTree.notes || "",

          tarikhBaru: foundTree.tarikhBaru || "",
          saizKanopiBaru: foundTree.saizKanopiBaru || "",
          saizUkurLilitBaru: foundTree.saizUkurLilitBaru || "",
          tarikhLama: foundTree.tarikhLama || "",
          saizKanopiLama: foundTree.saizKanopiLama || "",
          saizUkurLilitLama: foundTree.saizUkurLilitLama || "",

          tarikhBaja: foundTree.tarikhBaja || "",
          jenisBaja: foundTree.jenisBaja || "",
          tarikhRacun: foundTree.tarikhRacun || "",
          jenisRacun: foundTree.jenisRacun || "",

          lastInspectionDate: foundTree.lastInspectionDate || new Date().toISOString().split('T')[0],
          lastPruningDate: foundTree.lastPruningDate || "",
          lastPestControlDate: foundTree.lastPestControlDate || "",
          lastWateringDate: foundTree.lastWateringDate || "",
          lastFertilized: foundTree.lastFertilized || "",
        });
      }
    }
  }, [treeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!tree) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600">Tree not found</p>
          <Link
            href="/admin"
            className="mt-4 inline-block bg-tropical-lime text-white px-6 py-3 rounded-lg hover:bg-tropical-green transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treeId) return;

    try {
      const success = await updateTree(treeId, updateForm);

      if (success) {
        alert("✅ Tree data updated successfully in Firebase!");
        router.push("/admin");
      } else {
        alert("❌ Error updating tree. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error updating tree. Please check your Firebase configuration.");
    }
  };

  const handleQuickDateUpdate = (field: string) => {
    const today = new Date().toISOString().split('T')[0];
    setUpdateForm({ ...updateForm, [field]: today });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readFiles = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readFiles).then(newPhotos => {
      setHealthFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...newPhotos]
      }));
    });
  };

  const removePhoto = (index: number) => {
    setHealthFormData(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveHealthRecord = async () => {
    if (!healthFormData.treeId || !healthFormData.healthStatus || !healthFormData.inspectionDate) {
      alert("Please fill in required fields: Health Status and Inspection Date");
      return;
    }

    const newRecord: TreeHealthRecord = {
      id: `health-${Date.now()}`,
      treeId: healthFormData.treeId!,
      treeNo: healthFormData.treeNo!,
      variety: healthFormData.variety!,
      location: healthFormData.location!,
      zone: healthFormData.zone,
      row: healthFormData.row,
      inspectionDate: healthFormData.inspectionDate!,
      healthStatus: healthFormData.healthStatus as "Sihat" | "Sederhana" | "Sakit",
      diseaseType: healthFormData.diseaseType,
      attackLevel: healthFormData.attackLevel as "Ringan" | "Sederhana" | "Teruk" | "",
      treatment: healthFormData.treatment,
      notes: healthFormData.notes,
      photos: healthFormData.photos || [],
      inspectedBy: healthFormData.inspectedBy!,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Offline-first approach: Always save locally first
      const success = await saveHealthRecordOffline(newRecord);

      if (success) {
        const syncNote = isOnline() ? " and syncing..." : " (will sync when online)";
        alert("✅ Health inspection recorded" + syncNote);
        setShowHealthModal(false);
        // Reset health form but keep tree info
        const adminUser = localStorage.getItem("adminUser");
        setHealthFormData({
          treeId: tree?.id || "",
          treeNo: tree?.no || tree?.id || "",
          variety: tree?.variety || "",
          location: tree?.location || "",
          zone: tree?.zone || "",
          row: tree?.row || "",
          inspectionDate: new Date().toISOString().split('T')[0],
          healthStatus: "Sihat",
          diseaseType: "",
          attackLevel: "",
          treatment: "",
          notes: "",
          photos: [],
          inspectedBy: adminUser || "",
        });
      } else {
        alert("❌ Error saving health record. Please try again.");
      }
    } catch (error) {
      console.error("Error saving health record:", error);
      alert("❌ Error saving health record. Please check your Firebase configuration.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Update Tree Data</h1>
              <p className="text-gray-100 mt-1">Complete data update via QR scan</p>
            </div>
            <Link
              href="/admin"
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
          </div>
          {/* Sync Status Indicator */}
          <div className="flex justify-end">
            <SyncStatusIndicator />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Health Check Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowHealthModal(true)}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Stethoscope size={28} />
            <span className="text-xl">🌳 Quick Health Check</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tree.variety}</h2>
              <p className="text-gray-600">Tree No: {tree.no || tree.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Zone: {tree.zone || "N/A"}</p>
              <p className="text-sm text-gray-600">Row: {tree.row || "N/A"}</p>
              <p className="text-sm text-gray-600">Clone: {tree.cloneType || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Age:</span> {tree.treeAge} years
            </div>
            <div>
              <span className="font-semibold text-gray-700">Location:</span> {tree.location}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Yield:</span> {tree.yield}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Annual Measurements Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4 pb-3 border-b-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-900">📏 Ukuran Tahunan (Annual Measurements)</h3>
              <p className="text-sm text-gray-600">Update setahun sekali - Canopy and circumference measurements</p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tarikh Baru (New Date)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={updateForm.tarikhBaru}
                      onChange={(e) => setUpdateForm({ ...updateForm, tarikhBaru: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickDateUpdate("tarikhBaru")}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Saiz Kanopi Baru (m) - New Canopy Size
                  </label>
                  <input
                    type="text"
                    value={updateForm.saizKanopiBaru}
                    onChange={(e) => setUpdateForm({ ...updateForm, saizKanopiBaru: e.target.value })}
                    placeholder="e.g., 8.5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Saiz Ukur Lilit Baru (cm) - New Circumference
                  </label>
                  <input
                    type="text"
                    value={updateForm.saizUkurLilitBaru}
                    onChange={(e) => setUpdateForm({ ...updateForm, saizUkurLilitBaru: e.target.value })}
                    placeholder="e.g., 125"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-3">Previous Measurements (for reference)</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tarikh Lama (Old Date)</label>
                    <input
                      type="date"
                      value={updateForm.tarikhLama}
                      onChange={(e) => setUpdateForm({ ...updateForm, tarikhLama: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tropical-lime focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Kanopi Lama (m)</label>
                    <input
                      type="text"
                      value={updateForm.saizKanopiLama}
                      onChange={(e) => setUpdateForm({ ...updateForm, saizKanopiLama: e.target.value })}
                      placeholder="e.g., 7.8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tropical-lime focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Lilit Lama (mm)</label>
                    <input
                      type="text"
                      value={updateForm.saizUkurLilitLama}
                      onChange={(e) => setUpdateForm({ ...updateForm, saizUkurLilitLama: e.target.value })}
                      placeholder="e.g., 1180"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tropical-lime focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Maintenance Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4 pb-3 border-b-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900">🌱 Rawatan Mingguan (Weekly Maintenance)</h3>
              <p className="text-sm text-gray-600">Update setiap minggu - Fertilizer and pesticide tracking</p>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tarikh Baja (Fertilizer Date)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={updateForm.tarikhBaja}
                      onChange={(e) => setUpdateForm({ ...updateForm, tarikhBaja: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickDateUpdate("tarikhBaja")}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Baja (Fertilizer Type)
                  </label>
                  <input
                    type="text"
                    value={updateForm.jenisBaja}
                    onChange={(e) => setUpdateForm({ ...updateForm, jenisBaja: e.target.value })}
                    placeholder="e.g., NPK 15-15-15 (Organic)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tarikh Racun (Pesticide Date)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={updateForm.tarikhRacun}
                      onChange={(e) => setUpdateForm({ ...updateForm, tarikhRacun: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickDateUpdate("tarikhRacun")}
                      className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm font-semibold"
                    >
                      Today
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Racun (Pesticide Type)
                  </label>
                  <input
                    type="text"
                    value={updateForm.jenisRacun}
                    onChange={(e) => setUpdateForm({ ...updateForm, jenisRacun: e.target.value })}
                    placeholder="e.g., Neem Oil (Natural)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health & Condition Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4 pb-3 border-b-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900">💚 Health & Condition</h3>
              <p className="text-sm text-gray-600">Tree health status and observations</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Health Status *
                </label>
                <select
                  value={updateForm.health}
                  onChange={(e) => setUpdateForm({ ...updateForm, health: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
                  required
                >
                  <option value="Excellent">✅ Excellent</option>
                  <option value="Good">👍 Good</option>
                  <option value="Fair">⚠️ Fair</option>
                  <option value="Needs Attention">🚨 Needs Attention</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Condition
                </label>
                <input
                  type="text"
                  value={updateForm.currentCondition}
                  onChange={(e) => setUpdateForm({ ...updateForm, currentCondition: e.target.value })}
                  placeholder="e.g., Flowering, Fruiting, Dormant, Healthy Growth"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <input
                  type="checkbox"
                  id="requiresAttention"
                  checked={updateForm.requiresAttention}
                  onChange={(e) => setUpdateForm({ ...updateForm, requiresAttention: e.target.checked })}
                  className="w-5 h-5 text-tropical-lime border-gray-300 rounded focus:ring-tropical-lime"
                />
                <label htmlFor="requiresAttention" className="text-sm font-semibold text-gray-700">
                  🚨 This tree requires immediate attention
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Observations
                </label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  rows={4}
                  placeholder="Enter any observations, issues, or actions taken..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-tropical-green to-tropical-lime hover:from-tropical-lime hover:to-tropical-green text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg text-lg"
          >
            <Save size={24} />
            <span>Save All Updates</span>
          </button>
        </form>
      </div>

      {/* Quick Health Check Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Stethoscope size={28} />
                  <h2 className="text-2xl font-bold">Quick Health Inspection</h2>
                </div>
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="mt-2 text-green-100">
                {tree.variety} - Tree #{tree.no || tree.id}
              </p>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Inspection Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inspection Date *
                  </label>
                  <input
                    type="date"
                    value={healthFormData.inspectionDate}
                    onChange={(e) => setHealthFormData({ ...healthFormData, inspectionDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Health Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Health Status *
                  </label>
                  <select
                    value={healthFormData.healthStatus}
                    onChange={(e) => setHealthFormData({ ...healthFormData, healthStatus: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                    required
                  >
                    <option value="Sihat">✅ Sihat (Healthy)</option>
                    <option value="Sederhana">⚠️ Sederhana (Moderate)</option>
                    <option value="Sakit">🚨 Sakit (Sick)</option>
                  </select>
                </div>

                {/* Disease Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Disease/Attack Type
                  </label>
                  <select
                    value={healthFormData.diseaseType}
                    onChange={(e) => setHealthFormData({ ...healthFormData, diseaseType: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    {diseaseTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Attack Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attack Severity Level
                  </label>
                  <select
                    value={healthFormData.attackLevel}
                    onChange={(e) => setHealthFormData({ ...healthFormData, attackLevel: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  >
                    <option value="">None</option>
                    <option value="Ringan">Ringan (Light &lt; 25%)</option>
                    <option value="Sederhana">Sederhana (Moderate 25-50%)</option>
                    <option value="Teruk">Teruk (Severe &gt; 50%)</option>
                  </select>
                </div>

                {/* Treatment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Treatment / Action Taken
                  </label>
                  <input
                    type="text"
                    value={healthFormData.treatment}
                    onChange={(e) => setHealthFormData({ ...healthFormData, treatment: e.target.value })}
                    placeholder="e.g., Sembur fungisida, buang bahagian terjejas"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Photos 📷
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Capture before/after photos to track progress</p>

                  {/* Photo Preview */}
                  {healthFormData.photos && healthFormData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {healthFormData.photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observations & Notes
                  </label>
                  <textarea
                    value={healthFormData.notes}
                    onChange={(e) => setHealthFormData({ ...healthFormData, notes: e.target.value })}
                    rows={3}
                    placeholder="Enter detailed observations, symptoms, etc..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Inspected By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Inspected By *
                  </label>
                  <input
                    type="text"
                    value={healthFormData.inspectedBy}
                    onChange={(e) => setHealthFormData({ ...healthFormData, inspectedBy: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHealthRecord}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Save size={20} />
                <span>Save Health Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
