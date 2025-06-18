import React from 'react';
import { CheckCircle, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentAnalyses = ({ analyses }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600',
          bg: 'bg-green-100',
          text: 'Completed'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          text: 'Processing'
        };
      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-red-600',
          bg: 'bg-red-100',
          text: 'Failed'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          text: 'Unknown'
        };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
        <Link
          to="/analysis"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all →
        </Link>
      </div>

      {analyses && analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const statusConfig = getStatusConfig(analysis.status);

            return (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {analysis.fileName}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(analysis.createdAt)}
                        </span>
                      </div>
                      {analysis.duration && (
                        <span className="text-xs text-gray-500">
                          Duration: {analysis.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quality Score */}
                  {analysis.score !== null && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(analysis.score)}`}>
                      {analysis.score}/10
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h4>
          <p className="text-gray-500 mb-4">Start by uploading your first code file for analysis.</p>
          <Link
            to="/analysis"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Analysis
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;