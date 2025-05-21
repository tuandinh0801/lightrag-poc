import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Link,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6),
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const SocialButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
}));

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as LocationState;
  const from = locationState?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await login(email, password);
      navigate(from);
    } catch (error: any) {
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Grid container spacing={4} alignItems="stretch">
        {/* Left Side - Login Form */}
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom align="center">
              Sign in to your account to continue
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            {from !== '/' && (
              <Alert severity="info" sx={{ width: '100%', mt: 2, mb: 2 }}>
                Please login to continue to {from.replace('/', '')}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  color="primary.main"
                >
                  Forgot password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    color="primary.main"
                    fontWeight="bold"
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ width: '100%', my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ width: '100%' }}>
              <SocialButton
                variant="outlined"
                startIcon={<Google />}
                onClick={() => {
                  // In a real app, this would integrate with Google OAuth
                  setError('Social login is not implemented in this demo');
                }}
              >
                Continue with Google
              </SocialButton>
              <SocialButton
                variant="outlined"
                startIcon={<Facebook />}
                onClick={() => {
                  setError('Social login is not implemented in this demo');
                }}
              >
                Continue with Facebook
              </SocialButton>
              <SocialButton
                variant="outlined"
                startIcon={<Apple />}
                onClick={() => {
                  setError('Social login is not implemented in this demo');
                }}
              >
                Continue with Apple
              </SocialButton>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Side - Image and Info */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'relative',
          }}
        >
          <Paper
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 4,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: 2,
              boxShadow: 4,
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Welcome to Our Store
            </Typography>
            <Typography variant="body1" paragraph align="center">
              Sign in to access your account, track orders, and enjoy a personalized shopping experience.
            </Typography>
            <Box
              sx={{
                mt: 4,
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                width: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Benefits of creating an account:
              </Typography>
              <ul style={{ paddingLeft: '20px' }}>
                <li>
                  <Typography variant="body2" paragraph>
                    Fast checkout process
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" paragraph>
                    Save multiple shipping addresses
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" paragraph>
                    Access your order history
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" paragraph>
                    Track your orders easily
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Receive exclusive offers and discounts
                  </Typography>
                </li>
              </ul>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
