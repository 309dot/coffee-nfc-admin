import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Coffee as CoffeeIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type { DashboardStats } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // 실시간 데이터 로드
  useEffect(() => {
    loadDashboardData();
    
    // 30초마다 데이터 새로고침
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // 실제 API 호출 대신 localStorage와 임시 데이터 조합
      const savedBeans = localStorage.getItem('coffee-beans');
      const beans = savedBeans ? JSON.parse(savedBeans) : [];
      
      const mockStats: DashboardStats = {
        nfcStats: {
          totalScans: 1247 + Math.floor(Math.random() * 10),
          todayScans: 89 + Math.floor(Math.random() * 5),
          weeklyScans: 456 + Math.floor(Math.random() * 20),
          monthlyScans: 1247 + Math.floor(Math.random() * 50),
          mostScannedBean: 'Addisu Hulichaye, Ethiopia',
          scansByHour: Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: Math.floor(Math.random() * 40) + (hour >= 7 && hour <= 22 ? 10 : 0)
          }))
        },
        beanStats: {
          totalBeans: beans.length || 12,
          activeBeans: beans.filter((b: any) => b.isActive).length || 10,
          beansForSale: beans.filter((b: any) => b.saleInfo?.isForSale).length || 8,
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
          monthlyRevenue: 890000 + Math.floor(Math.random() * 100000),
          topSellingBeans: [
            { name: 'Addisu Hulichaye', sales: 45 },
            { name: 'Geisha Panama', sales: 32 },
            { name: 'Blue Mountain', sales: 28 }
          ],
          conversionRate: 12.5 + Math.random() * 2
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

      setStats(mockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) return null;

  // 차트 색상 팔레트
  const chartColors = ['#a18072', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // 통계 카드 데이터
  const statCards = [
    {
      title: '오늘 스캔',
      value: stats.nfcStats.todayScans.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: VisibilityIcon,
      color: 'primary.main',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: '총 원두',
      value: stats.beanStats.totalBeans.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: CoffeeIcon,
      color: 'secondary.main',
      bgGradient: 'linear-gradient(135deg, #a18072 0%, #8b6f47 100%)'
    },
    {
      title: '이번 달 매출',
      value: `₩${(stats.salesStats.monthlyRevenue / 10000).toFixed(0)}만`,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: MoneyIcon,
      color: 'success.main',
      bgGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
      title: '전환율',
      value: `${stats.salesStats.conversionRate.toFixed(1)}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUpIcon,
      color: 'warning.main',
      bgGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
  ];

  // 월별 매출 데이터 (임시)
  const monthlyData = [
    { month: '1월', revenue: 650, scans: 890 },
    { month: '2월', revenue: 720, scans: 950 },
    { month: '3월', revenue: 680, scans: 920 },
    { month: '4월', revenue: 890, scans: 1100 },
    { month: '5월', revenue: 950, scans: 1200 },
    { month: '6월', revenue: 890, scans: 1150 }
  ];

  // 원두별 판매 데이터
  const beanSalesData = stats.beanStats.popularBeans.map((bean, index) => ({
    name: bean.name.split(',')[0],
    value: bean.scanCount,
    color: chartColors[index % chartColors.length]
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            대시보드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            M1CT 커피 NFC 코스터 관리 현황
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Tooltip title="새로고침">
            <IconButton onClick={loadDashboardData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 실시간 알림 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          실시간 모니터링 중 • 현재 활성 사용자: {Math.floor(Math.random() * 15) + 5}명 • 
          최근 스캔: {stats.nfcStats.mostScannedBean}
        </Typography>
      </Alert>

      {/* 통계 카드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              sx={{ 
                height: '100%',
                background: card.bgGradient,
                color: 'white',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {card.title}
                    </Typography>
                    <Chip 
                      label={card.change} 
                      size="small" 
                      sx={{ 
                        mt: 1, 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Icon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* 차트 섹션 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* 시간대별 스캔 차트 */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              시간대별 스캔 현황
            </Typography>
            <ScheduleIcon color="action" />
          </Box>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats.nfcStats.scansByHour}>
              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a18072" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a18072" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}시`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip 
                labelFormatter={(value) => `${value}시`}
                formatter={(value) => [value, '스캔 수']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#a18072" 
                strokeWidth={3}
                fill="url(#scanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* 원두 인기도 파이 차트 */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              인기 원두 TOP 5
            </Typography>
            <CoffeeIcon color="action" />
          </Box>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={beanSalesData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {beanSalesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => [value, '스캔 수']} />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ mt: 2 }}>
            {beanSalesData.map((bean, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: bean.color, 
                    borderRadius: '50%', 
                    mr: 1 
                  }} 
                />
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {bean.name}
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {bean.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* 월별 트렌드 및 실시간 활동 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* 월별 매출 트렌드 */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              월별 매출 및 스캔 트렌드
            </Typography>
            <AnalyticsIcon color="action" />
          </Box>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#a18072" name="매출 (만원)" />
              <Bar yAxisId="right" dataKey="scans" fill="#0ea5e9" name="스캔 수" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* 실시간 활동 */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              실시간 활동
            </Typography>
            <PeopleIcon color="action" />
          </Box>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {[
              { user: '사용자 A', action: 'Geisha Panama 스캔', time: '방금 전', avatar: '🇰🇷' },
              { user: '사용자 B', action: 'Blue Mountain 구매', time: '2분 전', avatar: '🇯🇵' },
              { user: '사용자 C', action: 'Addisu Hulichaye 스캔', time: '5분 전', avatar: '🇺🇸' },
              { user: '사용자 D', action: 'Kona Hawaii 스캔', time: '8분 전', avatar: '🇰🇷' },
              { user: '사용자 E', action: 'Yirgacheffe 구매', time: '12분 전', avatar: '🇨🇳' },
              { user: '사용자 F', action: 'Geisha Panama 스캔', time: '15분 전', avatar: '🇰🇷' },
            ].map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', fontSize: '1.2rem' }}>
                      {activity.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight="medium">
                        {activity.action}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {activity.user} • {activity.time}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < 5 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/* 시스템 상태 */}
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            시스템 상태
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                서버 상태
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={98} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  98%
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                데이터베이스
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={95} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  95%
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                API 응답시간
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold" color="warning.main">
                  120ms
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                NFC 연결률
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={92} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  92%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;