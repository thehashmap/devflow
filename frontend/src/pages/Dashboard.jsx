import React from 'react';
import { useQuery } from 'react-query';
import {
  BarChart3,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Code2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiClient } from '../service/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/Dashboard/StatCard';
import RecentAnalyses from '../components/Dashboard/RecentAnalyses';

const Dashboard = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery(
    'dashboard',
    async () => {
      // const response = await apiClient.get('/dashboard/stats');
      // return response.data;
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Mock data for development
  const mockData = {
    stats: {
      totalAnalyses: 24,
      completedAnalyses: 20,
      pendingAnalyses: 4,
      averageScore: 8.5,
      totalUsers: 12,
      reportsGenerated: 18
    },
    chartData: [
      { name: 'Mon', analyses: 4, score: 8.2 },
      { name: 'Tue', analyses: 3, score: 7.8 },
      { name: 'Wed', analyses: 5, score: 8.9 },
      { name: 'Thu', analyses: 2, score: 9.1 },
      { name: 'Fri', analyses: 6, score: 8.5 },
      { name: 'Sat', analyses: 3, score: 8.7 },
      { name: 'Sun', analyses: 1, score: 9.2 },
    ],
    recentAnalyses: [
      {
        id: 1,
        fileName: 'UserService.java',
        status: 'completed',
        score: 8.5,
        createdAt: '2024-01-15T10:30:00Z',
        duration: '2m 15s'
      },
      {
        id: 2,
        fileName: 'PaymentController.js',
        status: 'pending',
        score: null,
        createdAt: '2024-01-15T09:45:00Z',
        duration: null
      },
      {
        id: 3,
        fileName: 'AuthMiddleware.py',
        status: 'completed',
        score: 9.2,
        createdAt: '2024-01-15T09:15:00Z',
        duration: '1m 45s'
      }
    ]
  };

  // const data = dashboardData || mockData;
  const data =  mockData;
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your code quality overview.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Analyses"
          value={data.stats.totalAnalyses}
          icon={<Code2 className="w-6 h-6" />}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Completed"
          value={data.stats.completedAnalyses}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Pending"
          value={data.stats.pendingAnalyses}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
          trend="-5%"
        />
        <StatCard
          title="Avg Quality Score"
          value={`${data.stats.averageScore}/10`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          trend="+0.3"
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Analysis Trend</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Analyses</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="analyses"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Score Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quality Scores</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Score</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar
                dataKey="score"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Recent Analyses and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses */}
        <div className="lg:col-span-2">
          <RecentAnalyses analyses={data.recentAnalyses} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">New Analysis</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">View Reports</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Analytics</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          </div>

          {/* System Status */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analysis Service</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Report Service</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Code2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Analysis completed</span> for UserService.java
              </p>
              <p className="text-xs text-gray-500">Quality Score: 8.5/10 • 5 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Report generated</span> for Project Alpha
              </p>
              <p className="text-xs text-gray-500">PDF export ready • 15 minutes ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Analysis started</span> for PaymentController.js
              </p>
              <p className="text-xs text-gray-500">Processing... • 2 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;