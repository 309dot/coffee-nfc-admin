import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  InputAdornment,
  Autocomplete,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Coffee as CoffeeIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudSync as CloudSyncIcon,
  TableChart as TableChartIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import type { CoffeeBean } from '../types';
import GoogleSheetsSync from '../components/GoogleSheetsSync';
import URLManager from '../components/URLManager';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const BeansManagement = () => {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterProcess, setFilterProcess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBean, setEditingBean] = useState<CoffeeBean | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [tabValue, setTabValue] = useState(0);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    varieties: '',
    process: '',
    region: '',
    altitude: '',
    flavorNotes: [] as string[],
    description: '',
    story: '',
    customUrl: '',
    isActive: true,
    saleInfo: {
      price: 0,
      isForSale: false,
      stock: 0
    }
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadBeans();
  }, []);

  const loadBeans = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 대신 localStorage에서 데이터 로드
      const savedBeans = localStorage.getItem('coffee-beans');
      if (savedBeans) {
        setBeans(JSON.parse(savedBeans));
      } else {
        // 초기 샘플 데이터
        const sampleBeans: CoffeeBean[] = [
          {
            id: '1',
            name: 'Addisu Hulichaye, Ethiopia',
            origin: 'Ethiopia',
            varieties: 'Heirloom',
            process: 'Natural',
            region: 'Yirgacheffe',
            altitude: '2000m',
            flavorNotes: ['Blueberry', 'Wine', 'Chocolate'],
            description: '에티오피아 예가체프 지역의 프리미엄 원두',
            story: '고도 2000m에서 자란 헤어룸 품종의 내추럴 프로세싱',
            nfcChipId: 'NFC001',
            customUrl: 'addisu-hulichaye-ethiopia',
            isActive: true,
            saleInfo: {
              price: 45000,
              isForSale: true,
              stock: 50
            },
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20')
          },
          {
            id: '2',
            name: 'Geisha Panama',
            origin: 'Panama',
            varieties: 'Geisha',
            process: 'Washed',
            region: 'Boquete',
            altitude: '1600m',
            flavorNotes: ['Jasmine', 'Bergamot', 'Tropical Fruit'],
            description: '파나마 게이샤 품종의 최고급 원두',
            story: '세계에서 가장 비싼 커피 중 하나',
            nfcChipId: 'NFC002',
            customUrl: 'geisha-panama',
            isActive: true,
            saleInfo: {
              price: 120000,
              isForSale: true,
              stock: 20
            },
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-18')
          }
        ];
        setBeans(sampleBeans);
        localStorage.setItem('coffee-beans', JSON.stringify(sampleBeans));
      }
    } catch (error) {
      console.error('원두 데이터 로드 실패:', error);
      setSnackbar({ open: true, message: '데이터 로드에 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 원두 목록
  const filteredBeans = beans.filter(bean => {
    const matchesSearch = bean.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bean.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bean.varieties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = !filterOrigin || bean.origin === filterOrigin;
    const matchesProcess = !filterProcess || bean.process === filterProcess;
    
    return matchesSearch && matchesOrigin && matchesProcess;
  });

  // 페이지네이션
  const paginatedBeans = filteredBeans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 원두 추가/수정
  const handleSaveBean = () => {
    try {
      const newBean: CoffeeBean = {
        id: editingBean?.id || Date.now().toString(),
        ...formData,
        nfcChipId: editingBean?.nfcChipId || `NFC${Date.now()}`,
        createdAt: editingBean?.createdAt || new Date(),
        updatedAt: new Date()
      };

      let updatedBeans;
      if (editingBean) {
        updatedBeans = beans.map(bean => bean.id === editingBean.id ? newBean : bean);
        setSnackbar({ open: true, message: '원두 정보가 수정되었습니다.', severity: 'success' });
      } else {
        updatedBeans = [...beans, newBean];
        setSnackbar({ open: true, message: '새 원두가 추가되었습니다.', severity: 'success' });
      }

      setBeans(updatedBeans);
      localStorage.setItem('coffee-beans', JSON.stringify(updatedBeans));
      handleCloseDialog();
    } catch (error) {
      console.error('원두 저장 실패:', error);
      setSnackbar({ open: true, message: '저장에 실패했습니다.', severity: 'error' });
    }
  };

  // 원두 삭제
  const handleDeleteBean = (id: string) => {
    if (window.confirm('정말로 이 원두를 삭제하시겠습니까?')) {
      const updatedBeans = beans.filter(bean => bean.id !== id);
      setBeans(updatedBeans);
      localStorage.setItem('coffee-beans', JSON.stringify(updatedBeans));
      setSnackbar({ open: true, message: '원두가 삭제되었습니다.', severity: 'success' });
    }
  };

  // 활성화/비활성화 토글
  const handleToggleActive = (id: string) => {
    const updatedBeans = beans.map(bean => 
      bean.id === id ? { ...bean, isActive: !bean.isActive, updatedAt: new Date() } : bean
    );
    setBeans(updatedBeans);
    localStorage.setItem('coffee-beans', JSON.stringify(updatedBeans));
    setSnackbar({ open: true, message: '상태가 변경되었습니다.', severity: 'success' });
  };

  // 다이얼로그 열기
  const handleOpenDialog = (bean?: CoffeeBean) => {
    if (bean) {
      setEditingBean(bean);
      setFormData({
        name: bean.name,
        origin: bean.origin,
        varieties: bean.varieties,
        process: bean.process,
        region: bean.region,
        altitude: bean.altitude,
        flavorNotes: bean.flavorNotes,
        description: bean.description,
        story: bean.story,
        customUrl: bean.customUrl,
        isActive: bean.isActive,
        saleInfo: bean.saleInfo || { price: 0, isForSale: false, stock: 0 }
      });
    } else {
      setEditingBean(null);
      setFormData({
        name: '',
        origin: '',
        varieties: '',
        process: '',
        region: '',
        altitude: '',
        flavorNotes: [],
        description: '',
        story: '',
        customUrl: '',
        isActive: true,
        saleInfo: { price: 0, isForSale: false, stock: 0 }
      });
    }
    setOpenDialog(true);
  };

  // 다이얼로그 닫기
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBean(null);
  };

  // 고유 원산지 및 프로세스 목록
  const uniqueOrigins = [...new Set(beans.map(bean => bean.origin))];
  const uniqueProcesses = [...new Set(beans.map(bean => bean.process))];

  // 통계 계산
  const stats = {
    total: beans.length,
    active: beans.filter(bean => bean.isActive).length,
    forSale: beans.filter(bean => bean.saleInfo?.isForSale).length,
    totalStock: beans.reduce((sum, bean) => sum + (bean.saleInfo?.stock || 0), 0)
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        ☕ 원두 관리
      </Typography>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="원두 관리 탭">
          <Tab 
            icon={<TableChartIcon />} 
            label="원두 목록" 
            {...a11yProps(0)} 
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<CloudSyncIcon />} 
            label="구글 시트 연동" 
            {...a11yProps(1)} 
            sx={{ minHeight: 64 }}
          />
          <Tab 
            icon={<QrCodeIcon />} 
            label="URL 관리" 
            {...a11yProps(2)} 
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Box>

      {/* 원두 목록 탭 */}
      <TabPanel value={tabValue} index={0}>
        {/* 기존 원두 관리 UI */}
        {/* 통계 카드 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white' }}>전체 원두</Typography>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {beans.length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white' }}>활성 원두</Typography>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {beans.filter(bean => bean.isActive).length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1, minWidth: 200, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white' }}>판매 중</Typography>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {beans.filter(bean => bean.saleInfo?.isForSale).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 검색 및 필터 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="원두명, 원산지, 품종으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>원산지</InputLabel>
              <Select
                value={filterOrigin}
                label="원산지"
                onChange={(e) => setFilterOrigin(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {Array.from(new Set(beans.map(bean => bean.origin))).map(origin => (
                  <MenuItem key={origin} value={origin}>{origin}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>프로세싱</InputLabel>
              <Select
                value={filterProcess}
                label="프로세싱"
                onChange={(e) => setFilterProcess(e.target.value)}
              >
                <MenuItem value="">전체</MenuItem>
                {Array.from(new Set(beans.map(bean => bean.process))).map(process => (
                  <MenuItem key={process} value={process}>{process}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                '&:hover': { background: 'linear-gradient(45deg, #5855eb, #7c3aed)' }
              }}
            >
              원두 추가
            </Button>
          </Box>
        </Paper>

        {/* 원두 테이블 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>원두명</TableCell>
                <TableCell>원산지</TableCell>
                <TableCell>품종</TableCell>
                <TableCell>프로세싱</TableCell>
                <TableCell>플레이버 노트</TableCell>
                <TableCell>가격</TableCell>
                <TableCell>재고</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography>로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedBeans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography>원두가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBeans.map((bean) => (
                  <TableRow key={bean.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CoffeeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2">{bean.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bean.region}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{bean.origin}</TableCell>
                    <TableCell>{bean.varieties}</TableCell>
                    <TableCell>{bean.process}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {bean.flavorNotes.slice(0, 2).map((note, index) => (
                          <Chip key={index} label={note} size="small" variant="outlined" />
                        ))}
                        {bean.flavorNotes.length > 2 && (
                          <Chip label={`+${bean.flavorNotes.length - 2}`} size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {bean.saleInfo?.isForSale ? (
                        <Typography variant="body2">
                          ₩{bean.saleInfo.price.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          판매 안함
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {bean.saleInfo?.stock || 0}개
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={bean.isActive}
                            onChange={() => handleToggleActive(bean.id)}
                            size="small"
                          />
                        }
                        label={bean.isActive ? '활성' : '비활성'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="보기">
                          <IconButton size="small" onClick={() => window.open(`/coffee/${bean.customUrl}`, '_blank')}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="수정">
                          <IconButton size="small" onClick={() => handleOpenDialog(bean)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton size="small" onClick={() => handleDeleteBean(bean.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="URL 복사">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/coffee/${bean.customUrl}`);
                              setSnackbar({ open: true, message: 'URL이 복사되었습니다.', severity: 'success' });
                            }}
                          >
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBeans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TabPanel>

      {/* 구글 시트 연동 탭 */}
      <TabPanel value={tabValue} index={1}>
        <GoogleSheetsSync />
      </TabPanel>

      {/* URL 관리 탭 */}
      <TabPanel value={tabValue} index={2}>
        <URLManager />
      </TabPanel>

      {/* 원두 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBean ? '원두 수정' : '새 원두 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="원두명"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="원산지"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="품종"
              value={formData.varieties}
              onChange={(e) => setFormData({ ...formData, varieties: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>프로세싱</InputLabel>
              <Select
                value={formData.process}
                label="프로세싱"
                onChange={(e) => setFormData({ ...formData, process: e.target.value })}
              >
                <MenuItem value="Natural">Natural</MenuItem>
                <MenuItem value="Washed">Washed</MenuItem>
                <MenuItem value="Honey">Honey</MenuItem>
                <MenuItem value="Semi-Washed">Semi-Washed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="지역"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            />
            <TextField
              fullWidth
              label="고도"
              value={formData.altitude}
              onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
              placeholder="예: 1500m"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              multiple
              freeSolo
              options={['Floral', 'Fruity', 'Nutty', 'Chocolate', 'Caramel', 'Vanilla', 'Citrus', 'Berry', 'Wine', 'Spicy']}
              value={formData.flavorNotes}
              onChange={(_, newValue) => setFormData({ ...formData, flavorNotes: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="플레이버 노트"
                  placeholder="플레이버 노트를 입력하세요"
                />
              )}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="스토리"
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="커스텀 URL"
              value={formData.customUrl}
              onChange={(e) => setFormData({ ...formData, customUrl: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              placeholder="예: ethiopia-yirgacheffe"
              helperText="영문, 숫자, 하이픈만 사용 가능"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="활성화"
            />
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            판매 정보
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.saleInfo.isForSale}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    saleInfo: { ...formData.saleInfo, isForSale: e.target.checked }
                  })}
                />
              }
              label="판매 여부"
            />
            <TextField
              fullWidth
              label="가격"
              type="number"
              value={formData.saleInfo.price}
              onChange={(e) => setFormData({ 
                ...formData, 
                saleInfo: { ...formData.saleInfo, price: parseInt(e.target.value) || 0 }
              })}
              disabled={!formData.saleInfo.isForSale}
              InputProps={{
                startAdornment: <InputAdornment position="start">₩</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="재고"
              type="number"
              value={formData.saleInfo.stock}
              onChange={(e) => setFormData({ 
                ...formData, 
                saleInfo: { ...formData.saleInfo, stock: parseInt(e.target.value) || 0 }
              })}
              disabled={!formData.saleInfo.isForSale}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            취소
          </Button>
          <Button 
            onClick={handleSaveBean} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.origin || !formData.varieties || !formData.process}
          >
            {editingBean ? '수정' : '추가'}
          </Button>
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

export default BeansManagement;