'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Star, Target, BarChart3 } from 'lucide-react';
import { TreeInfo } from '@/types/tree';

interface YieldAnalyticsDashboardProps {
  trees: TreeInfo[];
}

export default function YieldAnalyticsDashboard({ trees }: YieldAnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    // Calculate variety performance
    const varietyMap = new Map<string, TreeInfo[]>();
    trees.forEach(tree => {
      if (!varietyMap.has(tree.variety)) {
        varietyMap.set(tree.variety, []);
      }
      varietyMap.get(tree.variety)!.push(tree);
    });

    const varietyPerformance = Array.from(varietyMap.entries()).map(([variety, trees]) => {
      const avgYield = trees.reduce((sum, t) => sum + parseFloat(t.avgYield || '0'), 0) / trees.length;
      const totalYield = trees.reduce((sum, t) => sum + parseFloat(t.avgYield || '0'), 0);
      const avgQuality = trees.filter(t => t.quality).length > 0
        ? trees.filter(t => t.quality === 'Premium').length / trees.filter(t => t.quality).length * 100
        : 0;

      return {
        variety,
        treeCount: trees.length,
        avgYield,
        totalYield,
        avgQuality,
        consistency: avgYield > 15 ? 'High' : avgYield > 10 ? 'Medium' : 'Low'
      };
    }).sort((a, b) => b.avgYield - a.avgYield);

    // Find top performers
    const topPerformers = trees
      .map(tree => ({
        treeNo: tree.no || tree.id,
        variety: tree.variety,
        zone: tree.zone || '-',
        avgYield: parseFloat(tree.avgYield || '0'),
        quality: tree.quality || 'Standard',
        age: tree.plantedYear ? new Date().getFullYear() - parseInt(tree.plantedYear) : 0,
        recommendForBreeding: parseFloat(tree.avgYield || '0') > 20 && tree.quality === 'Premium'
      }))
      .sort((a, b) => b.avgYield - a.avgYield)
      .slice(0, 10);

    // Calculate seasonal trends (simplified - based on lastHarvest months)
    const monthlyYield = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    trees.forEach(tree => {
      if (tree.lastHarvest) {
        const month = new Date(tree.lastHarvest).getMonth();
        monthlyYield[month] += parseFloat(tree.avgYield || '0');
        monthlyCounts[month]++;
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalTrends = monthlyYield.map((yieldValue, index) => ({
      month: monthNames[index],
      avgYield: monthlyCounts[index] > 0 ? yieldValue / monthlyCounts[index] : 0,
      harvestCount: monthlyCounts[index],
      trend: index > 0 && monthlyCounts[index] > 0 && monthlyCounts[index - 1] > 0
        ? (monthlyYield[index] / monthlyCounts[index]) > (monthlyYield[index - 1] / monthlyCounts[index - 1])
          ? 'Improving'
          : 'Declining'
        : 'Stable'
    }));

    // Totals
    const totalHarvests = trees.filter(t => t.lastHarvest).length;
    const totalYield = trees.reduce((sum, t) => sum + parseFloat(t.avgYield || '0'), 0);

    return {
      varietyPerformance,
      topPerformers,
      seasonalTrends,
      totalHarvests,
      totalYield
    };
  }, [trees]);

  const breedingCandidates = analytics.topPerformers.filter((p) => p.recommendForBreeding);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Improving":
        return <TrendingUp className="text-green-600" size={20} />;
      case "Declining":
        return <TrendingDown className="text-red-600" size={20} />;
      default:
        return <Minus className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Harvests</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalHarvests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Yield</p>
              <p className="text-3xl font-bold text-green-600">{Math.round(analytics.totalYield)} kg</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Breeding Candidates</p>
              <p className="text-3xl font-bold text-purple-600">{breedingCandidates.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="text-purple-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Variety Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Variety Performance Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Variety</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Trees</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Avg Yield/Tree</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total Yield</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Premium %</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Consistency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.varietyPerformance.map((variety) => (
                <tr key={variety.variety} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{variety.variety}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{variety.treeCount}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    {variety.avgYield.toFixed(1)} kg
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {Math.round(variety.totalYield)} kg
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                      {variety.avgQuality.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        variety.consistency === 'High'
                          ? 'bg-green-100 text-green-600'
                          : variety.consistency === 'Medium'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {variety.consistency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-yellow-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Top 10 Performing Trees</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tree No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Variety</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Zone</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Avg Yield</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Quality</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Age</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Breeding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.topPerformers.map((tree, index) => (
                <tr key={tree.treeNo} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className="font-bold text-yellow-600">#{index + 1}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{tree.treeNo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tree.variety}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{tree.zone}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                    {tree.avgYield.toFixed(1)} kg
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tree.quality === 'Premium'
                          ? 'bg-purple-100 text-purple-600'
                          : tree.quality === 'Grade A'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tree.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{tree.age} yrs</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {tree.recommendForBreeding ? (
                      <Star className="text-yellow-500 inline" size={20} fill="currentColor" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-green-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">Monthly Yield Trends</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {analytics.seasonalTrends.map((trend) => (
            <div key={trend.month} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{trend.month}</span>
                {getTrendIcon(trend.trend)}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Yield:</span>
                  <span className="font-semibold text-green-600">{trend.avgYield.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harvests:</span>
                  <span className="font-semibold text-gray-900">{trend.harvestCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breeding Recommendations */}
      {breedingCandidates.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-purple-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Recommended for Breeding Program</h3>
          </div>
          <p className="text-gray-600 mb-4">
            These trees show exceptional performance (20+ kg avg yield + Premium quality) and are recommended
            for your breeding and propagation program.
          </p>
          <div className="flex flex-wrap gap-3">
            {breedingCandidates.map((tree) => (
              <div
                key={tree.treeNo}
                className="bg-white border-2 border-purple-300 rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <Star className="text-yellow-500" size={16} fill="currentColor" />
                <span className="font-semibold text-gray-900">{tree.treeNo}</span>
                <span className="text-sm text-gray-600">({tree.variety})</span>
                <span className="text-sm font-bold text-green-600">{tree.avgYield.toFixed(1)} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
