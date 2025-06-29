import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Code2,
  BarChart3,
  Bug,
  Shield,
  Zap
} from 'lucide-react';
import { codeAnalysisService } from '../service/codeAnalysisService';
import { reportService } from '../service/reportService';

const AnalysisDetail = () => {
  const { id } = useParams();

  const { data: analysis, isLoading, error } = useQuery(
    ['analysis', id],
    () => codeAnalysisService.getAnalysisById(id),
    {
      // refetchInterval: analysis?.status === 'processing' ? 5000 : false,
      refetchInterval: false,
    }
  );

  const handleDownloadReport = async (format) => {
    try {
      await reportService.downloadReport(id, format);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
        <p className="text-gray-600 mb-4">The requested analysis could not be found.</p>
        <Link
          to="/analyses"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Analyses
        </Link>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'processing':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const statusConfig = getStatusConfig(analysis.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/analyses"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analyses
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{analysis.fileName}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(analysis.createdAt).toLocaleTimeString()}
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full ${statusConfig.bg}`}>
                  <StatusIcon className={`w-4 h-4 mr-1 ${statusConfig.color}`} />
                  <span className={`capitalize ${statusConfig.color}`}>
                    {analysis.status}
                  </span>
                </div>
              </div>
            </div>

            {analysis.status === 'completed' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownloadReport('json')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
              </div>
            )}
          </div>
        </div>

        {analysis.status === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Analysis in Progress</h3>
                <p className="text-blue-700">Your code is being analyzed. This may take a few minutes.</p>
              </div>
            </div>
          </div>
        )}

        {analysis.status === 'completed' && (
          <>
            {/* Quality Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Score</p>
                    <p className="text-3xl font-bold text-blue-600">{analysis.qualityScore}/100</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues Found</p>
                    <p className="text-3xl font-bold text-red-600">{analysis.issuesCount}</p>
                  </div>
                  <Bug className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-3xl font-bold text-green-600">{analysis.securityScore}/100</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Performance</p>
                    <p className="text-3xl font-bold text-yellow-600">{analysis.performanceScore}/100</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Issues List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                    Issues Found ({analysis.issues?.length || 0})
                  </h3>
                </div>
                <div className="p-6">
                  {analysis.issues && analysis.issues.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.issues.map((issue, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {issue.severity}
                                </span>
                                <span className="ml-2 text-sm text-gray-600">{issue.type}</span>
                              </div>
                              <h4 className="font-medium text-gray-900 mb-1">{issue.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                              {issue.line && (
                                <p className="text-xs text-gray-500">Line {issue.line}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-600">No issues found! Great job!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Metrics */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Code Metrics
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Lines of Code</span>
                      <span className="text-sm text-gray-900">{analysis.metrics?.linesOfCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Cyclomatic Complexity</span>
                      <span className="text-sm text-gray-900">{analysis.metrics?.complexity || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Maintainability Index</span>
                      <span className="text-sm text-gray-900">{analysis.metrics?.maintainability || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Test Coverage</span>
                      <span className="text-sm text-gray-900">{analysis.metrics?.testCoverage || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Technical Debt</span>
                      <span className="text-sm text-gray-900">{analysis.metrics?.technicalDebt || 'Low'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Code2 className="w-5 h-5 mr-2 text-purple-600" />
                    AI Recommendations
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
                        {rec.impact && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Impact: {rec.impact}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {analysis.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-red-900">Analysis Failed</h3>
            </div>
            <p className="text-red-700 mb-4">{analysis.errorMessage || 'An error occurred during analysis.'}</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Retry Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDetail;