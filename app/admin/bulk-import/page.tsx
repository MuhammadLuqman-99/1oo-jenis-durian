"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, FileText, Database } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { generateTreesJSON, generateTreesCSV } from "@/utils/generateTrees";

export default function BulkImportPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [treeCount, setTreeCount] = useState(500);
  const [generatedData, setGeneratedData] = useState("");

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (adminLoggedIn !== "true") {
      router.push("/admin/login");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  const handleGenerateJSON = () => {
    const json = generateTreesJSON(treeCount);
    setGeneratedData(json);

    // Download the JSON file
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trees-${treeCount}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateCSV = () => {
    const csv = generateTreesCSV(treeCount);

    // Download the CSV file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trees-${treeCount}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateDataFile = () => {
    if (!generatedData) {
      alert("Please generate JSON data first!");
      return;
    }

    alert(
      "To update the tree data:\n\n" +
      "1. Copy the generated JSON\n" +
      "2. Open data/trees.ts\n" +
      "3. Replace the treesData array with the new data\n" +
      "4. Save the file\n\n" +
      "For production: You would save this to a database instead."
    );
  };

  if (!isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌳 Bulk Tree Data Management
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Generate and manage tree data for your entire farm. Perfect for adding 500+ trees quickly.
          </p>
        </div>

        {/* Generator Card */}
        <div className="card p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Data Generator
            </h2>
            <Database className="text-tropical-green" size={32} />
          </div>

          <div className="space-y-6">
            {/* Tree Count Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Trees to Generate
              </label>
              <input
                type="number"
                value={treeCount}
                onChange={(e) => setTreeCount(parseInt(e.target.value) || 500)}
                min="1"
                max="10000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Recommended: 500 trees (your current farm size)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleGenerateJSON}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <Download size={24} />
                <span>Generate & Download JSON</span>
              </button>

              <button
                onClick={handleGenerateCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <FileText size={24} />
                <span>Generate & Download CSV</span>
              </button>
            </div>

            {generatedData && (
              <button
                onClick={handleUpdateDataFile}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-4 rounded-lg flex items-center justify-center space-x-3 transition-colors"
              >
                <Upload size={24} />
                <span>Update Trees Data File</span>
              </button>
            )}
          </div>
        </div>

        {/* Information Card */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 How to Use This Tool
          </h3>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">1.</span>
              <span>
                <strong>Set the number of trees</strong> you want to generate (default: 500)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">2.</span>
              <span>
                <strong>Generate JSON</strong> for direct import into the application, or <strong>CSV</strong> for Excel/spreadsheet editing
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">3.</span>
              <span>
                <strong>Review and customize</strong> the data in your preferred editor
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">4.</span>
              <span>
                <strong>Import the data</strong> into your system (for now, copy JSON to data/trees.ts)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">5.</span>
              <span>
                <strong>For production:</strong> This would connect to a database (MongoDB, PostgreSQL, etc.)
              </span>
            </li>
          </ol>
        </div>

        {/* Generated Data Structure */}
        <div className="card p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔧 Generated Data Structure
          </h3>
          <p className="text-gray-700 mb-4">
            Each tree will be generated with the following information:
          </p>
          <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Unique Tree ID (tree-001, tree-002, etc.)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Variety (Musang King, Black Thorn, etc.)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Tree Age (5-25 years)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Planting Date</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Location (Block, Row, Position)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Fertilization History</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Harvest Records</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Health Status</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Annual Yield</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Care History Timeline</span>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <a href="/admin" className="btn-secondary">
            ← Back to Admin Dashboard
          </a>
          <a href="/farm-transparency" className="btn-primary">
            View Farm Map
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
