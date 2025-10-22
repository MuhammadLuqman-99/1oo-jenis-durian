'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Award } from 'lucide-react';
import { TreeInfo } from '@/types/tree';

interface ProfitDashboardProps {
  trees: TreeInfo[];
}

export default function ProfitDashboard({ trees }: ProfitDashboardProps) {
  const profitData = useMemo(() => {
    // Calculate costs and revenue for each tree
    const treeAnalytics = trees.map(tree => {
      const costs = parseFloat(tree.fertilizer || '0') +
                   parseFloat(tree.pestControl || '0') +
                   parseFloat(tree.labor || '0') +
                   parseFloat(tree.maintenance || '0');

      const revenue = parseFloat(tree.lastRevenue || '0');
      const profit = revenue - costs;

      return {
        ...tree,
        costs,
        revenue,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    });

    // Farm totals
    const totalCosts = treeAnalytics.reduce((sum, t) => sum + t.costs, 0);
    const totalRevenue = treeAnalytics.reduce((sum, t) => sum + t.revenue, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    // Top profitable trees
    const topTrees = [...treeAnalytics]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Variety breakdown
    const varietyMap = new Map<string, typeof treeAnalytics>();
    treeAnalytics.forEach(tree => {
      const variety = tree.variety;
      if (!varietyMap.has(variety)) {
        varietyMap.set(variety, []);
      }
      varietyMap.get(variety)!.push(tree);
    });

    const varietyProfits = Array.from(varietyMap.entries()).map(([variety, trees]) => {
      const varietyCosts = trees.reduce((sum, t) => sum + t.costs, 0);
      const varietyRevenue = trees.reduce((sum, t) => sum + t.revenue, 0);
      const varietyProfit = varietyRevenue - varietyCosts;

      return {
        variety,
        treeCount: trees.length,
        totalCosts: varietyCosts,
        totalRevenue: varietyRevenue,
        netProfit: varietyProfit,
        profitMargin: varietyRevenue > 0 ? (varietyProfit / varietyRevenue) * 100 : 0,
        avgProfitPerTree: varietyProfit / trees.length
      };
    }).sort((a, b) => b.netProfit - a.netProfit);

    // Zone breakdown
    const zoneMap = new Map<string, typeof treeAnalytics>();
    treeAnalytics.forEach(tree => {
      const zone = tree.zone || 'Unknown';
      if (!zoneMap.has(zone)) {
        zoneMap.set(zone, []);
      }
      zoneMap.get(zone)!.push(tree);
    });

    const zoneProfits = Array.from(zoneMap.entries()).map(([zone, trees]) => {
      const zoneCosts = trees.reduce((sum, t) => sum + t.costs, 0);
      const zoneRevenue = trees.reduce((sum, t) => sum + t.revenue, 0);
      const zoneProfit = zoneRevenue - zoneCosts;

      // Find top variety in zone
      const varietyInZone = new Map<string, number>();
      trees.forEach(t => {
        varietyInZone.set(t.variety, (varietyInZone.get(t.variety) || 0) + t.profit);
      });
      const topVariety = Array.from(varietyInZone.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      return {
        zone,
        treeCount: trees.length,
        totalCosts: zoneCosts,
        totalRevenue: zoneRevenue,
        netProfit: zoneProfit,
        profitMargin: zoneRevenue > 0 ? (zoneProfit / zoneRevenue) * 100 : 0,
        avgProfitPerTree: zoneProfit / trees.length,
        topVariety
      };
    }).sort((a, b) => b.netProfit - a.netProfit);

    return {
      totalCosts,
      totalRevenue,
      netProfit,
      profitMargin,
      roi,
      topTrees,
      varietyProfits,
      zoneProfits
    };
  }, [trees]);

  const isProfitable = profitData.netProfit > 0;
  const formatCurrency = (amount: number) => `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercentage = (percent: number) => `${percent.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(profitData.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Costs</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(profitData.totalCosts)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profitData.netProfit)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
              {isProfitable ? (
                <TrendingUp className="text-green-600" size={24} />
              ) : (
                <TrendingDown className="text-red-600" size={24} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
              <p className={`text-2xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(profitData.profitMargin)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <PieChart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Trees */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-yellow-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Top 5 Most Profitable Trees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tree No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Variety</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Zone</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Costs</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Profit</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profitData.topTrees.map((tree, index) => (
                <tr key={tree.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-yellow-600">#{index + 1}</span>
                      <span>{tree.no || tree.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{tree.variety}</td>
                  <td className="px-4 py-3 text-sm">{tree.zone || '-'}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                    {formatCurrency(tree.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">
                    {formatCurrency(tree.costs)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    <span className={tree.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(tree.profit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={tree.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(tree.profitMargin)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variety Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-purple-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Performance by Variety</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profitData.varietyProfits.map((variety) => (
            <div key={variety.variety} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{variety.variety}</h4>
                <span className="text-sm text-gray-500">{variety.treeCount} trees</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(variety.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Costs:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(variety.totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className={`font-semibold ${variety.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(variety.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Tree:</span>
                  <span className={`font-semibold ${variety.avgProfitPerTree > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(variety.avgProfitPerTree)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Performance by Zone</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profitData.zoneProfits.map((zone) => (
            <div key={zone.zone} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Zone {zone.zone}</h4>
                <span className="text-sm text-gray-500">{zone.treeCount} trees</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Variety:</span>
                  <span className="font-semibold">{zone.topVariety}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(zone.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className={`font-semibold ${zone.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(zone.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Tree:</span>
                  <span className={`font-semibold ${zone.avgProfitPerTree > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(zone.avgProfitPerTree)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
