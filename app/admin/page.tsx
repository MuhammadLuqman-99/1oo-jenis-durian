"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Save, X, Plus, Trash2, ArrowLeft, LogOut, QrCode, Camera, Image as ImageIcon } from "lucide-react";
import { treesData as initialTreesData, farmActivities as initialActivities } from "@/data/trees";
import { TreeInfo, FarmActivity, TreeHealthRecord } from "@/types/tree";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  getAllTrees,
  updateTree as updateTreeInFirebase,
  initializeTreesInFirebase,
  getAllHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} from "@/lib/firebaseService";
import {
  saveHealthRecordOffline,
  getAllHealthRecordsOffline,
  updateHealthRecordOffline,
  deleteHealthRecordOffline,
  isOnline,
} from "@/lib/offlineStorage";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trees, setTrees] = useState<TreeInfo[]>(initialTreesData);
  const [activities, setActivities] = useState<FarmActivity[]>(initialActivities);
  const [editingTree, setEditingTree] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TreeInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"trees" | "table" | "activities" | "qrcodes" | "health">("trees");
  const [showingQR, setShowingQR] = useState<string | null>(null);

  // Health Records State
  const [healthRecords, setHealthRecords] = useState<TreeHealthRecord[]>([]);
  const [editingHealthRecord, setEditingHealthRecord] = useState<TreeHealthRecord | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string>("");
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

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const adminUser = localStorage.getItem("adminUser");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
      setHealthFormData(prev => ({ ...prev, inspectedBy: adminUser || "" }));
      loadTreesFromFirebase();
      loadHealthRecords();
    } else {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [router]);

  const loadTreesFromFirebase = async () => {
    try {
      const firebaseTrees = await getAllTrees();

      if (firebaseTrees.length > 0) {
        setTrees(firebaseTrees);
      } else {
        // Initialize Firebase with default data on first run
        await initializeTreesInFirebase(initialTreesData);
        setTrees(initialTreesData);
      }
    } catch (error) {
      console.error("Error loading trees from Firebase:", error);
      // Fallback to local data if Firebase fails
      setTrees(initialTreesData);
    }
  };

  const loadHealthRecords = async () => {
    try {
      // Try offline storage first
      const offlineRecords = await getAllHealthRecordsOffline();

      if (offlineRecords.length > 0) {
        setHealthRecords(offlineRecords);
      }

      // If online, also try to fetch from Firebase
      if (isOnline()) {
        const firebaseRecords = await getAllHealthRecords();
        if (firebaseRecords.length > 0) {
          setHealthRecords(firebaseRecords);
        }
      }
    } catch (error) {
      console.error("Error loading health records:", error);
      // Try offline as fallback
      try {
        const offlineRecords = await getAllHealthRecordsOffline();
        setHealthRecords(offlineRecords);
      } catch (offlineError) {
        console.error("Error loading offline records:", offlineError);
      }
    }
  };

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

  const handleTreeSelectForHealth = (treeId: string) => {
    const selectedTree = trees.find(t => t.id === treeId);
    if (selectedTree) {
      setHealthFormData(prev => ({
        ...prev,
        treeId: selectedTree.id,
        treeNo: selectedTree.no || selectedTree.id,
        variety: selectedTree.variety,
        location: selectedTree.location,
        zone: selectedTree.zone || "",
        row: selectedTree.row || "",
      }));
    }
  };

  const handleSaveHealthRecord = async () => {
    if (!healthFormData.treeId || !healthFormData.healthStatus || !healthFormData.inspectionDate) {
      alert("Please fill in required fields: Tree, Health Status, and Inspection Date");
      return;
    }

    const newRecord: TreeHealthRecord = {
      id: editingHealthRecord?.id || `health-${Date.now()}`,
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
      let success = false;

      // Offline-first approach: Always save locally first
      if (editingHealthRecord) {
        success = await updateHealthRecordOffline(editingHealthRecord.id, newRecord);
      } else {
        success = await saveHealthRecordOffline(newRecord);
      }

      if (success) {
        await loadHealthRecords();
        resetHealthForm();
        setShowHealthModal(false);
        setEditingHealthRecord(null);

        // Show appropriate message based on network status
        const message = editingHealthRecord ? "✅ Record updated" : "✅ Record added";
        const syncNote = isOnline() ? " and syncing..." : " (will sync when online)";
        alert(message + syncNote);
      } else {
        alert("❌ Error saving record. Please try again.");
      }
    } catch (error) {
      console.error("Error saving health record:", error);
      alert("❌ Error saving record. Please check your storage.");
    }
  };

  const handleEditHealthRecord = (record: TreeHealthRecord) => {
    setEditingHealthRecord(record);
    setHealthFormData(record);
    setShowHealthModal(true);
  };

  const handleDeleteHealthRecord = async (id: string) => {
    if (confirm("Are you sure you want to delete this health record?")) {
      try {
        // Offline-first approach: Always delete locally first
        const success = await deleteHealthRecordOffline(id);
        if (success) {
          await loadHealthRecords();
          const syncNote = isOnline() ? " and syncing..." : " (will sync when online)";
          alert("✅ Record deleted" + syncNote);
        } else {
          alert("❌ Error deleting record. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting health record:", error);
        alert("❌ Error deleting record.");
      }
    }
  };

  const resetHealthForm = () => {
    const adminUser = localStorage.getItem("adminUser");
    setHealthFormData({
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
      inspectedBy: adminUser || "",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Sihat": return "bg-green-100 text-green-800";
      case "Sederhana": return "bg-yellow-100 text-yellow-800";
      case "Sakit": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthStats = () => {
    return {
      total: healthRecords.length,
      healthy: healthRecords.filter(r => r.healthStatus === "Sihat").length,
      moderate: healthRecords.filter(r => r.healthStatus === "Sederhana").length,
      sick: healthRecords.filter(r => r.healthStatus === "Sakit").length,
    };
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

  const viewPhoto = (photo: string) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const handleEdit = (tree: TreeInfo) => {
    setEditingTree(tree.id);
    setEditForm({ ...tree });
  };

  const handleSave = async () => {
    if (editForm) {
      try {
        const success = await updateTreeInFirebase(editForm.id, editForm);

        if (success) {
          setTrees(trees.map((t) => (t.id === editForm.id ? editForm : t)));
          setEditingTree(null);
          setEditForm(null);
          alert("✅ Tree information updated successfully in Firebase!");
        } else {
          alert("❌ Error updating tree. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("❌ Error updating tree. Please check your Firebase configuration.");
      }
    }
  };

  const handleCancel = () => {
    setEditingTree(null);
    setEditForm(null);
  };

  const handleChange = (field: keyof TreeInfo, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleDeleteActivity = (id: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      setActivities(activities.filter((a) => a.id !== id));
      alert("Activity deleted successfully!");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-100 mt-1">Manage tree information and farm activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
          {/* Sync Status Indicator */}
          <div className="flex justify-end">
            <SyncStatusIndicator />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/bulk-import"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg"
            >
              <Plus size={20} />
              <span>Bulk Import Trees (500+)</span>
            </Link>
            <Link
              href="/farm-transparency"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              View Farm Map
            </Link>
          </div>
        </div>

        <div className="flex space-x-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("trees")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "trees"
                ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            Tree Management
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "table"
                ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            Data Table
          </button>
          <button
            onClick={() => setActiveTab("qrcodes")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "qrcodes"
                ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            QR Codes
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "health"
                ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            🌳 Tree Health
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === "activities"
                ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            Farm Activities
          </button>
        </div>

        {activeTab === "trees" && (
          <div className="space-y-6">
            {trees.map((tree) => (
              <div key={tree.id} className="bg-white rounded-xl shadow-lg p-6">
                {editingTree === tree.id && editForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Edit Tree Information</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Save size={20} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <X size={20} />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Variety</label>
                        <input
                          type="text"
                          value={editForm.variety}
                          onChange={(e) => handleChange("variety", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tree Age (years)</label>
                        <input
                          type="number"
                          value={editForm.treeAge}
                          onChange={(e) => handleChange("treeAge", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Health Status</label>
                        <select
                          value={editForm.health}
                          onChange={(e) => handleChange("health", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Needs Attention">Needs Attention</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Fertilized</label>
                        <input
                          type="date"
                          value={editForm.lastFertilized}
                          onChange={(e) => handleChange("lastFertilized", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fertilizer Type</label>
                        <input
                          type="text"
                          value={editForm.fertilizerType}
                          onChange={(e) => handleChange("fertilizerType", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Harvest</label>
                        <input
                          type="date"
                          value={editForm.lastHarvest}
                          onChange={(e) => handleChange("lastHarvest", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Next Expected Harvest</label>
                        <input
                          type="date"
                          value={editForm.nextExpectedHarvest}
                          onChange={(e) => handleChange("nextExpectedHarvest", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Yield</label>
                        <input
                          type="text"
                          value={editForm.yield}
                          onChange={(e) => handleChange("yield", e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => handleChange("notes", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{tree.variety}</h3>
                        <p className="text-gray-600">ID: {tree.id}</p>
                      </div>
                      <button
                        onClick={() => handleEdit(tree)}
                        className="flex items-center space-x-2 bg-tropical-lime hover:bg-tropical-green text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Edit size={20} />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Age:</span> {tree.treeAge} years
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Location:</span> {tree.location}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Health:</span> {tree.health}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Last Fertilized:</span> {tree.lastFertilized}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Fertilizer:</span> {tree.fertilizerType}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Yield:</span> {tree.yield}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "table" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">📏 Ukuran Tahunan Pokok (Annual Tree Measurements)</h3>
                <p className="text-gray-700 text-sm">Update setahun sekali - Saiz kanopi dan ukur lilit</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ fontSize: '0.7rem' }}>
                  <thead className="bg-tropical-green text-white sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '40px' }}>Bil</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '90px' }}>No</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '80px' }}>Zone</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '60px' }}>Bilau</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '120px' }}>Variety</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '100px' }}>Tarikh Baru</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '80px' }}>Kanopi Baru (m)</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-700" style={{ minWidth: '80px' }}>Lilit Baru (cm)</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-600" style={{ minWidth: '100px' }}>Tarikh Lama</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-green-600" style={{ minWidth: '80px' }}>Kanopi Lama (m)</th>
                      <th className="px-2 py-2 text-left font-semibold bg-green-600" style={{ minWidth: '80px' }}>Lilit Lama (mm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trees.map((tree, index) => (
                      <tr key={tree.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                        <td className="px-2 py-2 border-r border-gray-200 font-semibold">{tree.bil || index + 1}</td>
                        <td className="px-2 py-2 border-r border-gray-200">{tree.no || tree.id}</td>
                        <td className="px-2 py-2 border-r border-gray-200">{tree.zone || "-"}</td>
                        <td className="px-2 py-2 border-r border-gray-200">{tree.row || "-"}</td>
                        <td className="px-2 py-2 border-r border-gray-200 font-medium">{tree.variety}</td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                          <input
                            type="date"
                            value={tree.tarikhBaru || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, tarikhBaru: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                          <input
                            type="text"
                            value={tree.saizKanopiBaru || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, saizKanopiBaru: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="0.0"
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-green-50">
                          <input
                            type="text"
                            value={tree.saizUkurLilitBaru || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, saizUkurLilitBaru: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="0.0"
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-yellow-50">
                          <input
                            type="date"
                            value={tree.tarikhLama || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, tarikhLama: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-yellow-50">
                          <input
                            type="text"
                            value={tree.saizKanopiLama || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, saizKanopiLama: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="0.0"
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 bg-yellow-50">
                          <input
                            type="text"
                            value={tree.saizUkurLilitLama || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, saizUkurLilitLama: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="0.0"
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-tropical-lime focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    alert("Data saved successfully! In production, this would save to database.");
                  }}
                  className="bg-gradient-to-r from-tropical-green to-tropical-lime hover:from-tropical-lime hover:to-tropical-green text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save Ukuran Tahunan</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-orange-50 border-b-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">🌱 Rawatan Mingguan (Weekly Maintenance)</h3>
                <p className="text-gray-700 text-sm">Update setiap minggu - Baja dan racun</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ fontSize: '0.7rem' }}>
                  <thead className="bg-gradient-to-r from-blue-600 to-orange-600 text-white sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '40px' }}>Bil</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '90px' }}>No</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '120px' }}>Variety</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20" style={{ minWidth: '80px' }}>Zone</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-blue-700" style={{ minWidth: '100px' }}>Tarikh Baja</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-blue-700" style={{ minWidth: '150px' }}>Jenis Baja</th>
                      <th className="px-2 py-2 text-left font-semibold border-r border-white/20 bg-orange-700" style={{ minWidth: '100px' }}>Tarikh Racun</th>
                      <th className="px-2 py-2 text-left font-semibold bg-orange-700" style={{ minWidth: '150px' }}>Jenis Racun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trees.map((tree, index) => (
                      <tr key={tree.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                        <td className="px-2 py-2 border-r border-gray-200 font-semibold">{tree.bil || index + 1}</td>
                        <td className="px-2 py-2 border-r border-gray-200">{tree.no || tree.id}</td>
                        <td className="px-2 py-2 border-r border-gray-200 font-medium">{tree.variety}</td>
                        <td className="px-2 py-2 border-r border-gray-200">{tree.zone || "-"}</td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-blue-50">
                          <input
                            type="date"
                            value={tree.tarikhBaja || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, tarikhBaja: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-blue-50">
                          <input
                            type="text"
                            value={tree.jenisBaja || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, jenisBaja: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="NPK 15-15-15, Organic..."
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-200 bg-orange-50">
                          <input
                            type="date"
                            value={tree.tarikhRacun || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, tarikhRacun: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                        <td className="px-2 py-2 bg-orange-50">
                          <input
                            type="text"
                            value={tree.jenisRacun || ""}
                            onChange={(e) => {
                              const updated = trees.map(t =>
                                t.id === tree.id ? { ...t, jenisRacun: e.target.value } : t
                              );
                              setTrees(updated);
                            }}
                            placeholder="Insecticide, Fungicide..."
                            className="w-full px-1 py-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                            style={{ fontSize: '0.7rem' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    alert("Data saved successfully! In production, this would save to database.");
                  }}
                  className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Save Rawatan Mingguan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "qrcodes" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">📱 QR Code Tree Update System</h3>
              <p className="text-gray-700">
                Print these QR codes and attach them to trees. Scan with your phone to quickly update tree conditions from the field.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trees.map((tree) => {
                const updateUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/admin/tree-update?id=${tree.id}`;

                return (
                  <div key={tree.id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{tree.variety}</h4>
                      <p className="text-sm text-gray-600 mb-4">ID: {tree.id}</p>

                      <div className="flex justify-center mb-4 p-4 bg-white border-4 border-gray-200 rounded-lg">
                        <QRCodeSVG value={updateUrl} size={200} level="H" includeMargin={true} />
                      </div>

                      <div className="text-xs text-gray-600 mb-4">
                        <p>Zone: {tree.zone || "N/A"}</p>
                        <p>Row: {tree.row || "N/A"}</p>
                        <p>Location: {tree.location}</p>
                      </div>

                      <button
                        onClick={() => {
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Print QR Code - ${tree.variety}</title>
                                  <style>
                                    body {
                                      font-family: Arial, sans-serif;
                                      text-align: center;
                                      padding: 20px;
                                    }
                                    h1 { font-size: 24px; margin-bottom: 10px; }
                                    p { margin: 5px 0; color: #666; }
                                    .qr-container {
                                      margin: 20px auto;
                                      padding: 20px;
                                      border: 4px solid #000;
                                      display: inline-block;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <h1>${tree.variety}</h1>
                                  <p><strong>Tree ID:</strong> ${tree.id}</p>
                                  <p><strong>Zone:</strong> ${tree.zone || "N/A"} | <strong>Row:</strong> ${tree.row || "N/A"}</p>
                                  <p><strong>Location:</strong> ${tree.location}</p>
                                  <div class="qr-container">
                                    ${document.querySelector(`#qr-${tree.id}`)?.innerHTML || ''}
                                  </div>
                                  <p style="margin-top: 20px;">Scan to update tree condition</p>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            setTimeout(() => {
                              printWindow.print();
                            }, 250);
                          }
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <QrCode size={18} />
                        <span>Print QR Code</span>
                      </button>

                      <div id={`qr-${tree.id}`} style={{ display: 'none' }}>
                        <QRCodeSVG value={updateUrl} size={300} level="H" includeMargin={true} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{getHealthStats().total}</h3>
                <p className="text-gray-600">Total Records</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-4xl font-bold text-green-600 mb-2">{getHealthStats().healthy}</h3>
                <p className="text-gray-600">Sihat (Healthy)</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-4xl font-bold text-yellow-600 mb-2">{getHealthStats().moderate}</h3>
                <p className="text-gray-600">Sederhana (Moderate)</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-4xl font-bold text-red-600 mb-2">{getHealthStats().sick}</h3>
                <p className="text-gray-600">Sakit (Sick)</p>
              </div>
            </div>

            {/* Add Button */}
            <div>
              <button
                onClick={() => {
                  resetHealthForm();
                  setEditingHealthRecord(null);
                  setShowHealthModal(true);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                <Plus size={20} />
                <span>Add Health Record</span>
              </button>
            </div>

            {/* Health Records Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Tree No</th>
                      <th className="px-4 py-3 text-left font-semibold">Variety</th>
                      <th className="px-4 py-3 text-left font-semibold">Location</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Disease/Attack</th>
                      <th className="px-4 py-3 text-left font-semibold">Severity</th>
                      <th className="px-4 py-3 text-left font-semibold">Treatment</th>
                      <th className="px-4 py-3 text-left font-semibold">Photos</th>
                      <th className="px-4 py-3 text-left font-semibold">Inspector</th>
                      <th className="px-4 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                          No health records yet. Click "Add Health Record" to create your first record.
                        </td>
                      </tr>
                    ) : (
                      healthRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm">
                            {new Date(record.inspectionDate).toLocaleDateString('en-MY')}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">{record.treeNo}</td>
                          <td className="px-4 py-3 text-sm">{record.variety}</td>
                          <td className="px-4 py-3 text-sm">{record.location}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(record.healthStatus)}`}>
                              {record.healthStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{record.diseaseType || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.attackLevel || "-"}</td>
                          <td className="px-4 py-3 text-sm">{record.treatment || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {record.photos && record.photos.length > 0 ? (
                                <>
                                  {record.photos.slice(0, 3).map((photo, idx) => (
                                    <img
                                      key={idx}
                                      src={photo}
                                      alt={`Tree photo ${idx + 1}`}
                                      className="w-12 h-12 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-colors"
                                      onClick={() => viewPhoto(photo)}
                                    />
                                  ))}
                                  {record.photos.length > 3 && (
                                    <div className="w-12 h-12 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                      +{record.photos.length - 3}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 text-sm">No photos</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{record.inspectedBy}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditHealthRecord(record)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteHealthRecord(record.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Farm Activities</h3>
                <button className="flex items-center space-x-2 bg-tropical-lime hover:bg-tropical-green text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus size={20} />
                  <span>Add Activity</span>
                </button>
              </div>

              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-bold text-gray-900">{activity.activity}</h4>
                        <span className="text-sm text-gray-500">{activity.date}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{activity.description}</p>
                      <p className="text-xs text-gray-500">By: {activity.performedBy}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Viewer Lightbox */}
      {showPhotoViewer && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPhotoViewer(false)}
        >
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <img
              src={selectedPhoto}
              alt="Full size view"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Health Record Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingHealthRecord ? "Edit Health Record" : "Add New Health Record"}
                </h2>
                <button
                  onClick={() => {
                    setShowHealthModal(false);
                    setEditingHealthRecord(null);
                    resetHealthForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Tree Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Tree *
                  </label>
                  <select
                    value={healthFormData.treeId}
                    onChange={(e) => handleTreeSelectForHealth(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="">Choose a tree...</option>
                    {trees.map((tree) => (
                      <option key={tree.id} value={tree.id}>
                        {tree.no || tree.id} - {tree.variety} ({tree.location})
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="Sihat">Sihat (Healthy)</option>
                    <option value="Sederhana">Sederhana (Moderate)</option>
                    <option value="Sakit">Sakit (Sick)</option>
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

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={healthFormData.notes}
                    onChange={(e) => setHealthFormData({ ...healthFormData, notes: e.target.value })}
                    rows={4}
                    placeholder="Enter detailed observations, symptoms, etc..."
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
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
                  <p className="text-xs text-gray-500 mt-1">You can select multiple photos to compare before/after conditions</p>

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
                onClick={() => {
                  setShowHealthModal(false);
                  setEditingHealthRecord(null);
                  resetHealthForm();
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHealthRecord}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Save size={20} />
                <span>{editingHealthRecord ? "Update" : "Save"} Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
