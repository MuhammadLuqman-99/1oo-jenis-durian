import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { TreeInfo, TreeHealthRecord, CustomerOrder, Product } from '@/types/tree';

// ============================================
// ANALYTICS TYPES
// ============================================

export interface RevenueExpenseData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface YieldTrendData {
  date: string;
  variety: string;
  yield: number;
  trees: number;
  avgYieldPerTree: number;
}

export interface VarietyProfitability {
  variety: string;
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  yieldAmount: number;
  treesCount: number;
}

export interface InventoryTurnover {
  itemName: string;
  category: string;
  stockIn: number;
  stockOut: number;
  turnoverRate: number;
  daysOfStock: number;
  value: number;
}

export interface DiseasePattern {
  month: string;
  disease: string;
  cases: number;
  affectedTrees: number;
  recoveryRate: number;
}

export interface HarvestForecast {
  date: string;
  variety: string;
  estimatedYield: number;
  confidence: 'low' | 'medium' | 'high';
  treesReady: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  profitMargin: number;
  totalTrees: number;
  healthyTrees: number;
  sickTrees: number;
  totalYield: number;
  avgYieldPerTree: number;
  topVariety: string;
  mostProfitableVariety: string;
  inventoryValue: number;
  pendingOrders: number;
  completedOrders: number;
}

// ============================================
// DATE UTILITIES
// ============================================

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ============================================
// REVENUE & EXPENSES ANALYTICS
// ============================================

export async function getRevenueExpenseData(days: number = 30): Promise<RevenueExpenseData[]> {
  const { start, end } = getDateRange(days);

  try {
    // Get orders (revenue)
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(
      ordersRef,
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      where('status', 'in', ['completed', 'delivered'])
    );
    const ordersSnapshot = await getDocs(ordersQuery);

    // Get expenses (from activity log or separate expenses collection)
    const expensesRef = collection(db, 'expenses');
    const expensesQuery = query(
      expensesRef,
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );
    const expensesSnapshot = await getDocs(expensesQuery);

    // Aggregate by date
    const dataByDate = new Map<string, { revenue: number; expenses: number }>();

    ordersSnapshot.forEach((doc) => {
      const order = doc.data() as CustomerOrder;
      const dateStr = order.createdAt; // createdAt is already a string
      const current = dataByDate.get(dateStr) || { revenue: 0, expenses: 0 };
      current.revenue += order.total; // Use 'total' instead of 'totalAmount'
      dataByDate.set(dateStr, current);
    });

    expensesSnapshot.forEach((doc) => {
      const expense = doc.data();
      const dateStr = formatDate(expense.date.toDate());
      const current = dataByDate.get(dateStr) || { revenue: 0, expenses: 0 };
      current.expenses += expense.amount;
      dataByDate.set(dateStr, current);
    });

    // Convert to array and sort
    const result: RevenueExpenseData[] = Array.from(dataByDate.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  } catch (error) {
    console.error('Error fetching revenue/expense data:', error);
    return [];
  }
}

// ============================================
// YIELD TRENDS ANALYTICS
// ============================================

export async function getYieldTrends(months: number = 12): Promise<YieldTrendData[]> {
  const { start } = getDateRange(months * 30);

  try {
    const treesRef = collection(db, 'trees');
    const treesSnapshot = await getDocs(treesRef);

    const activitiesRef = collection(db, 'activities');
    const harvestQuery = query(
      activitiesRef,
      where('type', '==', 'harvesting'),
      where('date', '>=', Timestamp.fromDate(start)),
      orderBy('date', 'asc')
    );
    const harvestSnapshot = await getDocs(harvestQuery);

    // Group by month and variety
    const yieldByMonthVariety = new Map<string, Map<string, { yield: number; trees: Set<string> }>>();

    harvestSnapshot.forEach((doc) => {
      const activity = doc.data();
      const date = activity.date.toDate();
      const monthKey = getMonthName(date);

      // Get tree info
      const tree = treesSnapshot.docs.find(t => t.id === activity.treeId);
      if (!tree) return;

      const treeData = tree.data() as TreeInfo;
      const variety = treeData.variety;
      const yieldAmount = activity.yieldAmount || 0;

      if (!yieldByMonthVariety.has(monthKey)) {
        yieldByMonthVariety.set(monthKey, new Map());
      }

      const monthData = yieldByMonthVariety.get(monthKey)!;
      if (!monthData.has(variety)) {
        monthData.set(variety, { yield: 0, trees: new Set() });
      }

      const varietyData = monthData.get(variety)!;
      varietyData.yield += yieldAmount;
      varietyData.trees.add(activity.treeId);
    });

    // Convert to array
    const result: YieldTrendData[] = [];
    yieldByMonthVariety.forEach((varietyMap, date) => {
      varietyMap.forEach((data, variety) => {
        result.push({
          date,
          variety,
          yield: data.yield,
          trees: data.trees.size,
          avgYieldPerTree: data.yield / data.trees.size,
        });
      });
    });

    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching yield trends:', error);
    return [];
  }
}

// ============================================
// VARIETY PROFITABILITY ANALYTICS
// ============================================

export async function getVarietyProfitability(): Promise<VarietyProfitability[]> {
  try {
    const treesRef = collection(db, 'trees');
    const treesSnapshot = await getDocs(treesRef);

    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);

    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('status', 'in', ['completed', 'delivered']));
    const ordersSnapshot = await getDocs(ordersQuery);

    // Group trees by variety
    const varietyData = new Map<string, {
      trees: number;
      yield: number;
      revenue: number;
      costs: number;
    }>();

    treesSnapshot.forEach((doc) => {
      const tree = doc.data() as TreeInfo;
      const variety = tree.variety;

      if (!varietyData.has(variety)) {
        varietyData.set(variety, { trees: 0, yield: 0, revenue: 0, costs: 0 });
      }

      const data = varietyData.get(variety)!;
      data.trees++;
      data.yield += parseFloat(tree.yield) || 0; // Parse yield string to number
    });

    // Calculate revenue from orders
    ordersSnapshot.forEach((doc) => {
      const order = doc.data() as CustomerOrder;
      order.items.forEach((item) => {
        const product = productsSnapshot.docs.find(p => p.id === item.productId);
        if (product) {
          const productData = product.data() as Product;
          const variety = productData.variety || 'Unknown';

          if (varietyData.has(variety)) {
            const data = varietyData.get(variety)!;
            data.revenue += item.price * item.quantity;
          }
        }
      });
    });

    // Estimate costs (simplified - you can make this more sophisticated)
    varietyData.forEach((data, variety) => {
      // Assume cost is 40% of revenue + fixed cost per tree
      data.costs = (data.revenue * 0.4) + (data.trees * 500);
    });

    // Convert to array
    const result: VarietyProfitability[] = Array.from(varietyData.entries())
      .map(([variety, data]) => ({
        variety,
        totalRevenue: data.revenue,
        totalCosts: data.costs,
        profit: data.revenue - data.costs,
        profitMargin: data.revenue > 0 ? ((data.revenue - data.costs) / data.revenue) * 100 : 0,
        yieldAmount: data.yield,
        treesCount: data.trees,
      }))
      .sort((a, b) => b.profit - a.profit);

    return result;
  } catch (error) {
    console.error('Error fetching variety profitability:', error);
    return [];
  }
}

// ============================================
// INVENTORY TURNOVER ANALYTICS
// ============================================

export async function getInventoryTurnover(): Promise<InventoryTurnover[]> {
  try {
    const inventoryRef = collection(db, 'inventory');
    const inventorySnapshot = await getDocs(inventoryRef);

    const movementsRef = collection(db, 'stock-movements');
    const { start } = getDateRange(90); // Last 90 days
    const movementsQuery = query(
      movementsRef,
      where('date', '>=', Timestamp.fromDate(start))
    );
    const movementsSnapshot = await getDocs(movementsQuery);

    // Calculate turnover for each item
    const turnoverData = new Map<string, {
      name: string;
      category: string;
      stockIn: number;
      stockOut: number;
      avgStock: number;
      unitCost: number;
    }>();

    inventorySnapshot.forEach((doc) => {
      const item = doc.data();
      turnoverData.set(doc.id, {
        name: item.name,
        category: item.category,
        stockIn: 0,
        stockOut: 0,
        avgStock: item.currentStock,
        unitCost: item.unitCost || 0,
      });
    });

    movementsSnapshot.forEach((doc) => {
      const movement = doc.data();
      const data = turnoverData.get(movement.itemId);
      if (data) {
        if (movement.type === 'in') {
          data.stockIn += movement.quantity;
        } else if (movement.type === 'out') {
          data.stockOut += movement.quantity;
        }
      }
    });

    // Calculate turnover metrics
    const result: InventoryTurnover[] = Array.from(turnoverData.entries())
      .map(([id, data]) => {
        const turnoverRate = data.avgStock > 0 ? data.stockOut / data.avgStock : 0;
        const daysOfStock = turnoverRate > 0 ? 90 / turnoverRate : 999;

        return {
          itemName: data.name,
          category: data.category,
          stockIn: data.stockIn,
          stockOut: data.stockOut,
          turnoverRate,
          daysOfStock: Math.round(daysOfStock),
          value: data.avgStock * data.unitCost,
        };
      })
      .sort((a, b) => b.turnoverRate - a.turnoverRate);

    return result;
  } catch (error) {
    console.error('Error fetching inventory turnover:', error);
    return [];
  }
}

// ============================================
// DISEASE PATTERNS ANALYTICS
// ============================================

export async function getDiseasePatterns(months: number = 12): Promise<DiseasePattern[]> {
  const { start } = getDateRange(months * 30);

  try {
    const healthRecordsRef = collection(db, 'health-records');
    const recordsQuery = query(
      healthRecordsRef,
      where('date', '>=', Timestamp.fromDate(start)),
      where('healthStatus', 'in', ['sick', 'recovering']),
      orderBy('date', 'asc')
    );
    const recordsSnapshot = await getDocs(recordsQuery);

    // Group by month and disease
    const diseaseByMonth = new Map<string, Map<string, {
      cases: number;
      trees: Set<string>;
      recovered: number;
    }>>();

    recordsSnapshot.forEach((doc) => {
      const record = doc.data() as TreeHealthRecord;
      const monthKey = record.inspectionDate; // Use inspectionDate string directly

      // Track disease types from TreeHealthRecord
      const disease = record.diseaseType || 'Unknown';

      if (!diseaseByMonth.has(monthKey)) {
        diseaseByMonth.set(monthKey, new Map());
      }

      const monthData = diseaseByMonth.get(monthKey)!;
      if (!monthData.has(disease)) {
        monthData.set(disease, { cases: 0, trees: new Set(), recovered: 0 });
      }

      const diseaseData = monthData.get(disease)!;
      diseaseData.cases++;
      diseaseData.trees.add(record.treeId);

      if (record.healthStatus === 'Sihat') { // 'Sihat' means recovered/healthy in Malay
        diseaseData.recovered++;
      }
    });

    // Convert to array
    const result: DiseasePattern[] = [];
    diseaseByMonth.forEach((diseaseMap, month) => {
      diseaseMap.forEach((data, disease) => {
        result.push({
          month,
          disease,
          cases: data.cases,
          affectedTrees: data.trees.size,
          recoveryRate: data.cases > 0 ? (data.recovered / data.cases) * 100 : 0,
        });
      });
    });

    return result.sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error fetching disease patterns:', error);
    return [];
  }
}

// ============================================
// HARVEST FORECASTING
// ============================================

export async function getHarvestForecast(days: number = 90): Promise<HarvestForecast[]> {
  try {
    const treesRef = collection(db, 'trees');
    const treesSnapshot = await getDocs(treesRef);

    const healthRecordsRef = collection(db, 'health-records');
    const recentRecordsQuery = query(
      healthRecordsRef,
      orderBy('date', 'desc'),
      limit(100)
    );
    const recentRecordsSnapshot = await getDocs(recentRecordsQuery);

    // Build forecast based on tree maturity and health
    const forecasts = new Map<string, {
      variety: string;
      date: Date;
      estimatedYield: number;
      confidence: 'low' | 'medium' | 'high';
      treesReady: number;
    }>();

    treesSnapshot.forEach((doc) => {
      const tree = doc.data() as TreeInfo;

      // Only forecast for healthy trees (TreeInfo uses 'health' property)
      if (tree.health !== 'Excellent' && tree.health !== 'Good') return;

      // Estimate next harvest based on last harvest (lastHarvest is a string)
      const daysSinceHarvest = tree.lastHarvest
        ? (Date.now() - new Date(tree.lastHarvest).getTime()) / (1000 * 60 * 60 * 24)
        : 365;

      // Most durian trees fruit 2-3 times per year
      const daysUntilNextHarvest = Math.max(0, 120 - daysSinceHarvest);

      if (daysUntilNextHarvest <= days) {
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + daysUntilNextHarvest);
        const monthKey = getMonthName(harvestDate);

        const key = `${monthKey}-${tree.variety}`;
        if (!forecasts.has(key)) {
          forecasts.set(key, {
            variety: tree.variety,
            date: harvestDate,
            estimatedYield: 0,
            confidence: 'medium',
            treesReady: 0,
          });
        }

        const forecast = forecasts.get(key)!;
        forecast.estimatedYield += parseFloat(tree.yield) || 50; // Parse yield string
        forecast.treesReady++;

        // Adjust confidence based on tree health history
        const treeHealth = recentRecordsSnapshot.docs
          .filter(r => r.data().treeId === doc.id)
          .map(r => r.data().healthStatus);

        if (treeHealth.every(h => h === 'healthy')) {
          forecast.confidence = 'high';
        } else if (treeHealth.some(h => h === 'sick')) {
          forecast.confidence = 'low';
        }
      }
    });

    // Convert to array
    const result: HarvestForecast[] = Array.from(forecasts.values())
      .map(f => ({
        date: formatDate(f.date),
        variety: f.variety,
        estimatedYield: f.estimatedYield,
        confidence: f.confidence,
        treesReady: f.treesReady,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  } catch (error) {
    console.error('Error generating harvest forecast:', error);
    return [];
  }
}

// ============================================
// ANALYTICS SUMMARY
// ============================================

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const [
      revenueExpense,
      varietyProfit,
      inventoryTurnover,
    ] = await Promise.all([
      getRevenueExpenseData(30),
      getVarietyProfitability(),
      getInventoryTurnover(),
    ]);

    const treesRef = collection(db, 'trees');
    const treesSnapshot = await getDocs(treesRef);

    const ordersRef = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersRef);

    // Calculate totals
    const totalRevenue = revenueExpense.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = revenueExpense.reduce((sum, d) => sum + d.expenses, 0);
    const totalProfit = totalRevenue - totalExpenses;

    let healthyTrees = 0;
    let sickTrees = 0;
    let totalYield = 0;

    treesSnapshot.forEach((doc) => {
      const tree = doc.data() as TreeInfo;
      if (tree.health === 'Excellent' || tree.health === 'Good') healthyTrees++;
      if (tree.health === 'Needs Attention') sickTrees++;
      totalYield += parseFloat(tree.yield) || 0;
    });

    const topVariety = varietyProfit.length > 0
      ? varietyProfit.reduce((max, v) => v.yieldAmount > max.yieldAmount ? v : max).variety
      : 'N/A';

    const mostProfitableVariety = varietyProfit.length > 0
      ? varietyProfit[0].variety
      : 'N/A';

    const inventoryValue = inventoryTurnover.reduce((sum, i) => sum + i.value, 0);

    const pendingOrders = ordersSnapshot.docs.filter(
      d => ['pending', 'processing'].includes(d.data().status)
    ).length;

    const completedOrders = ordersSnapshot.docs.filter(
      d => ['completed', 'delivered'].includes(d.data().status)
    ).length;

    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      totalTrees: treesSnapshot.size,
      healthyTrees,
      sickTrees,
      totalYield,
      avgYieldPerTree: treesSnapshot.size > 0 ? totalYield / treesSnapshot.size : 0,
      topVariety,
      mostProfitableVariety,
      inventoryValue,
      pendingOrders,
      completedOrders,
    };
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      profitMargin: 0,
      totalTrees: 0,
      healthyTrees: 0,
      sickTrees: 0,
      totalYield: 0,
      avgYieldPerTree: 0,
      topVariety: 'N/A',
      mostProfitableVariety: 'N/A',
      inventoryValue: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  }
}
