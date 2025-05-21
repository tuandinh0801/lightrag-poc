import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Apple,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

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

const steps = ['Account Details', 'Personal Information', 'Confirmation'];

const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'agreeToTerms') {
      setFormData({ ...formData, [name]: checked });
    } else if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0) {
      // Validate account details
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (activeStep === 1) {
      // Validate personal information
      if (!formData.phone) {
        setError('Please provide a phone number');
        return;
      }
      
      // Phone validation (simple check)
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid phone number');
        return;
      }
    } else if (activeStep === 2) {
      // Validate terms agreement
      if (!formData.agreeToTerms) {
        setError('You must agree to the terms and conditions');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="street"
              label="Street Address"
              name="address.street"
              autoComplete="street-address"
              value={formData.address.street}
              onChange={handleChange}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="city"
                  label="City"
                  name="address.city"
                  autoComplete="address-level2"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="state"
                  label="State/Province"
                  name="address.state"
                  autoComplete="address-level1"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="zipCode"
                  label="Zip/Postal Code"
                  name="address.zipCode"
                  autoComplete="postal-code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="country"
                  label="Country"
                  name="address.country"
                  autoComplete="country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </>
        );
      case 2:
        return (
          <>
            <Box sx={{ mb: 3, width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Name:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{formData.name}</Typography>
                </Grid>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{formData.email}</Typography>
                </Grid>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Phone:
                  </Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{formData.phone}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            {formData.address.street && (
              <Box sx={{ mb: 3, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body2">
                  {formData.address.street}
                  {formData.address.city && `, ${formData.address.city}`}
                  {formData.address.state && `, ${formData.address.state}`}
                  {formData.address.zipCode && ` ${formData.address.zipCode}`}
                  {formData.address.country && `, ${formData.address.country}`}
                </Typography>
              </Box>
            )}
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  name="agreeToTerms"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link component={RouterLink} to="/terms" color="primary">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link component={RouterLink} to="/privacy" color="primary">
                    Privacy Policy
                  </Link>
                </Typography>
              }
              sx={{ width: '100%', mt: 2 }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Left Side - Registration Form */}
        <Grid item xs={12} md={7}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom align="center">
              Join us to start shopping
            </Typography>

            <Stepper activeStep={activeStep} sx={{ width: '100%', my: 4 }} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading || !formData.agreeToTerms}
                    sx={{ py: 1, px: 4 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    sx={{ py: 1, px: 4 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>

            {activeStep === 0 && (
              <>
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
              </>
            )}

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  color="primary.main"
                  fontWeight="bold"
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </StyledPaper>
        </Grid>

        {/* Right Side - Benefits */}
        <Grid
          item
          xs={12}
          md={5}
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
              padding: 4,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              borderRadius: 2,
              boxShadow: 4,
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Join Our Community
            </Typography>
            <Typography variant="body1" paragraph>
              Create an account to enjoy all the benefits of our store.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">Fast Checkout</Typography>
                  <Typography variant="body2">
                    Save your details for a quick and easy checkout experience.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">Order Tracking</Typography>
                  <Typography variant="body2">
                    Track your orders and view your order history anytime.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">Exclusive Offers</Typography>
                  <Typography variant="body2">
                    Receive personalized offers and promotions just for members.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">Wishlist</Typography>
                  <Typography variant="body2">
                    Save your favorite items to purchase later.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RegisterPage;
