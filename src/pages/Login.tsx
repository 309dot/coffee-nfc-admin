import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Avatar,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Coffee as CoffeeIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // 임시 로그인 로직 (실제로는 API 호출)
    setTimeout(() => {
      if (email === 'admin@m1ct.coffee' && password === 'admin123') {
        onLogin();
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fdf8f6 0%, #f2e8e5 50%, #eaddd7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(161, 128, 114, 0.2)',
              overflow: 'visible',
              position: 'relative',
            }}
          >
            {/* 로고 영역 */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #a18072 0%, #977669 100%)',
                  boxShadow: '0 8px 24px rgba(161, 128, 114, 0.4)',
                }}
              >
                <CoffeeIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
            </Box>

            <CardContent sx={{ pt: 8, pb: 4, px: 4 }}>
              {/* 헤더 */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                  }}
                >
                  M1CT Admin
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  커피 NFC 코스터 관리 시스템
                </Typography>
              </Box>

              {/* 에러 메시지 */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              {/* 로그인 폼 */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="이메일 주소"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  sx={{ mb: 4 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #a18072 0%, #977669 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #977669 0%, #846358 100%)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #d2bab0 0%, #bfa094 100%)',
                    },
                  }}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </Box>

              {/* 테스트 계정 안내 */}
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                  테스트 계정
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  admin@m1ct.coffee / admin123
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 