"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Save, Edit, Trash2, Plus, X, Camera } from "lucide-react";
import { TreeHealthRecord } from "@/types/tree";
import Link from "next/link";
import {
  getAllTrees,
  getAllHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} from "@/lib/firebaseService";

export default function TreeHealthManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState<TreeHealthRecord[]>([]);
  const [editingRecord, setEditingRecord] = useState<TreeHealthRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [trees, setTrees] = useState<any[]>([]);

  // Disease types from the HTML file
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

  const [formData, setFormData] = useState<Partial<TreeHealthRecord>>({
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
      setFormData(prev => ({ ...prev, inspectedBy: adminUser || "" }));
      loadData();
    } else {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [router]);

  const loadData = async () => {
    try {
      // Load trees for dropdown
      const treesData = await getAllTrees();
      setTrees(treesData);

      // Load health records from Firebase
      const records = await getAllHealthRecords();
      setHealthRecords(records);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  const handleTreeSelect = (treeId: string) => {
    const selectedTree = trees.find(t => t.id === treeId);
    if (selectedTree) {
      setFormData(prev => ({
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

  const handleSave = async () => {
    if (!formData.treeId || !formData.healthStatus || !formData.inspectionDate) {
      alert("Please fill in required fields: Tree, Health Status, and Inspection Date");
      return;
    }

    const newRecord: TreeHealthRecord = {
      id: editingRecord?.id || `health-${Date.now()}`,
      treeId: formData.treeId!,
      treeNo: formData.treeNo!,
      variety: formData.variety!,
      location: formData.location!,
      zone: formData.zone,
      row: formData.row,
      inspectionDate: formData.inspectionDate!,
      healthStatus: formData.healthStatus as "Sihat" | "Sederhana" | "Sakit",
      diseaseType: formData.diseaseType,
      attackLevel: formData.attackLevel as "Ringan" | "Sederhana" | "Teruk" | "",
      treatment: formData.treatment,
      notes: formData.notes,
      photos: formData.photos || [],
      inspectedBy: formData.inspectedBy!,
      updatedAt: new Date().toISOString(),
    };

    try {
      let success = false;
      if (editingRecord) {
        success = await updateHealthRecord(editingRecord.id, newRecord);
      } else {
        success = await createHealthRecord(newRecord);
      }

      if (success) {
        // Reload data from Firebase
        await loadData();

        // Reset form
        resetForm();
        setShowAddModal(false);
        setEditingRecord(null);
        alert(editingRecord ? "✅ Record updated successfully in Firebase!" : "✅ Record added successfully to Firebase!");
      } else {
        alert("❌ Error saving record. Please try again.");
      }
    } catch (error) {
      console.error("Error saving health record:", error);
      alert("❌ Error saving record. Please check your Firebase configuration.");
    }
  };

  const handleEdit = (record: TreeHealthRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this health record?")) {
      try {
        const success = await deleteHealthRecord(id);
        if (success) {
          // Reload data from Firebase
          await loadData();
          alert("✅ Record deleted successfully from Firebase!");
        } else {
          alert("❌ Error deleting record. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting health record:", error);
        alert("❌ Error deleting record. Please check your Firebase configuration.");
      }
    }
  };

  const resetForm = () => {
    const adminUser = localStorage.getItem("adminUser");
    setFormData({
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

  const getStatsData = () => {
    return {
      total: healthRecords.length,
      healthy: healthRecords.filter(r => r.healthStatus === "Sihat").length,
      moderate: healthRecords.filter(r => r.healthStatus === "Sederhana").length,
      sick: healthRecords.filter(r => r.healthStatus === "Sakit").length,
    };
  };

  const stats = getStatsData();

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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tree Health Management</h1>
              <p className="text-gray-100 mt-1">Monitor tree conditions, diseases, and treatments</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.total}</h3>
            <p className="text-gray-600">Total Records</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-green-600 mb-2">{stats.healthy}</h3>
            <p className="text-gray-600">Sihat (Healthy)</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-yellow-600 mb-2">{stats.moderate}</h3>
            <p className="text-gray-600">Sederhana (Moderate)</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-4xl font-bold text-red-600 mb-2">{stats.sick}</h3>
            <p className="text-gray-600">Sakit (Sick)</p>
          </div>
        </div>

        {/* Add Record Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setEditingRecord(null);
              setShowAddModal(true);
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
                  <th className="px-4 py-3 text-left font-semibold">Inspected By</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {healthRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
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
                      <td className="px-4 py-3 text-sm">{record.inspectedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingRecord ? "Edit Health Record" : "Add New Health Record"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecord(null);
                    resetForm();
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
                    value={formData.treeId}
                    onChange={(e) => handleTreeSelect(e.target.value)}
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
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
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
                    value={formData.healthStatus}
                    onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
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
                    value={formData.diseaseType}
                    onChange={(e) => setFormData({ ...formData, diseaseType: e.target.value })}
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
                    value={formData.attackLevel}
                    onChange={(e) => setFormData({ ...formData, attackLevel: e.target.value as any })}
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
                    value={formData.treatment}
                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
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
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
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
                    value={formData.inspectedBy}
                    onChange={(e) => setFormData({ ...formData, inspectedBy: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Save size={20} />
                <span>{editingRecord ? "Update" : "Save"} Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
