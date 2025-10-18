"use client";

import { useState } from "react";
import { Calendar, Droplet, Heart, Leaf, MapPin, TrendingUp, Sprout, Scissors, Bug, FlaskConical, CheckCircle } from "lucide-react";
import { treesData, farmActivities } from "@/data/trees";
import type { TreeCareEvent } from "@/types/tree";

export default function FarmTransparency() {
  const [selectedTree, setSelectedTree] = useState(treesData[0]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent":
        return "text-green-600 bg-green-50";
      case "Good":
        return "text-blue-600 bg-blue-50";
      case "Fair":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-red-600 bg-red-50";
    }
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

  const getEventIcon = (eventType: TreeCareEvent["eventType"]) => {
    switch (eventType) {
      case "fertilization":
        return <Sprout className="text-green-600" size={20} />;
      case "pruning":
        return <Scissors className="text-purple-600" size={20} />;
      case "pest_control":
        return <Bug className="text-red-600" size={20} />;
      case "watering":
        return <Droplet className="text-blue-600" size={20} />;
      case "harvest":
        return <Heart className="text-amber-600" size={20} />;
      case "inspection":
        return <CheckCircle className="text-teal-600" size={20} />;
      case "soil_test":
        return <FlaskConical className="text-indigo-600" size={20} />;
      default:
        return <Leaf className="text-gray-600" size={20} />;
    }
  };

  const getEventColor = (eventType: TreeCareEvent["eventType"]) => {
    switch (eventType) {
      case "fertilization":
        return "bg-green-50 border-green-200";
      case "pruning":
        return "bg-purple-50 border-purple-200";
      case "pest_control":
        return "bg-red-50 border-red-200";
      case "watering":
        return "bg-blue-50 border-blue-200";
      case "harvest":
        return "bg-amber-50 border-amber-200";
      case "inspection":
        return "bg-teal-50 border-teal-200";
      case "soil_test":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <section id="farm-transparency" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-tropical-lime/10 px-4 py-2 rounded-full mb-4">
            <span className="text-tropical-green font-semibold">🌱 Farm Transparency</span>
          </div>
          <h2 className="section-title mb-4">Know Your Durian Tree</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe in complete transparency. See real-time information about our durian trees,
            including age, fertilization schedules, and harvest dates.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Tree Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a Tree</h3>
            {treesData.map((tree) => (
              <button
                key={tree.id}
                onClick={() => setSelectedTree(tree)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTree.id === tree.id
                    ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg scale-105"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-900 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{tree.variety}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedTree.id === tree.id
                        ? "bg-white/20"
                        : getHealthColor(tree.health)
                    }`}
                  >
                    {tree.health}
                  </span>
                </div>
                <p className={`text-sm ${selectedTree.id === tree.id ? "text-gray-100" : "text-gray-600"}`}>
                  {tree.treeAge} years old • {tree.location}
                </p>
              </button>
            ))}
          </div>

          {/* Tree Details */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedTree.variety}
                  </h3>
                  <p className="text-gray-600">Tree ID: {selectedTree.id}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold ${getHealthColor(selectedTree.health)}`}>
                  {selectedTree.health}
                </div>
              </div>

              {/* Tree Stats Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl">
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

                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="text-green-600" size={24} />
                    <h4 className="font-bold text-gray-900">Annual Yield</h4>
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-1">
                    {selectedTree.yield}
                  </p>
                  <p className="text-sm text-gray-600">Consistent quality</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin className="text-purple-600" size={24} />
                    <h4 className="font-bold text-gray-900">Location</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {selectedTree.location}
                  </p>
                  <p className="text-sm text-gray-600">Farm coordinates</p>
                </div>

                <div className="bg-amber-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Heart className="text-amber-600" size={24} />
                    <h4 className="font-bold text-gray-900">Last Harvest</h4>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 mb-1">
                    {formatDate(selectedTree.lastHarvest)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {calculateDaysSince(selectedTree.lastHarvest)} days ago
                  </p>
                </div>
              </div>

              {/* Fertilization Info */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Droplet className="text-green-600" size={28} />
                  <h4 className="text-xl font-bold text-gray-900">
                    Fertilization Information
                  </h4>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Fertilized</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedTree.lastFertilized)}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {calculateDaysSince(selectedTree.lastFertilized)} days ago
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fertilizer Type</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedTree.fertilizerType}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Leaf size={14} className="text-green-600" />
                      <p className="text-sm text-green-600 font-medium">
                        100% Organic
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Harvest */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="text-orange-600" size={28} />
                  <h4 className="text-xl font-bold text-gray-900">
                    Next Expected Harvest
                  </h4>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatDate(selectedTree.nextExpectedHarvest)}
                </p>
                <p className="text-gray-600 mt-2">
                  Pre-order now to secure fresh durians from this harvest!
                </p>
              </div>

              {/* Notes */}
              {selectedTree.notes && (
                <div className="border-l-4 border-tropical-lime pl-4">
                  <p className="text-sm text-gray-500 mb-1">Notes from Farm Manager</p>
                  <p className="text-gray-700 italic">{selectedTree.notes}</p>
                </div>
              )}

              {/* Last Updated */}
              <p className="text-sm text-gray-500 mt-6 text-right">
                Last updated: {formatDate(selectedTree.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Tree Care Timeline */}
        <div className="card p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Complete Care History
              </h3>
              <p className="text-gray-600 mt-1">
                Every action we take to ensure {selectedTree.variety} stays healthy and productive
              </p>
            </div>
            <div className="bg-tropical-lime/10 px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold text-tropical-green">
                {selectedTree.careHistory.length} Recorded Events
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-tropical-lime to-tropical-green"></div>

            {/* Timeline events */}
            <div className="space-y-6">
              {selectedTree.careHistory.map((event, index) => (
                <div key={event.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 w-12 h-12 bg-white border-4 border-tropical-lime rounded-full flex items-center justify-center shadow-lg">
                    {getEventIcon(event.eventType)}
                  </div>

                  {/* Event card */}
                  <div className={`p-6 rounded-xl border-2 ${getEventColor(event.eventType)} hover:shadow-lg transition-shadow`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 capitalize">
                          {event.eventType.replace("_", " ")}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatDate(event.date)} ({calculateDaysSince(event.date)} days ago)
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 bg-white/60 rounded-full text-gray-700">
                        {event.performedBy}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-2">{event.description}</p>

                    {event.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 italic">{event.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planted date - Start of timeline */}
          <div className="relative pl-16 mt-6">
            <div className="absolute left-0 top-2 w-12 h-12 bg-tropical-green border-4 border-white rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={20} />
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-r from-tropical-green/10 to-tropical-lime/10 border-2 border-tropical-green/30">
              <h4 className="text-lg font-bold text-gray-900">Tree Planted</h4>
              <p className="text-sm text-gray-600 font-medium">
                {formatDate(selectedTree.plantedDate)} ({selectedTree.treeAge} years ago)
              </p>
              <p className="text-gray-700 mt-2">
                This {selectedTree.variety} tree was planted and has been carefully nurtured for over {selectedTree.treeAge} years.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Farm Activities */}
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Farm Activities
          </h3>
          <div className="space-y-4">
            {farmActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-tropical-lime/20 p-3 rounded-lg">
                  <Leaf className="text-tropical-green" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900">{activity.activity}</h4>
                    <span className="text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">By: {activity.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
