import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  LinearProgress,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Coffee as CoffeeIcon,
  LocationOn as LocationIcon,
  Devices as DevicesIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { analyticsService } from '../services/analytics';
import type { 
  ScanAnalytics, 
  BeanPerformance, 
  LocationAnalytics, 
  RealtimeStats,
  AnalyticsFilter 
} from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AnalyticsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanAnalytics, setScanAnalytics] = useState<ScanAnalytics | null>(null);
  const [beanPerformance, setBeanPerformance] = useState<BeanPerformance[]>([]);
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [timeRange, setTimeRange] = useState('7days');

  // 차트 색상
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  useEffect(() => {
    loadAnalyticsData();
    
    // 실시간 업데이트 (30초마다)
    const interval = setInterval(() => {
      loadRealtimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // 필터 설정
      const filter: AnalyticsFilter = {
        dateRange: {
          start: new Date(Date.now() - getDaysFromRange(timeRange) * 24 * 60 * 60 * 1000),
          end: new Date(),
          period: 'day'
        }
      };

      const [analytics, performance, locations, realtime] = await Promise.all([
        analyticsService.getScanAnalytics(filter),
        analyticsService.getBeanPerformance(),
        analyticsService.getLocationAnalytics(),
        analyticsService.getRealtimeStats()
      ]);

      setScanAnalytics(analytics);
      setBeanPerformance(performance);
      setLocationAnalytics(locations);
      setRealtimeStats(realtime);
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeData = async () => {
    try {
      const realtime = analyticsService.getRealtimeStats();
      setRealtimeStats(realtime);
    } catch (error) {
      console.error('실시간 데이터 로드 실패:', error);
    }
  };

  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case '1day': return 1;
      case '7days': return 7;
      case '30days': return 30;
      case '90days': return 90;
      default: return 7;
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="info" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ 
        background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        fontWeight: 'bold',
        mb: 3
      }}>
        📊 분석 대시보드
      </Typography>

      {/* 실시간 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>총 스캔</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formatNumber(scanAnalytics?.totalScans || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    고유 스캔: {formatNumber(scanAnalytics?.uniqueScans || 0)}
                  </Typography>
                </Box>
                <VisibilityIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>활성 사용자</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {realtimeStats?.currentActiveUsers || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    지난 1시간: {realtimeStats?.scansInLastHour || 0}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>전환율</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {(scanAnalytics?.conversionRate || 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    스캔 → 구매
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>인기 원두</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {realtimeStats?.topScanningBean || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    오늘의 TOP
                  </Typography>
                </Box>
                <CoffeeIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 필터 및 컨트롤 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>기간</InputLabel>
            <Select
              value={timeRange}
              label="기간"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1day">1일</MenuItem>
              <MenuItem value="7days">7일</MenuItem>
              <MenuItem value="30days">30일</MenuItem>
              <MenuItem value="90days">90일</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAnalyticsData}
          >
            새로고침
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              // CSV 다운로드 기능 구현
              console.log('CSV 다운로드');
            }}
          >
            데이터 내보내기
          </Button>
        </Box>
      </Paper>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<AssessmentIcon />} label="개요" />
          <Tab icon={<CoffeeIcon />} label="원두 성능" />
          <Tab icon={<PublicIcon />} label="지역 분석" />
          <Tab icon={<ScheduleIcon />} label="실시간" />
        </Tabs>
      </Box>

      {/* 개요 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* 시간별 스캔 차트 */}
          <Box sx={{ flex: '2 1 500px', minWidth: '500px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  시간별 스캔 분포
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={scanAnalytics?.scansByHour || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* 디바이스 분포 */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  디바이스 분포
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Mobile', value: scanAnalytics?.deviceStats.mobile || 0 },
                        { name: 'Desktop', value: scanAnalytics?.deviceStats.desktop || 0 },
                        { name: 'Tablet', value: scanAnalytics?.deviceStats.tablet || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* 일별 스캔 트렌드 */}
          <Box sx={{ flex: '2 1 500px', minWidth: '500px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  일별 스캔 트렌드 (최근 7일)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scanAnalytics?.scansByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="스캔 수"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>

          {/* 인기 원두 TOP 5 */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  인기 원두 TOP 5
                </Typography>
                <List>
                  {scanAnalytics?.topBeans.slice(0, 5).map((bean, index) => (
                    <ListItem key={bean.beanId}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: colors[index % colors.length], width: 32, height: 32 }}>
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={bean.beanName}
                        secondary={`${bean.scanCount}회 스캔`}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={`${bean.percentage.toFixed(1)}%`} 
                          size="small" 
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  )) || (
                    <ListItem>
                      <ListItemText primary="데이터가 없습니다." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* 원두 성능 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {beanPerformance.map((bean) => (
            <Box key={bean.beanId} sx={{ flex: '1 1 350px', minWidth: '350px', maxWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      ☕
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" noWrap>{bean.beanName}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(bean.popularityTrend)}
                        <Typography variant="body2" color="text.secondary">
                          {bean.trendPercentage.toFixed(1)}% 변화
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">총 스캔</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {bean.totalScans}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">일평균 스캔</Typography>
                    <Typography variant="h6">
                      {bean.averageScansPerDay.toFixed(1)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">피크 시간</Typography>
                    <Typography variant="body1">
                      {bean.peakScanTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      전환율: {bean.conversionRate?.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={bean.conversionRate || 0} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  
                  {bean.revenue && bean.revenue > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">예상 수익</Typography>
                      <Typography variant="h6" color="success.main">
                        ₩{bean.revenue.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* 지역 분석 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {locationAnalytics.slice(0, 6).map((location, index) => (
            <Box key={`${location.country}-${location.city}`} sx={{ flex: '1 1 350px', minWidth: '350px', maxWidth: '400px' }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: colors[index % colors.length], mr: 2 }}>
                      <LocationIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{location.city}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {location.country}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">총 스캔</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {location.totalScans}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">고유 사용자</Typography>
                    <Typography variant="h6">
                      {location.uniqueUsers}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    인기 원두
                  </Typography>
                  {location.topBeans.slice(0, 3).map((bean, beanIndex) => (
                    <Box key={beanIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                        {bean.beanName}
                      </Typography>
                      <Chip label={bean.scanCount} size="small" />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* 실시간 탭 */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '2 1 500px', minWidth: '500px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  최근 스캔 활동
                </Typography>
                <List>
                  {realtimeStats?.recentScans.slice(0, 10).map((scan, index) => (
                    <ListItem key={scan.id}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          📱
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${scan.location?.city || 'Unknown'}, ${scan.location?.country || 'Unknown'}`}
                        secondary={`${scan.device?.type} • ${scan.timestamp.toLocaleTimeString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip 
                          label={scan.device?.type || 'Unknown'} 
                          size="small" 
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  )) || (
                    <ListItem>
                      <ListItemText primary="최근 스캔 데이터가 없습니다." />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  시스템 상태
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">시스템 상태</Typography>
                    <Chip 
                      label={realtimeStats?.systemHealth === 'good' ? '정상' : '경고'} 
                      color={realtimeStats?.systemHealth === 'good' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    지난 24시간 스캔
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {realtimeStats?.scansInLastDay || 0}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    지난 1시간 스캔
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {realtimeStats?.scansInLastHour || 0}
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  실시간 데이터는 30초마다 자동 업데이트됩니다.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsDashboard; 