import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { codeAnalysisService } from '../service/codeAnalysisService';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    language: 'all',
    analysisType: 'all',
    dateRange: '30days'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [showProgress, setShowProgress] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  // Handle new analysis from upload page
  useEffect(() => {
    if (location.state?.newAnalysisId && location.state?.showProgress) {
      setShowProgress(true);
      // Clear the state to prevent showing progress on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);


  // Mock data for development
  useEffect(() => {
    // Uncomment the following line to fetch real analyses from the backend
    // fetchAnalyses();

    // Example mock analyses
    const mockAnalyses = [
      {
        id: 1,
        filename: 'UserService.java',
        language: 'java',
        analysisType: 'static',
        status: 'completed',
        qualityScore: 87,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
      {
        id: 2,
        filename: 'PaymentController.js',
        language: 'javascript',
        analysisType: 'dynamic',
        status: 'failed',
        qualityScore: 45,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 3,
        filename: 'AuthMiddleware.py',
        language: 'python',
        analysisType: 'static',
        status: 'processing',
        qualityScore: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: 4,
        filename: 'Main.cpp',
        language: 'cpp',
        analysisType: 'static',
        status: 'pending',
        qualityScore: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ];
    setAnalyses(mockAnalyses);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [analyses, filters, searchQuery, sortBy]);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      const response = await codeAnalysisService.getUserAnalyses();
      
      if (response.success) {
        setAnalyses(response.data);
      } else {
        addNotification('error', 'Failed to load analyses');
      }
    } catch (error) {
      addNotification('error', 'Error loading analyses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...analyses];

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(analysis =>
        analysis.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.analysisType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(analysis => analysis.status === filters.status);
    }

    // Apply language filter
    if (filters.language !== 'all') {
      filtered = filtered.filter(analysis => analysis.language === filters.language);
    }

    // Apply analysis type filter
    if (filters.analysisType !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysisType === filters.analysisType);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== 'all') {
        filtered = filtered.filter(analysis => new Date(analysis.createdAt) >= cutoffDate);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'filename':
          return a.filename.localeCompare(b.filename);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'score':
          return (b.qualityScore || 0) - (a.qualityScore || 0);
        default:
          return 0;
      }
    });

    setFilteredAnalyses(filtered);
  };

  const handleAnalysisClick = (analysisId) => {
    navigate(`/analysis/${analysisId}`);
  };

  const handleDeleteAnalysis = async (analysisId, event) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        const response = await codeAnalysisService.deleteAnalysis(analysisId);
        if (response.success) {
          setAnalyses(prev => prev.filter(a => a.id !== analysisId));
          addNotification('success', 'Analysis deleted successfully');
        } else {
          addNotification('error', 'Failed to delete analysis');
        }
      } catch (error) {
        addNotification('error', 'Error deleting analysis: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAnalyses.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedAnalyses.length} selected analyses?`)) {
      try {
        const response = await codeAnalysisService.bulkDeleteAnalyses(selectedAnalyses);
        if (response.success) {
          setAnalyses(prev => prev.filter(a => !selectedAnalyses.includes(a.id)));
          setSelectedAnalyses([]);
          addNotification('success', `${selectedAnalyses.length} analyses deleted successfully`);
        } else {
          addNotification('error', 'Failed to delete analyses');
        }
      } catch (error) {
        addNotification('error', 'Error deleting analyses: ' + error.message);
      }
    }
  };

  const handleSelectAnalysis = (analysisId) => {
    setSelectedAnalyses(prev => 
      prev.includes(analysisId)
        ? prev.filter(id => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map(a => a.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      'processing': { color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
      'completed': { color: 'bg-green-100 text-green-800', icon: '✅' },
      'failed': { color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getQualityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueValues = (key) => {
    const values = [...new Set(analyses.map(a => a[key]).filter(Boolean))];
    return values.sort();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Code Analyses</h1>
            <p className="text-gray-600">
              View and manage your code analysis history
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Progress Banner */}
      {showProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Analysis in Progress</h3>
              <p className="text-sm text-blue-600">Your code is being analyzed. Results will appear here when complete.</p>
            </div>
            <button
              onClick={() => setShowProgress(false)}
              className="ml-auto text-blue-400 hover:text-blue-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Languages</option>
            {getUniqueValues('language').map(lang => (
              <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredAnalyses.length} of {analyses.length} analyses
            </span>
            
            {/* Bulk Actions */}
            {selectedAnalyses.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete {selectedAnalyses.length} selected</span>
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="filename">Filename A-Z</option>
            <option value="status">Status</option>
            <option value="score">Quality Score</option>
          </select>
        </div>
      </div>

      {/* Analyses List */}
      {filteredAnalyses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
          <p className="text-gray-600 mb-4">
            {analyses.length === 0 
              ? "You haven't run any code analyses yet." 
              : "No analyses match your current filters."}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Code for Analysis
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedAnalyses.length === filteredAnalyses.length && filteredAnalyses.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
              />
              <div className="grid grid-cols-12 gap-4 w-full text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">File / Code</div>
                <div className="col-span-2">Language</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Score</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleAnalysisClick(analysis.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAnalyses.includes(analysis.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectAnalysis(analysis.id);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                  />
                  <div className="grid grid-cols-12 gap-4 w-full items-center">
                    {/* File / Code */}
                    <div className="col-span-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {analysis.filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            {analysis.analysisType?.charAt(0).toUpperCase() + analysis.analysisType?.slice(1)} Analysis
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 capitalize">
                        {analysis.language}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      {getStatusBadge(analysis.status)}
                    </div>

                    {/* Score */}
                    <div className="col-span-1">
                      {analysis.qualityScore !== null ? (
                        <span className={`text-sm font-medium ${getQualityScoreColor(analysis.qualityScore)}`}>
                          {analysis.qualityScore}/100
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(analysis.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <button
                        onClick={(e) => handleDeleteAnalysis(analysis.id, e)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete analysis"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;