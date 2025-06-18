import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Download,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { codeAnalysisService } from '../services/codeAnalysisService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CodeAnalysis = () => {
  const [filters, setFilters] = useState({
    status: '',
    language: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const { data, isLoading, error, refetch } = useQuery(
    ['analyses', currentPage, pageSize, filters, sortBy, sortDir],
    () => codeAnalysisService.getAnalyses({
      page: currentPage,
      size: pageSize,
      status: filters.status,
      language: filters.language,
      sortBy,
      sortDir
    }),
    {
      keepPreviousData: true,
      staleTime: 30000 // 30 seconds
    }
  );

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        label: 'Pending'
      },
      RUNNING: {
        icon: RefreshCw,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        label: 'Running'
      },
      COMPLETED: {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-100',
        label: 'Completed'
      },
      FAILED: {
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Failed'
      },
      CANCELLED: {
        icon: AlertCircle,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleExport = async (analysisId) => {
    try {
      await codeAnalysisService.exportAnalysis(analysisId);
      toast.success('Analysis exported successfully');
    } catch (error) {
      toast.error('Failed to export analysis');
    }
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await codeAnalysisService.deleteAnalysis(analysisId);
        toast.success('Analysis deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete analysis');
      }
    }
  };

  const handleRerun = async (analysisId) => {
    try {
      await codeAnalysisService.rerunAnalysis(analysisId);
      toast.success('Analysis restarted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to restart analysis');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analyses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load analyses</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const analyses = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Code Analyses
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage your code analysis results
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search analyses..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="RUNNING">Running</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="w-48">
              <select
                value={filters.language}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-48">
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(direction);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="qualityScore-desc">Highest Score</option>
                <option value="qualityScore-asc">Lowest Score</option>
                <option value="fileName-asc">Name A-Z</option>
                <option value="fileName-desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {analyses.length} of {totalElements} analyses
          </p>
        </div>

        {/* Analyses List */}
        {analyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.language
                ? "Try adjusting your filters or search terms"
                : "Upload some code to get started with analysis"
              }
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              Upload Code
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => {
              const statusConfig = getStatusConfig(analysis.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={analysis.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {analysis.fileName || 'Unnamed Analysis'}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </div>
                        {analysis.language && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {analysis.language}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Created {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          {analysis.fileCount || 1} file{(analysis.fileCount || 1) > 1 ? 's' : ''}
                        </div>
                        {analysis.qualityScore && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Quality Score:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityScoreColor(analysis.qualityScore)}`}>
                              {analysis.qualityScore}/100
                            </span>
                          </div>
                        )}
                      </div>

                      {analysis.summary && (
                        <p className="text-gray-600 text-sm mb-4">{analysis.summary}</p>
                      )}

                      {analysis.issues && analysis.issues.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {analysis.issues.slice(0, 3).map((issue, index) => (
                            <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                              {issue.type}: {issue.count}
                            </span>
                          ))}
                          {analysis.issues.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{analysis.issues.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/analyses/${analysis.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>

                      <div className="relative group">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleExport(analysis.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4" />
                              Export Report
                            </button>
                            {(analysis.status === 'FAILED' || analysis.status === 'CANCELLED') && (
                              <button
                                onClick={() => handleRerun(analysis.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Rerun Analysis
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(analysis.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="inline-flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage < 3 ? i : currentPage - 2 + i;
                  if (page >= totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysis;