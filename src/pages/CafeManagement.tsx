import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Store as StoreIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Language as BlogIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Public as WebsiteIcon,
  PhotoCamera as PhotoIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { cafeService } from '../services/cafeService';
import type { CafeInfo, SocialMedia } from '../types';

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
      id={`cafe-tabpanel-${index}`}
      aria-labelledby={`cafe-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CafeManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [cafeInfo, setCafeInfo] = useState<CafeInfo | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<any>('');
  const [newSocialAccount, setNewSocialAccount] = useState<Partial<SocialMedia>>({});

  useEffect(() => {
    loadCafeData();
  }, []);

  const loadCafeData = async () => {
    setLoading(true);
    try {
      const info = cafeService.getCafeInfo();
      const social = cafeService.getSocialMediaAccounts();
      setCafeInfo(info);
      setSocialMedia(social);
    } catch (error) {
      console.error('카페 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCafeInfo = (field: string, value: any) => {
    setEditingField(field);
    setEditingValue(value);
    setEditDialogOpen(true);
  };

  const handleSaveCafeInfo = async () => {
    if (!cafeInfo) return;

    try {
      const updates: Partial<CafeInfo> = {};
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        if (parent === 'address' && cafeInfo.address) {
          updates.address = { ...cafeInfo.address, [child]: editingValue };
        } else if (parent === 'contact' && cafeInfo.contact) {
          updates.contact = { ...cafeInfo.contact, [child]: editingValue };
        }
      } else {
        (updates as any)[editingField] = editingValue;
      }

      const updatedInfo = await cafeService.updateCafeInfo(updates);
      setCafeInfo(updatedInfo);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('카페 정보 업데이트 실패:', error);
    }
  };

  const handleUpdateBusinessHours = async (day: string, hours: any) => {
    try {
      const updatedInfo = await cafeService.updateBusinessHours(day, hours);
      setCafeInfo(updatedInfo);
    } catch (error) {
      console.error('영업시간 업데이트 실패:', error);
    }
  };

  const handleToggleSocialMedia = async (platform: string) => {
    try {
      const updatedSocial = await cafeService.toggleSocialMediaAccount(platform);
      setSocialMedia(updatedSocial);
    } catch (error) {
      console.error('SNS 계정 토글 실패:', error);
    }
  };

  const handleAddSocialAccount = async () => {
    if (!newSocialAccount.platform || !newSocialAccount.handle || !newSocialAccount.url) return;

    try {
      const updatedSocial = await cafeService.addSocialMediaAccount(newSocialAccount as Omit<SocialMedia, 'lastUpdated'>);
      setSocialMedia(updatedSocial);
      setNewSocialAccount({});
      setSocialDialogOpen(false);
    } catch (error) {
      console.error('SNS 계정 추가 실패:', error);
    }
  };

  const handleDeleteSocialAccount = async (platform: string) => {
    try {
      const updatedSocial = await cafeService.deleteSocialMediaAccount(platform);
      setSocialMedia(updatedSocial);
    } catch (error) {
      console.error('SNS 계정 삭제 실패:', error);
    }
  };

  const handleUpdateFollowers = async () => {
    try {
      const updatedSocial = await cafeService.updateFollowerCounts();
      setSocialMedia(updatedSocial);
    } catch (error) {
      console.error('팔로워 수 업데이트 실패:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <InstagramIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'threads': return <TwitterIcon />;
      case 'blog': return <BlogIcon />;
      default: return <BlogIcon />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'facebook': return '#1877F2';
      case 'twitter': return '#1DA1F2';
      case 'threads': return '#000000';
      case 'blog': return '#FF6B35';
      default: return '#666666';
    }
  };

  const businessStatus = cafeInfo ? cafeService.getBusinessStatus() : null;
  const cafeStats = cafeService.getCafeStats();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!cafeInfo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">카페 정보를 불러올 수 없습니다.</Alert>
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
        🏪 카페 정보 관리
      </Typography>

      {/* 카페 상태 카드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ background: businessStatus?.isOpen ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>영업 상태</Typography>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {businessStatus?.isOpen ? '영업중' : '마감'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {businessStatus?.nextChange}
                </Typography>
              </Box>
              <StoreIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>총 팔로워</Typography>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {cafeStats.totalFollowers.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {cafeStats.activePlatforms}개 플랫폼
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>인기 플랫폼</Typography>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {cafeStats.topPlatform.toUpperCase()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  최고 팔로워
                </Typography>
              </Box>
              {getSocialIcon(cafeStats.topPlatform)}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>마지막 업데이트</Typography>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {cafeStats.lastUpdate.toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  SNS 동기화
                </Typography>
              </Box>
              <RefreshIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.8)' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<StoreIcon />} label="기본 정보" />
          <Tab icon={<InstagramIcon />} label="SNS 연동" />
          <Tab icon={<ScheduleIcon />} label="영업시간" />
        </Tabs>
      </Box>

      {/* 기본 정보 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* 카페 기본 정보 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                카페 기본 정보
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={cafeInfo.logo}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  <StoreIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {cafeInfo.name}
                  </Typography>
                  <Button
                    startIcon={<PhotoIcon />}
                    size="small"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          try {
                            await cafeService.uploadLogo(file);
                            loadCafeData();
                          } catch (error) {
                            console.error('로고 업로드 실패:', error);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    로고 변경
                  </Button>
                </Box>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon><StoreIcon /></ListItemIcon>
                  <ListItemText
                    primary="카페명"
                    secondary={cafeInfo.name}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditCafeInfo('name', cafeInfo.name)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><LocationIcon /></ListItemIcon>
                  <ListItemText
                    primary="주소"
                    secondary={`${cafeInfo.address.street}, ${cafeInfo.address.city} ${cafeInfo.address.zipCode}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditCafeInfo('address.street', cafeInfo.address.street)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText
                    primary="전화번호"
                    secondary={cafeInfo.contact.phone}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditCafeInfo('contact.phone', cafeInfo.contact.phone)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText
                    primary="이메일"
                    secondary={cafeInfo.contact.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditCafeInfo('contact.email', cafeInfo.contact.email)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><WebsiteIcon /></ListItemIcon>
                  <ListItemText
                    primary="웹사이트"
                    secondary={cafeInfo.contact.website}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEditCafeInfo('contact.website', cafeInfo.contact.website)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* 카페 설명 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                카페 소개
              </Typography>
              <Typography variant="body1" paragraph>
                {cafeInfo.description}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleEditCafeInfo('description', cafeInfo.description)}
              >
                소개 수정
              </Button>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      {/* SNS 연동 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            SNS 계정 관리
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleUpdateFollowers}
              sx={{ mr: 1 }}
            >
              팔로워 수 업데이트
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setSocialDialogOpen(true)}
            >
              계정 추가
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {socialMedia.map((account) => (
            <Card key={account.platform}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: getSocialColor(account.platform),
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    {getSocialIcon(account.platform)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {account.platform}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.handle}
                    </Typography>
                  </Box>
                  <Switch
                    checked={account.isActive}
                    onChange={() => handleToggleSocialMedia(account.platform)}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    URL
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {account.url}
                  </Typography>
                </Box>

                {account.followerCount !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      팔로워 수
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {account.followerCount.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    마지막 업데이트
                  </Typography>
                  <Typography variant="body2">
                    {account.lastUpdated.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={account.isActive ? '활성' : '비활성'}
                    color={account.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSocialAccount(account.platform)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* 영업시간 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          영업시간 설정
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Alert severity="info">
            현재 상태: {businessStatus?.isOpen ? '영업중' : '마감'} • {businessStatus?.nextChange}
          </Alert>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {Object.entries(cafeInfo.businessHours).map(([day, hours]) => (
            <Card key={day}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {day === 'monday' ? '월요일' :
                     day === 'tuesday' ? '화요일' :
                     day === 'wednesday' ? '수요일' :
                     day === 'thursday' ? '목요일' :
                     day === 'friday' ? '금요일' :
                     day === 'saturday' ? '토요일' : '일요일'}
                  </Typography>
                  <Switch
                    checked={!hours.isClosed}
                    onChange={(e) => handleUpdateBusinessHours(day, { ...hours, isClosed: !e.target.checked })}
                  />
                </Box>

                {!hours.isClosed ? (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      type="time"
                      label="오픈"
                      value={hours.open}
                      onChange={(e) => handleUpdateBusinessHours(day, { ...hours, open: e.target.value })}
                      size="small"
                    />
                    <Typography>~</Typography>
                    <TextField
                      type="time"
                      label="마감"
                      value={hours.close}
                      onChange={(e) => handleUpdateBusinessHours(day, { ...hours, close: e.target.value })}
                      size="small"
                    />
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    휴무일
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* 편집 다이얼로그 */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>정보 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline={editingField === 'description'}
            rows={editingField === 'description' ? 4 : 1}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button onClick={handleSaveCafeInfo} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>

      {/* SNS 계정 추가 다이얼로그 */}
      <Dialog open={socialDialogOpen} onClose={() => setSocialDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>SNS 계정 추가</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>플랫폼</InputLabel>
            <Select
              value={newSocialAccount.platform || ''}
              onChange={(e) => setNewSocialAccount({ ...newSocialAccount, platform: e.target.value as any })}
            >
              <MenuItem value="instagram">Instagram</MenuItem>
              <MenuItem value="facebook">Facebook</MenuItem>
              <MenuItem value="twitter">Twitter</MenuItem>
              <MenuItem value="threads">Threads</MenuItem>
              <MenuItem value="blog">Blog</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="핸들/계정명"
            value={newSocialAccount.handle || ''}
            onChange={(e) => setNewSocialAccount({ ...newSocialAccount, handle: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="URL"
            value={newSocialAccount.url || ''}
            onChange={(e) => setNewSocialAccount({ ...newSocialAccount, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            type="number"
            label="팔로워 수 (선택사항)"
            value={newSocialAccount.followerCount || ''}
            onChange={(e) => setNewSocialAccount({ ...newSocialAccount, followerCount: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSocialDialogOpen(false)}>취소</Button>
          <Button onClick={handleAddSocialAccount} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CafeManagement; 