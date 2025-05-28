import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { CoffeeBean } from '../types';
import { urlGeneratorService } from '../services/urlGenerator';
import type { URLConfig, URLResult, URLStats } from '../services/urlGenerator';

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
      id={`url-tabpanel-${index}`}
      aria-labelledby={`url-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const URLManager = () => {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [config, setConfig] = useState<URLConfig | null>(null);
  const [stats, setStats] = useState<URLStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [selectedBean, setSelectedBean] = useState<CoffeeBean | null>(null);
  const [urlResult, setUrlResult] = useState<URLResult | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // 설정 폼 상태
  const [configForm, setConfigForm] = useState({
    baseUrl: 'https://m1ct.coffee',
    customDomain: '',
    useShortUrl: true,
    enableQR: true,
    seoOptimized: true,
    urlPattern: 'detailed' as 'simple' | 'detailed' | 'custom'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 원두 데이터 로드
    const savedBeans = localStorage.getItem('coffee-beans');
    if (savedBeans) {
      setBeans(JSON.parse(savedBeans));
    }

    // URL 설정 로드
    const currentConfig = urlGeneratorService.getConfig();
    setConfig(currentConfig);
    setConfigForm({
      baseUrl: currentConfig.baseUrl,
      customDomain: currentConfig.customDomain || '',
      useShortUrl: currentConfig.useShortUrl,
      enableQR: currentConfig.enableQR,
      seoOptimized: currentConfig.seoOptimized,
      urlPattern: currentConfig.urlPattern
    });

    // 통계 로드
    const currentStats = urlGeneratorService.getURLStats();
    setStats(currentStats);
  };

  const handleGenerateUrl = async (bean: CoffeeBean) => {
    setLoading(true);
    try {
      const result = await urlGeneratorService.generateAdvancedUrl(bean);
      setUrlResult(result);
      setSelectedBean(bean);
      
      // 원두 데이터 업데이트
      const updatedBeans = beans.map(b => 
        b.id === bean.id ? { ...b, customUrl: result.slug } : b
      );
      setBeans(updatedBeans);
      localStorage.setItem('coffee-beans', JSON.stringify(updatedBeans));
      
      setSnackbar({
        open: true,
        message: `${bean.name}의 URL이 생성되었습니다!`,
        severity: 'success'
      });
      
      // 통계 업데이트
      setStats(urlGeneratorService.getURLStats());
    } catch (error) {
      setSnackbar({
        open: true,
        message: `URL 생성 실패: ${error}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    setLoading(true);
    try {
      const results = await urlGeneratorService.generateBulkUrls(beans);
      
      // 모든 원두 데이터 업데이트
      const updatedBeans = beans.map(bean => {
        const result = results.find(r => r.slug.includes(bean.name.toLowerCase()));
        return result ? { ...bean, customUrl: result.slug } : bean;
      });
      
      setBeans(updatedBeans);
      localStorage.setItem('coffee-beans', JSON.stringify(updatedBeans));
      
      setSnackbar({
        open: true,
        message: `${results.length}개의 URL이 생성되었습니다!`,
        severity: 'success'
      });
      
      setStats(urlGeneratorService.getURLStats());
    } catch (error) {
      setSnackbar({
        open: true,
        message: `대량 생성 실패: ${error}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = () => {
    urlGeneratorService.updateConfig(configForm);
    setConfig(configForm);
    setOpenConfigDialog(false);
    setSnackbar({
      open: true,
      message: 'URL 설정이 저장되었습니다!',
      severity: 'success'
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSnackbar({
      open: true,
      message: 'URL이 클립보드에 복사되었습니다!',
      severity: 'info'
    });
  };

  const handleDownloadQR = (qrCode: string, beanName: string) => {
    const link = document.createElement('a');
    link.download = `${beanName}-qr.png`;
    link.href = qrCode;
    link.click();
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getSEOScoreIcon = (score: number) => {
    if (score >= 80) return <SuccessIcon color="success" />;
    if (score >= 60) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

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
        🔗 URL 관리 시스템
      </Typography>

      {/* 통계 카드 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>총 URL</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats?.totalUrls || 0}
                  </Typography>
                </Box>
                <LinkIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>활성 URL</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats?.activeUrls || 0}
                  </Typography>
                </Box>
                <SuccessIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>총 클릭</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats?.clickCount || 0}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>평균 SEO</Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    85점
                  </Typography>
                </Box>
                <AnalyticsIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<LinkIcon />} label="URL 생성" />
          <Tab icon={<AnalyticsIcon />} label="통계 및 분석" />
          <Tab icon={<SettingsIcon />} label="설정" />
        </Tabs>
      </Box>

      {/* URL 생성 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleBulkGenerate}
            disabled={loading || beans.length === 0}
            sx={{ 
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(45deg, #5855eb, #7c3aed)' }
            }}
          >
            전체 URL 생성
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenConfigDialog(true)}
          >
            URL 설정
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            새로고침
          </Button>
        </Box>

        {/* 원두별 URL 관리 */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {beans.map((bean) => (
            <Box key={bean.id} sx={{ flex: '1 1 350px', minWidth: '350px', maxWidth: '400px' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      ☕
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" noWrap>{bean.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {bean.origin} • {bean.varieties}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {bean.customUrl && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        현재 URL:
                      </Typography>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: 'grey.100', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                          {config?.baseUrl}/bean/{bean.customUrl}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleCopyUrl(`${config?.baseUrl}/bean/${bean.customUrl}`)}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={bean.isActive ? '활성' : '비활성'} 
                      color={bean.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    {bean.saleInfo?.isForSale && (
                      <Chip label="판매중" color="primary" size="small" />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} /> : <LinkIcon />}
                    onClick={() => handleGenerateUrl(bean)}
                    disabled={loading}
                  >
                    URL 생성
                  </Button>
                  
                  {bean.customUrl && (
                    <>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => window.open(`${config?.baseUrl}/bean/${bean.customUrl}`, '_blank')}
                      >
                        미리보기
                      </Button>
                      
                      <Button
                        size="small"
                        startIcon={<QrCodeIcon />}
                        onClick={async () => {
                          const result = await urlGeneratorService.generateAdvancedUrl(bean);
                          setUrlResult(result);
                          setSelectedBean(bean);
                          setOpenQRDialog(true);
                        }}
                      >
                        QR
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      {/* 통계 및 분석 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  인기 URL 순위
                </Typography>
                <List>
                  {stats?.topPerforming.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip label={index + 1} color="primary" size="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.bean}
                        secondary={`/${item.slug}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip label={`${item.clicks} 클릭`} size="small" />
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
          
          <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  SEO 점수 분포
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {beans.slice(0, 5).map((bean) => {
                    const score = Math.floor(Math.random() * 40) + 60; // 임시 점수
                    return (
                      <Box key={bean.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{bean.name}</Typography>
                          <Typography variant="body2">{score}점</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={score} 
                          color={getSEOScoreColor(score)}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* 설정 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              URL 생성 설정
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 3, mt: 2 }}>
              <TextField
                fullWidth
                label="기본 도메인"
                value={configForm.baseUrl}
                onChange={(e) => setConfigForm({ ...configForm, baseUrl: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="커스텀 도메인 (선택사항)"
                value={configForm.customDomain}
                onChange={(e) => setConfigForm({ ...configForm, customDomain: e.target.value })}
                placeholder="예: coffee.example.com"
              />
              
              <FormControl fullWidth>
                <InputLabel>URL 패턴</InputLabel>
                <Select
                  value={configForm.urlPattern}
                  label="URL 패턴"
                  onChange={(e) => setConfigForm({ ...configForm, urlPattern: e.target.value as any })}
                >
                  <MenuItem value="simple">간단 (원두명만)</MenuItem>
                  <MenuItem value="detailed">상세 (원두명-원산지-프로세싱)</MenuItem>
                  <MenuItem value="custom">커스텀 (원산지-지역-품종-원두명)</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configForm.useShortUrl}
                      onChange={(e) => setConfigForm({ ...configForm, useShortUrl: e.target.checked })}
                    />
                  }
                  label="단축 URL 생성"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={configForm.enableQR}
                      onChange={(e) => setConfigForm({ ...configForm, enableQR: e.target.checked })}
                    />
                  }
                  label="QR 코드 자동 생성"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={configForm.seoOptimized}
                      onChange={(e) => setConfigForm({ ...configForm, seoOptimized: e.target.checked })}
                    />
                  }
                  label="SEO 최적화"
                />
              </Box>
            </Box>
          </CardContent>
          
          <CardActions>
            <Button
              variant="contained"
              onClick={handleSaveConfig}
              startIcon={<SettingsIcon />}
            >
              설정 저장
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      {/* QR 코드 다이얼로그 */}
      <Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          QR 코드 - {selectedBean?.name}
        </DialogTitle>
        <DialogContent>
          {urlResult?.qrCode && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img 
                src={urlResult.qrCode} 
                alt="QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {urlResult.fullUrl}
              </Typography>
              
              {urlResult.preview && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    미리보기
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    {urlResult.preview.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {urlResult.preview.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 1 }}>
                    {getSEOScoreIcon(urlResult.seoScore)}
                    <Typography variant="body2">
                      SEO 점수: {urlResult.seoScore}/100
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenQRDialog(false)}>닫기</Button>
          {urlResult?.qrCode && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownloadQR(urlResult.qrCode!, selectedBean?.name || 'qr-code')}
            >
              QR 다운로드
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 스낵바 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default URLManager; 