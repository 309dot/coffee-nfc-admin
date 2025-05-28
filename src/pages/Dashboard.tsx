import { useState, useEffect } from 'react';
import { 
  Coffee, 
  TrendingUp, 
  Eye,
  ShoppingCart,
  Globe,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { DashboardStats } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 임시 데이터 (실제로는 API에서 가져옴)
  useEffect(() => {
    const mockStats: DashboardStats = {
      nfcStats: {
        totalScans: 1247,
        todayScans: 89,
        weeklyScans: 456,
        monthlyScans: 1247,
        mostScannedBean: 'Addisu Hulichaye, Ethiopia',
        scansByHour: [
          { hour: 0, count: 2 }, { hour: 1, count: 1 }, { hour: 2, count: 0 },
          { hour: 3, count: 0 }, { hour: 4, count: 0 }, { hour: 5, count: 1 },
          { hour: 6, count: 5 }, { hour: 7, count: 12 }, { hour: 8, count: 25 },
          { hour: 9, count: 35 }, { hour: 10, count: 28 }, { hour: 11, count: 22 },
          { hour: 12, count: 18 }, { hour: 13, count: 15 }, { hour: 14, count: 20 },
          { hour: 15, count: 25 }, { hour: 16, count: 18 }, { hour: 17, count: 12 },
          { hour: 18, count: 8 }, { hour: 19, count: 6 }, { hour: 20, count: 4 },
          { hour: 21, count: 3 }, { hour: 22, count: 2 }, { hour: 23, count: 1 }
        ]
      },
      beanStats: {
        totalBeans: 12,
        activeBeans: 10,
        beansForSale: 8,
        popularBeans: [
          { name: 'Addisu Hulichaye', scanCount: 234 },
          { name: 'Geisha Panama', scanCount: 189 },
          { name: 'Blue Mountain', scanCount: 156 },
          { name: 'Kona Hawaii', scanCount: 134 },
          { name: 'Yirgacheffe', scanCount: 98 }
        ]
      },
      salesStats: {
        totalRevenue: 2450000,
        monthlyRevenue: 890000,
        topSellingBeans: [
          { name: 'Addisu Hulichaye', sales: 45 },
          { name: 'Geisha Panama', sales: 32 },
          { name: 'Blue Mountain', sales: 28 }
        ],
        conversionRate: 12.5
      },
      geoStats: {
        topCountries: [
          { country: '대한민국', count: 1089 },
          { country: '일본', count: 89 },
          { country: '미국', count: 45 },
          { country: '중국', count: 24 }
        ],
        topCities: [
          { city: '서울', count: 567 },
          { city: '부산', count: 234 },
          { city: '대구', count: 156 },
          { city: '인천', count: 132 }
        ]
      }
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: '오늘 스캔',
      value: stats.nfcStats.todayScans.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      title: '총 원두',
      value: stats.beanStats.totalBeans.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Coffee,
      color: 'bg-coffee-600'
    },
    {
      title: '이번 달 매출',
      value: `₩${(stats.salesStats.monthlyRevenue / 10000).toFixed(0)}만`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: '전환율',
      value: `${stats.salesStats.conversionRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">M1CT 커피 NFC 코스터 관리 현황</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} p-3 rounded-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간대별 스캔 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">시간대별 스캔 현황</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.nfcStats.scansByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#a18072" 
                strokeWidth={2}
                dot={{ fill: '#a18072' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 인기 원두 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">인기 원두 TOP 5</h3>
            <Coffee className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.beanStats.popularBeans}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scanCount" fill="#a18072" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 추가 정보 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 활동 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">새로운 원두 등록: Blue Mountain</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">NFC 칩 스캔: Addisu Hulichaye</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">재고 업데이트: Geisha Panama</span>
            </div>
          </div>
        </div>

        {/* 지역별 통계 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">지역별 스캔</h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.geoStats.topCities.slice(0, 4).map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{city.city}</span>
                <span className="text-sm font-medium text-gray-900">{city.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 상태</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">NFC 서비스</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">데이터베이스</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API 서버</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-600">정상</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 