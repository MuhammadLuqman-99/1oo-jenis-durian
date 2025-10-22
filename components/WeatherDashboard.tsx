'use client';

import { Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';

export default function WeatherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <ThermometerSun size={24} />
          </div>
          <p className="text-3xl font-bold">--°C</p>
          <p className="text-sm mt-2 opacity-90">Temperature</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Droplets size={24} />
          </div>
          <p className="text-3xl font-bold">--%</p>
          <p className="text-sm mt-2 opacity-90">Humidity</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Wind size={24} />
          </div>
          <p className="text-3xl font-bold">-- km/h</p>
          <p className="text-sm mt-2 opacity-90">Wind Speed</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Cloud size={24} />
          </div>
          <p className="text-3xl font-bold">--%</p>
          <p className="text-sm mt-2 opacity-90">Rain Chance</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <Cloud className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Weather Forecast</h3>
          <p className="text-gray-600 mb-6">
            Get real-time weather updates and 7-day forecasts. Plan farm activities based on weather conditions.
          </p>
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <p className="text-sm text-sky-800">
              <strong>Coming Soon:</strong> Weather integration with local data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
