import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  FileText,
  Calendar,
  Download,
  Filter,
  Search,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { reportService } from '../services/reportService';

const Reports = () => {
  const [filters, setFilters] = useState({
    dateRange: '30',
    status: 'all',
    search: ''
  });

  const { data: reports, isLoading, refetch } = useQuery(
    ['reports', filters],
    () => reportService.getReports(filters),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleDownload = async (reportId, format) => {
    try {
      await reportService.downloadReport(reportId, format);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await reportService.generateSummaryReport(filters);
      refetch();
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1">Generate and download analysis reports</p>
            </div>
            <button
              onClick={handleGenerateReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Reports
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Reports</option>
                  <option value="generated">Generated</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={refetch}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports?.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'generated' ? 'bg-green-100 text-green-800' :
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </div>
                </div>

                {/* Report Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {report.analysesCount}
                    </div>
                    <div className="text-xs text-gray-600">Analyses</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {report.avgQualityScore}/100
                    </div>
                    <div className="text-xs text-gray-600">Avg Score</div>
                  </div>
                </div>

                {/* Download Actions */}
                {report.status === 'generated' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(report.id, 'pdf')}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownload(report.id, 'json')}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      JSON
                    </button>
                  </div>
                )}

                {report.status === 'pending' && (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">Generating...</p>
                  </div>
                )}

                {report.status === 'failed' && (
                  <button className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">
                    Retry Generation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reports?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters to see more reports.'
                : 'Generate your first report to get started.'
              }
            </p>
            {!filters.search && filters.status === 'all' && (
              <button
                onClick={handleGenerateReport}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Generate Your First Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;