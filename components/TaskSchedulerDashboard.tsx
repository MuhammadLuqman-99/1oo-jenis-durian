'use client';

import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function TaskSchedulerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-90">Pending Tasks</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-90">Completed Today</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-90">Overdue</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-90">This Week</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <Clock className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Task Scheduler</h3>
          <p className="text-gray-600 mb-6">
            Plan and schedule farm activities. Set up recurring tasks for fertilization, pest control, pruning, and harvesting.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Coming Soon:</strong> Smart task scheduling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
