'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { TreeInfo } from '@/types/tree';

interface HarvestCalendarProps {
  trees: TreeInfo[];
}

interface HarvestPrediction {
  treeNo: string;
  variety: string;
  predictedDate: string;
  predictedYield: number;
  status: "Ready" | "Upcoming" | "Missed";
}

export default function HarvestCalendar({ trees }: HarvestCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate harvest predictions based on tree data
  const predictions = useMemo(() => {
    const predictionMap: Record<string, HarvestPrediction[]> = {};

    trees.forEach(tree => {
      if (tree.lastHarvest) {
        // Predict next harvest (durian trees typically fruit every 3-4 months)
        const lastDate = new Date(tree.lastHarvest);
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 3);

        const dateKey = nextDate.toISOString().split('T')[0];
        const prediction: HarvestPrediction = {
          treeNo: tree.no || tree.id,
          variety: tree.variety,
          predictedDate: dateKey,
          predictedYield: parseFloat(tree.avgYield || '15'),
          status: nextDate < today ? "Missed" : nextDate.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000 ? "Ready" : "Upcoming"
        };

        if (!predictionMap[dateKey]) {
          predictionMap[dateKey] = [];
        }
        predictionMap[dateKey].push(prediction);
      }
    });

    return predictionMap;
  }, [trees]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const isCurrentMonth = today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear;

  // Create calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getDateKey = (day: number) => {
    const month = String(currentMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentYear}-${month}-${dayStr}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready": return "bg-green-500 text-white";
      case "Upcoming": return "bg-blue-500 text-white";
      case "Missed": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const allPredictions = Object.values(predictions).flat();
  const readyCount = allPredictions.filter(p => p.status === "Ready").length;
  const totalCount = allPredictions.length;
  const expectedYield = Math.round(allPredictions.reduce((sum, p) => sum + p.predictedYield, 0));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="text-green-600" size={28} />
          Harvest Calendar
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-xl font-semibold min-w-[200px] text-center">
            {monthNames[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span>Ready to Harvest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>Missed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square"></div>;
          }

          const dateKey = getDateKey(day);
          const dayPredictions = predictions[dateKey] || [];
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div
              key={day}
              className={`aspect-square border-2 rounded-lg p-2 ${
                isToday ? 'border-green-600 bg-green-50' : 'border-gray-200'
              } hover:border-green-400 transition-colors cursor-pointer relative`}
            >
              <div className="text-right font-semibold text-gray-700">{day}</div>

              {dayPredictions.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayPredictions.slice(0, 2).map((pred, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1 py-0.5 rounded truncate ${getStatusColor(pred.status)}`}
                      title={`${pred.treeNo} - ${pred.variety} (${pred.predictedYield}kg)`}
                    >
                      {pred.treeNo}
                    </div>
                  ))}
                  {dayPredictions.length > 2 && (
                    <div className="text-xs text-gray-600 font-semibold">
                      +{dayPredictions.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">This Month Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {readyCount}
            </div>
            <div className="text-sm text-gray-600">Ready Now</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {totalCount}
            </div>
            <div className="text-sm text-gray-600">Total Harvests</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {expectedYield} kg
            </div>
            <div className="text-sm text-gray-600">Expected Yield</div>
          </div>
        </div>
      </div>
    </div>
  );
}
