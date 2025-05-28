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
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudSync as SyncIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import type { GoogleSheetsConfig, SyncResult, SyncHistory } from '../types';
import { googleSheetsService } from '../services/googleSheets';

const GoogleSheetsSync = () => {
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  // 설정 폼 상태
  const [configForm, setConfigForm] = useState({
    spreadsheetId: '',
    sheetName: 'Sheet1',
    range: 'A:L',
    apiKey: '',
    autoSync: false,
    syncInterval: 30
  });

  useEffect(() => {
    loadConfig();
    loadSyncHistory();
  }, []);

  const loadConfig = () => {
    const savedConfig = googleSheetsService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setConfigForm({
        spreadsheetId: savedConfig.spreadsheetId,
        sheetName: savedConfig.sheetName,
        range: savedConfig.range,
        apiKey: savedConfig.apiKey || '',
        autoSync: savedConfig.autoSync,
        syncInterval: savedConfig.syncInterval
      });
    }
  };

  const loadSyncHistory = () => {
    const history = googleSheetsService.getSyncHistory();
    setSyncHistory(history);
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const newConfig: GoogleSheetsConfig = {
        ...configForm,
        isConnected: false,
        lastSync: undefined
      };

      const isConnected = await googleSheetsService.setupGoogleSheets(newConfig);
      
      if (isConnected) {
        newConfig.isConnected = true;
        setConfig(newConfig);
        setSnackbar({
          open: true,
          message: '구글 시트 연결이 성공적으로 설정되었습니다!',
          severity: 'success'
        });
        setOpenConfigDialog(false);
        
        // 자동 동기화 설정
        if (newConfig.autoSync) {
          googleSheetsService.setupAutoSync();
        }
      } else {
        setSnackbar({
          open: true,
          message: '구글 시트 연결에 실패했습니다. 설정을 확인해주세요.',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `설정 저장 실패: ${error}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromSheets = async () => {
    setLoading(true);
    try {
      const result = await googleSheetsService.importFromSheets();
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
      
      loadSyncHistory();
      
      // 페이지 새로고침으로 업데이트된 데이터 반영
      if (result.success) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `가져오기 실패: ${error}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToSheets = async () => {
    setLoading(true);
    try {
      const result = await googleSheetsService.exportToSheets();
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'info' : 'error'
      });
      
      loadSyncHistory();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `내보내기 실패: ${error}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR');
  };

  const getStatusIcon = (success: boolean) => {
    return success ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const extractSpreadsheetId = (url: string): string => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
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
        📊 구글 시트 연동
      </Typography>

      {/* 연결 상태 카드 */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: '300px' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                연결 상태
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={config?.isConnected ? <SuccessIcon /> : <ErrorIcon />}
                  label={config?.isConnected ? '연결됨' : '연결 안됨'}
                  color={config?.isConnected ? 'success' : 'error'}
                  variant="filled"
                />
                {config?.lastSync && (
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                    마지막 동기화: {formatDate(config.lastSync)}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => setOpenConfigDialog(true)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                설정
              </Button>
              <Button
                variant="contained"
                startIcon={<HistoryIcon />}
                onClick={() => setOpenHistoryDialog(true)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                히스토리
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 동기화 액션 카드 */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DownloadIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">시트에서 가져오기</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                구글 시트의 원두 데이터를 관리자 시스템으로 가져옵니다.
                기존 데이터와 자동으로 병합됩니다.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
                onClick={handleImportFromSheets}
                disabled={!config?.isConnected || loading}
                fullWidth
              >
                가져오기
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UploadIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">시트로 내보내기</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                관리자 시스템의 원두 데이터를 CSV 파일로 다운로드합니다.
                구글 시트에 직접 업로드하여 사용하세요.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <UploadIcon />}
                onClick={handleExportToSheets}
                disabled={loading}
                fullWidth
              >
                내보내기 (CSV)
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      {/* 사용 가이드 */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 1 }} />
            <Typography variant="h6">구글 시트 연동 가이드</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>1. 구글 시트 준비:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2, mb: 2 }}>
            • 첫 번째 행에 헤더를 작성하세요: name, origin, varieties, process, region, altitude, flavor_notes, description, story, price, stock, active<br/>
            • 시트를 공개로 설정하거나 Google Sheets API 키를 사용하세요<br/>
            • flavor_notes는 쉼표로 구분하여 입력하세요 (예: "Blueberry, Wine, Chocolate")
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>2. 연동 설정:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2, mb: 2 }}>
            • 구글 시트 URL에서 스프레드시트 ID를 복사하세요<br/>
            • 시트 이름과 범위를 정확히 입력하세요<br/>
            • 자동 동기화를 원하면 간격을 설정하세요
          </Typography>

          <Typography variant="body2" paragraph>
            <strong>3. 데이터 형식:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ ml: 2 }}>
            • price: 숫자 (예: 45000)<br/>
            • stock: 정수 (예: 50)<br/>
            • active: TRUE 또는 FALSE<br/>
            • flavor_notes: 쉼표로 구분된 텍스트
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 설정 다이얼로그 */}
      <Dialog open={openConfigDialog} onClose={() => setOpenConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>구글 시트 연동 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="구글 시트 URL 또는 스프레드시트 ID"
              value={configForm.spreadsheetId}
              onChange={(e) => {
                const value = e.target.value;
                const id = extractSpreadsheetId(value);
                setConfigForm({ ...configForm, spreadsheetId: id });
              }}
              margin="normal"
              helperText="전체 URL을 붙여넣거나 스프레드시트 ID만 입력하세요"
            />
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="시트 이름"
                  value={configForm.sheetName}
                  onChange={(e) => setConfigForm({ ...configForm, sheetName: e.target.value })}
                  margin="normal"
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="범위"
                  value={configForm.range}
                  onChange={(e) => setConfigForm({ ...configForm, range: e.target.value })}
                  margin="normal"
                  helperText="예: A:L 또는 A1:L100"
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Google Sheets API 키 (선택사항)"
              value={configForm.apiKey}
              onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
              margin="normal"
              type="password"
              helperText="비공개 시트 접근 시 필요"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={configForm.autoSync}
                  onChange={(e) => setConfigForm({ ...configForm, autoSync: e.target.checked })}
                />
              }
              label="자동 동기화 활성화"
              sx={{ mt: 2 }}
            />

            {configForm.autoSync && (
              <TextField
                fullWidth
                label="동기화 간격 (분)"
                type="number"
                value={configForm.syncInterval}
                onChange={(e) => setConfigForm({ ...configForm, syncInterval: parseInt(e.target.value) || 30 })}
                margin="normal"
                inputProps={{ min: 5, max: 1440 }}
                helperText="5분 ~ 24시간 (1440분)"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfigDialog(false)}>취소</Button>
          <Button 
            onClick={handleSaveConfig} 
            variant="contained"
            disabled={loading || !configForm.spreadsheetId}
          >
            {loading ? <CircularProgress size={20} /> : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 히스토리 다이얼로그 */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            동기화 히스토리
            <IconButton onClick={loadSyncHistory}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {syncHistory.length === 0 ? (
              <ListItem>
                <ListItemText primary="동기화 히스토리가 없습니다." />
              </ListItem>
            ) : (
              syncHistory.map((item, index) => (
                <div key={item.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(item.result.success)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={item.direction === 'import' ? '가져오기' : '내보내기'}
                            size="small"
                            color={item.direction === 'import' ? 'primary' : 'secondary'}
                          />
                          <Chip
                            label={item.type === 'manual' ? '수동' : '자동'}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2">
                            {item.result.syncedCount}개 처리
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{item.result.message}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.timestamp)}
                          </Typography>
                          {item.result.errors.length > 0 && (
                            <Typography variant="caption" color="error" display="block">
                              오류: {item.result.errors.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < syncHistory.length - 1 && <Divider />}
                </div>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>닫기</Button>
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

export default GoogleSheetsSync; 