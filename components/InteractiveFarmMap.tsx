"use client";

import { useState } from "react";
import { X, MapPin, Calendar, Droplet, Heart, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { treesData } from "@/data/trees";
import type { TreeInfo } from "@/types/tree";

// Tree positions on the 3D map (percentage based)
const treePositions = [
  { treeId: "tree-001", x: 25, y: 40, block: "A", size: 1.2 }, // Musang King - larger
  { treeId: "tree-002", x: 45, y: 35, block: "B", size: 1.1 }, // Black Thorn
  { treeId: "tree-003", x: 20, y: 60, block: "A", size: 1.3 }, // D24 - oldest/largest
  { treeId: "tree-004", x: 70, y: 50, block: "C", size: 1.0 }, // Red Prawn
];

export default function InteractiveFarmMap() {
  const [selectedTree, setSelectedTree] = useState<TreeInfo | null>(null);
  const [hoveredTree, setHoveredTree] = useState<string | null>(null);

  const getTreeByPosition = (treeId: string) => {
    return treesData.find((tree) => tree.id === treeId);
  };

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

  const getTreeUrl = (treeId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/tree/${treeId}`;
    }
    return `https://100jenisdurian.com/tree/${treeId}`;
  };

  const downloadQRCode = (treeId: string, variety: string) => {
    const svg = document.getElementById(`qr-${treeId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${variety}-QR-Code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-tropical-lime/10 px-4 py-2 rounded-full mb-4">
            <span className="text-tropical-green font-semibold">
              🗺️ Interactive Farm Map
            </span>
          </div>
          <h2 className="section-title mb-4">Explore Our Farm</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Click on any tree to see its complete history. Each tree has its own QR code for instant access!
          </p>
        </div>

        {/* 3D Illustrated Farm Map */}
        <div className="card p-4 md:p-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            {/* 3D Farm Scene */}
            <svg viewBox="0 0 1000 600" className="w-full h-full">
              {/* Sky Gradient */}
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#87CEEB" />
                  <stop offset="100%" stopColor="#E0F6FF" />
                </linearGradient>
                <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7CB342" />
                  <stop offset="100%" stopColor="#558B2F" />
                </linearGradient>
                <radialGradient id="sunGradient">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </radialGradient>
              </defs>

              {/* Sky */}
              <rect width="1000" height="600" fill="url(#skyGradient)" />

              {/* Sun */}
              <circle cx="850" cy="100" r="60" fill="url(#sunGradient)" opacity="0.8" />

              {/* Clouds */}
              <g opacity="0.7">
                <ellipse cx="200" cy="120" rx="60" ry="25" fill="white" />
                <ellipse cx="230" cy="115" rx="50" ry="30" fill="white" />
                <ellipse cx="170" cy="115" rx="45" ry="28" fill="white" />
              </g>
              <g opacity="0.6">
                <ellipse cx="700" cy="150" rx="70" ry="30" fill="white" />
                <ellipse cx="740" cy="145" rx="55" ry="35" fill="white" />
              </g>

              {/* Distant Hills */}
              <path d="M0,350 Q250,280 500,320 T1000,350 L1000,600 L0,600 Z" fill="#4A7C59" opacity="0.4" />
              <path d="M0,380 Q200,320 400,360 T800,380 L1000,380 L1000,600 L0,600 Z" fill="#5D8D5A" opacity="0.5" />

              {/* Main Ground - 3D perspective */}
              <path d="M0,400 L1000,400 L1000,600 L0,600 Z" fill="url(#grassGradient)" />

              {/* Farm Paths - 3D roads */}
              <g>
                {/* Vertical path */}
                <path d="M480,400 L490,600" stroke="#8B7355" strokeWidth="30" opacity="0.6" />
                <path d="M485,400 L495,600" stroke="#A0826D" strokeWidth="15" opacity="0.8" />

                {/* Horizontal paths */}
                <path d="M200,440 L800,460" stroke="#8B7355" strokeWidth="25" opacity="0.6" />
                <path d="M200,445 L800,465" stroke="#A0826D" strokeWidth="12" opacity="0.8" />

                <path d="M150,520 L850,540" stroke="#8B7355" strokeWidth="25" opacity="0.6" />
                <path d="M150,525 L850,545" stroke="#A0826D" strokeWidth="12" opacity="0.8" />
              </g>

              {/* Farm Blocks Background */}
              {/* Block A */}
              <rect x="100" y="420" width="300" height="150" rx="10" fill="#2E7D32" opacity="0.2" />
              {/* Block B */}
              <rect x="350" y="380" width="300" height="150" rx="10" fill="#1B5E20" opacity="0.2" />
              {/* Block C */}
              <rect x="600" y="440" width="300" height="140" rx="10" fill="#33691E" opacity="0.2" />

              {/* Grass patches for depth */}
              <g opacity="0.4">
                {[...Array(20)].map((_, i) => (
                  <ellipse
                    key={i}
                    cx={Math.random() * 1000}
                    cy={400 + Math.random() * 200}
                    rx={20 + Math.random() * 30}
                    ry={8 + Math.random() * 12}
                    fill="#4CAF50"
                  />
                ))}
              </g>
            </svg>

            {/* Interactive Trees Layer */}
            <div className="absolute inset-0">
              {treePositions.map((pos) => {
                const tree = getTreeByPosition(pos.treeId);
                if (!tree) return null;

                const isHovered = hoveredTree === pos.treeId;
                const isSelected = selectedTree?.id === pos.treeId;
                const scale = pos.size || 1;

                return (
                  <button
                    key={pos.treeId}
                    onClick={() => setSelectedTree(tree)}
                    onMouseEnter={() => setHoveredTree(pos.treeId)}
                    onMouseLeave={() => setHoveredTree(null)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      transform: `translate(-50%, -50%) scale(${isHovered || isSelected ? scale * 1.2 : scale})`,
                    }}
                  >
                    {/* 3D Tree Illustration */}
                    <div className="relative">
                      {/* Tree Shadow */}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm"></div>

                      {/* Tree SVG */}
                      <svg width="80" height="100" viewBox="0 0 80 100" className="drop-shadow-lg">
                        {/* Trunk */}
                        <rect x="32" y="60" width="16" height="30" fill="#6D4C41" rx="2" />
                        <rect x="34" y="62" width="4" height="28" fill="#8D6E63" opacity="0.5" />

                        {/* Foliage layers - 3D effect */}
                        {/* Bottom layer */}
                        <ellipse cx="40" cy="60" rx="28" ry="20" fill="#2E7D32" />
                        <ellipse cx="40" cy="60" rx="24" ry="17" fill="#388E3C" />

                        {/* Middle layer */}
                        <ellipse cx="40" cy="45" rx="26" ry="18" fill="#388E3C" />
                        <ellipse cx="40" cy="45" rx="22" ry="15" fill="#43A047" />

                        {/* Top layer */}
                        <ellipse cx="40" cy="32" rx="22" ry="16" fill="#43A047" />
                        <ellipse cx="40" cy="32" rx="18" ry="13" fill="#66BB6A" />

                        {/* Durian fruits */}
                        <circle cx="50" cy="50" r="6" fill="#FFA726" />
                        <circle cx="50" cy="50" r="5" fill="#FFB74D" />
                        <circle cx="30" cy="55" r="5" fill="#FFA726" />
                        <circle cx="30" cy="55" r="4" fill="#FFB74D" />

                        {/* Highlights */}
                        <ellipse cx="35" cy="35" rx="8" ry="6" fill="#81C784" opacity="0.6" />
                      </svg>

                      {/* Pulsing ring for interaction */}
                      {!isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-tropical-lime/30 animate-ping"></div>
                        </div>
                      )}

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -inset-2 border-4 border-primary-500 rounded-full animate-pulse"></div>
                      )}

                      {/* Hover/Selected Label */}
                      {(isHovered || isSelected) && (
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                          <div className="bg-white px-4 py-2 rounded-lg shadow-xl border-2 border-tropical-lime">
                            <p className="text-sm font-bold text-gray-900">
                              {tree.variety}
                            </p>
                            <p className="text-xs text-gray-600">
                              {tree.location}
                            </p>
                            <p className="text-xs text-tropical-green font-semibold">
                              Click for details
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Block Labels */}
            <div className="absolute top-4 left-4 space-y-2 z-10">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border-l-4 border-green-600">
                <p className="text-sm font-bold text-tropical-green">🌳 Block A - Premium</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border-l-4 border-emerald-600">
                <p className="text-sm font-bold text-emerald-700">🌳 Block B - Specialty</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border-l-4 border-lime-600">
                <p className="text-sm font-bold text-lime-700">🌳 Block C - Exotic</p>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md z-10">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                🖱️ Click trees to view details & QR codes
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-tropical-lime rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Interactive Tree</span>
              </div>
            </div>
          </div>

          {/* Map Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border-2 border-green-200">
              <p className="text-3xl font-bold text-tropical-green">{treesData.length}</p>
              <p className="text-sm text-gray-600">Total Trees</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl text-center border-2 border-blue-200">
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-sm text-gray-600">Farm Blocks</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl text-center border-2 border-amber-200">
              <p className="text-3xl font-bold text-amber-600">100+</p>
              <p className="text-sm text-gray-600">Varieties</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border-2 border-purple-200">
              <p className="text-3xl font-bold text-purple-600">25</p>
              <p className="text-sm text-gray-600">Avg Tree Age</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Detail Modal - same as before */}
      {selectedTree && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-tropical-green to-tropical-lime text-white p-6 rounded-t-2xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">{selectedTree.variety}</h3>
                  <p className="text-gray-100">ID: {selectedTree.id}</p>
                  <p className="text-gray-100">{selectedTree.location}</p>
                </div>
                <button
                  onClick={() => setSelectedTree(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Tree Info */}
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="text-blue-600" size={24} />
                      <h4 className="font-bold text-gray-900">Tree Age</h4>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-1">
                      {selectedTree.treeAge} years
                    </p>
                    <p className="text-sm text-gray-600">
                      Planted: {formatDate(selectedTree.plantedDate)}
                    </p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Droplet className="text-green-600" size={24} />
                      <h4 className="font-bold text-gray-900">Last Fertilized</h4>
                    </div>
                    <p className="text-xl font-bold text-green-600 mb-1">
                      {formatDate(selectedTree.lastFertilized)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {calculateDaysSince(selectedTree.lastFertilized)} days ago
                    </p>
                    <p className="text-sm text-gray-700 mt-2">{selectedTree.fertilizerType}</p>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="text-amber-600" size={24} />
                      <h4 className="font-bold text-gray-900">Annual Yield</h4>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{selectedTree.yield}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl text-center border-2 border-purple-200">
                    <h4 className="font-bold text-gray-900 mb-4">Tree QR Code</h4>
                    <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                      <QRCodeSVG
                        id={`qr-${selectedTree.id}`}
                        value={getTreeUrl(selectedTree.id)}
                        size={200}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Scan to view this tree's complete history
                    </p>
                    <button
                      onClick={() => downloadQRCode(selectedTree.id, selectedTree.variety)}
                      className="btn-primary flex items-center space-x-2 mx-auto"
                    >
                      <Download size={20} />
                      <span>Download QR Code</span>
                    </button>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">Care History</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedTree.careHistory.length} recorded events
                    </p>
                    <a
                      href={`/tree/${selectedTree.id}`}
                      className="btn-secondary w-full text-center inline-block"
                    >
                      View Full Details
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTree.notes && (
                <div className="mt-6 border-l-4 border-tropical-lime pl-4 bg-green-50 p-4 rounded-r-xl">
                  <p className="text-sm text-gray-500 mb-1 font-semibold">
                    Notes from Farm Manager
                  </p>
                  <p className="text-gray-700 italic">{selectedTree.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
