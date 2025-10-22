'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Activity,
  AlertTriangle,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  getAnalyticsSummary,
  getRevenueExpenseData,
  getYieldTrends,
  getVarietyProfitability,
  getInventoryTurnover,
  getDiseasePatterns,
  getHarvestForecast,
  type AnalyticsSummary,
  type RevenueExpenseData,
  type YieldTrendData,
  type VarietyProfitability,
  type InventoryTurnover,
  type DiseasePattern,
  type HarvestForecast,
} from '@/lib/analyticsService';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | '365'>('30');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueExpenseData[]>([]);
  const [yieldData, setYieldData] = useState<YieldTrendData[]>([]);
  const [varietyProfit, setVarietyProfit] = useState<VarietyProfitability[]>([]);
  const [inventoryTurnover, setInventoryTurnover] = useState<InventoryTurnover[]>([]);
  const [diseasePatterns, setDiseasePatterns] = useState<DiseasePattern[]>([]);
  const [harvestForecast, setHarvestForecast] = useState<HarvestForecast[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const [
        summaryData,
        revenue,
        yield_,
        profit,
        inventory,
        disease,
        forecast,
      ] = await Promise.all([
        getAnalyticsSummary(),
        getRevenueExpenseData(days),
        getYieldTrends(Math.ceil(days / 30)),
        getVarietyProfitability(),
        getInventoryTurnover(),
        getDiseasePatterns(Math.ceil(days / 30)),
        getHarvestForecast(90),
      ]);

      setSummary(summaryData);
      setRevenueData(revenue);
      setYieldData(yield_);
      setVarietyProfit(profit);
      setInventoryTurnover(inventory);
      setDiseasePatterns(disease);
      setHarvestForecast(forecast);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Data-driven insights for your durian farm</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['7', '30', '90', '365'] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === days
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {days === '365' ? '1Y' : `${days}D`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`RM ${summary.totalRevenue.toLocaleString()}`}
          change={summary.profitMargin}
          icon={<DollarSign className="text-white" size={24} />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Profit"
          value={`RM ${summary.totalProfit.toLocaleString()}`}
          change={summary.profitMargin}
          icon={<TrendingUp className="text-white" size={24} />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Healthy Trees"
          value={`${summary.healthyTrees} / ${summary.totalTrees}`}
          change={(summary.healthyTrees / summary.totalTrees) * 100}
          icon={<Activity className="text-white" size={24} />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Inventory Value"
          value={`RM ${summary.inventoryValue.toLocaleString()}`}
          icon={<Package className="text-white" size={24} />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="mr-2 text-green-600" size={24} />
              Revenue vs Expenses
            </h3>
            <p className="text-gray-600 text-sm mt-1">Track financial performance over time</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Revenue (RM)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="2"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
              name="Expenses (RM)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stackId="3"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Profit (RM)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="mr-2 text-blue-600" size={24} />
            Yield Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {Array.from(new Set(yieldData.map(d => d.variety))).map((variety, idx) => (
                <Line
                  key={variety}
                  type="monotone"
                  dataKey="yield"
                  data={yieldData.filter(d => d.variety === variety)}
                  name={variety}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Variety Profitability */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PieChartIcon className="mr-2 text-purple-600" size={24} />
            Most Profitable Varieties
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={varietyProfit.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="variety" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="profit" name="Profit (RM)" radius={[8, 8, 0, 0]}>
                {varietyProfit.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inventory Turnover Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Package className="mr-2 text-orange-600" size={24} />
          Inventory Turnover Rate
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock In</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock Out</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Turnover</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Days of Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Value (RM)</th>
              </tr>
            </thead>
            <tbody>
              {inventoryTurnover.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{item.itemName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{item.stockIn.toFixed(0)}</td>
                  <td className="py-3 px-4 text-right">{item.stockOut.toFixed(0)}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.turnoverRate.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.daysOfStock < 30 ? 'bg-red-100 text-red-700' :
                      item.daysOfStock < 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.daysOfStock} days
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disease Patterns & Harvest Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Patterns */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="mr-2 text-red-600" size={24} />
            Disease Patterns by Season
          </h3>
          <div className="space-y-3">
            {diseasePatterns.slice(0, 8).map((pattern, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{pattern.disease}</span>
                    <span className="text-xs text-gray-500">{pattern.month}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{pattern.cases} cases</span>
                    <span>•</span>
                    <span>{pattern.affectedTrees} trees</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pattern.recoveryRate > 70 ? 'bg-green-100 text-green-700' :
                  pattern.recoveryRate > 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {pattern.recoveryRate.toFixed(0)}% recovery
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Harvest Forecast */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="mr-2 text-green-600" size={24} />
            Harvest Forecast (90 Days)
          </h3>
          <div className="space-y-3">
            {harvestForecast.slice(0, 8).map((forecast, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{forecast.variety}</span>
                    <span className="text-xs text-gray-500">{forecast.date}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{forecast.estimatedYield.toFixed(0)} kg</span>
                    <span>•</span>
                    <span>{forecast.treesReady} trees</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  forecast.confidence === 'high' ? 'bg-green-100 text-green-700' :
                  forecast.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {forecast.confidence} confidence
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Most Profitable Variety</p>
            <p className="text-2xl font-bold">{summary.mostProfitableVariety}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Highest Yield Variety</p>
            <p className="text-2xl font-bold">{summary.topVariety}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Average Yield per Tree</p>
            <p className="text-2xl font-bold">{summary.avgYieldPerTree.toFixed(1)} kg</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Profit Margin</p>
            <p className="text-2xl font-bold">{summary.profitMargin.toFixed(1)}%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Pending Orders</p>
            <p className="text-2xl font-bold">{summary.pendingOrders}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Tree Health Rate</p>
            <p className="text-2xl font-bold">
              {((summary.healthyTrees / summary.totalTrees) * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
