'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Activity,
  Package,
  FileSpreadsheet,
  FileJson,
  History,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';
import {
  TreeInfo,
  TreeHealthRecord,
  HarvestRecord,
  CostRecord,
  RevenueRecord,
  ReportTemplate,
  GeneratedReport,
} from '@/types/tree';
import {
  getReportTemplates,
  generateReport,
  getReportHistory,
  saveReportToHistory,
} from '@/lib/exportService';

interface ReportsDashboardProps {
  trees: TreeInfo[];
  healthRecords: TreeHealthRecord[];
  harvests: HarvestRecord[];
  costs: CostRecord[];
  revenues: RevenueRecord[];
}

export default function ReportsDashboard({
  trees,
  healthRecords,
  harvests,
  costs,
  revenues,
}: ReportsDashboardProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [exportFormat, setExportFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setTemplates(getReportTemplates());
    setReportHistory(getReportHistory());
  }, []);

  const handleGenerateReport = () => {
    if (!selectedTemplate) return;

    try {
      const report = generateReport(
        selectedTemplate.type,
        exportFormat,
        trees,
        healthRecords,
        harvests,
        costs,
        revenues,
        dateRange
      );

      saveReportToHistory(report);
      setReportHistory(getReportHistory());

      // Reset to step 1
      setCurrentStep(1);
      setSelectedTemplate(null);

      showSuccess(`${selectedTemplate.name} generated and downloaded successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      showError('Failed to generate report. Please try again.');
    }
  };

  const setQuickDateRange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(new Date().setDate(new Date().getDate() - days)).toISOString().split('T')[0];
    setDateRange({ start, end });
  };

  const getTemplateIcon = (type: ReportTemplate['type']) => {
    const iconMap = {
      'Farm Overview': <Activity className="text-blue-600" size={32} />,
      'Harvest Summary': <TrendingUp className="text-green-600" size={32} />,
      'Financial': <DollarSign className="text-purple-600" size={32} />,
      'Tree Health': <Activity className="text-red-600" size={32} />,
      'Inventory': <Package className="text-orange-600" size={32} />,
      'Certification': <CheckCircle className="text-teal-600" size={32} />,
      'Insurance': <FileText className="text-indigo-600" size={32} />,
      'Custom': <FileText className="text-gray-600" size={32} />,
    };
    return iconMap[type] || <FileText className="text-gray-600" size={32} />;
  };

  const getFormatIcon = (format: 'CSV' | 'JSON' | 'PDF' | 'Excel') => {
    if (format === 'CSV' || format === 'Excel') {
      return <FileSpreadsheet className="text-green-600" size={20} />;
    }
    return <FileJson className="text-blue-600" size={20} />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate statistics
  const totalReportsGenerated = reportHistory.length;
  const reportsThisMonth = reportHistory.filter((r) => {
    const reportDate = new Date(r.generatedAt);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={32} />
          <h2 className="text-3xl font-bold">Export & Reports</h2>
        </div>
        <p className="text-lg opacity-90 mb-6">
          Generate professional reports for investors, buyers, and documentation in just 3 simple steps
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-sm opacity-80 mb-1">Available Templates</div>
            <div className="text-3xl font-bold">{templates.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-sm opacity-80 mb-1">Reports Generated</div>
            <div className="text-3xl font-bold">{totalReportsGenerated}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-sm opacity-80 mb-1">This Month</div>
            <div className="text-3xl font-bold">{reportsThisMonth}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-sm opacity-80 mb-1">Ready to Download</div>
            <div className="text-3xl font-bold">{reportHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Report Generator */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Progress Steps */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <div>
                <div className={`font-semibold ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                  Choose Report
                </div>
                <div className="text-xs text-gray-500">Select template</div>
              </div>
            </div>

            <ArrowRight className="text-gray-300" size={24} />

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <div>
                <div className={`font-semibold ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                  Date & Format
                </div>
                <div className="text-xs text-gray-500">Customize options</div>
              </div>
            </div>

            <ArrowRight className="text-gray-300" size={24} />

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <div>
                <div className={`font-semibold ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                  Generate
                </div>
                <div className="text-xs text-gray-500">Download report</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Choose Template */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Report Type</h3>
                <p className="text-gray-600">Select the type of report you want to generate</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setCurrentStep(2);
                    }}
                    className="group border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-6 text-left transition-all transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {getTemplateIcon(template.type)}
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900 mb-1">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-gray-100 group-hover:bg-blue-100 px-3 py-1 rounded-full">
                        {template.type}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                        {getFormatIcon(template.format)}
                        {template.format}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{template.sections.length} sections</span>
                      {template.includeCharts && <span>• 📊 Charts</span>}
                      {template.includePhotos && <span>• 📷 Photos</span>}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold">
                      Select This Report
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Customize Options */}
          {currentStep === 2 && selectedTemplate && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Customize Your Report</h3>
                <p className="text-gray-600">Choose date range and export format</p>
              </div>

              {/* Selected Template Preview */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  {getTemplateIcon(selectedTemplate.type)}
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">{selectedTemplate.name}</div>
                    <div className="text-sm text-gray-600">{selectedTemplate.description}</div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setSelectedTemplate(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Quick Date Presets */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  <Calendar size={16} className="inline mr-2" />
                  Choose Time Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <button
                    onClick={() => setQuickDateRange(7)}
                    className="px-4 py-3 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setQuickDateRange(30)}
                    className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => setQuickDateRange(90)}
                    className="px-4 py-3 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => setQuickDateRange(365)}
                    className="px-4 py-3 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Last Year
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  <Download size={16} className="inline mr-2" />
                  Choose Export Format
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportFormat('CSV')}
                    className={`p-6 rounded-xl border-2 font-semibold transition-all ${
                      exportFormat === 'CSV'
                        ? 'border-green-600 bg-green-50 text-green-700 shadow-lg'
                        : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <FileSpreadsheet size={32} className="mx-auto mb-2" />
                    <div className="font-bold mb-1">CSV / Excel</div>
                    <div className="text-xs opacity-75">Open in Excel, Google Sheets</div>
                    {exportFormat === 'CSV' && (
                      <div className="mt-2 text-green-600 font-bold">✓ Selected</div>
                    )}
                  </button>
                  <button
                    onClick={() => setExportFormat('JSON')}
                    className={`p-6 rounded-xl border-2 font-semibold transition-all ${
                      exportFormat === 'JSON'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <FileJson size={32} className="mx-auto mb-2" />
                    <div className="font-bold mb-1">JSON</div>
                    <div className="text-xs opacity-75">For developers, databases</div>
                    {exportFormat === 'JSON' && (
                      <div className="mt-2 text-blue-600 font-bold">✓ Selected</div>
                    )}
                  </button>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {currentStep === 3 && selectedTemplate && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Generate</h3>
                <p className="text-gray-600">Everything looks good? Click generate to download your report</p>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  {getTemplateIcon(selectedTemplate.type)}
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</div>
                    <div className="text-gray-600">{selectedTemplate.description}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Time Period</div>
                    <div className="font-bold text-gray-900">
                      {new Date(dateRange.start).toLocaleDateString('en-MY')} - {new Date(dateRange.end).toLocaleDateString('en-MY')}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-xs text-gray-600 mb-1">Export Format</div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {getFormatIcon(exportFormat)}
                      {exportFormat}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Report will include:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.sections.map((section, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>{selectedTemplate.includeCharts ? 'With Charts' : 'No Charts'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>{selectedTemplate.includePhotos ? 'With Photos' : 'No Photos'}</span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateReport}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 rounded-xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <Zap size={28} />
                Generate & Download Report Now
                <Download size={28} />
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back to Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report History - Simplified */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <History className="text-purple-600" size={28} />
            Recent Reports
          </h3>
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold">
            {reportHistory.length} Reports
          </span>
        </div>

        {reportHistory.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold mb-2">No reports yet</p>
            <p className="text-sm">Generate your first report using the wizard above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {reportHistory.slice(0, 10).map((report) => (
              <div
                key={report.id}
                className="border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {getTemplateIcon(report.type)}
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-900 mb-1">{report.title}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(report.generatedAt).toLocaleDateString('en-MY')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getFormatIcon(report.format)}
                          {report.format}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(report.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const regenerated = generateReport(
                        report.type,
                        report.format,
                        trees,
                        healthRecords,
                        harvests,
                        costs,
                        revenues,
                        report.dateRange
                      );
                      showSuccess('Report downloaded!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold group-hover:shadow-lg"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
