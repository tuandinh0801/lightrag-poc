import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Divider,
  Paper,
  IconButton,
  TextField,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  KeyboardBackspace,
  ShoppingBag,
  LocalShipping,
  Payment,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartItemCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ProductImage = styled(CardMedia)(({ theme }) => ({
  width: 100,
  height: 100,
  objectFit: 'contain',
  marginRight: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    height: 200,
    marginRight: 0,
    marginBottom: theme.spacing(2),
  },
}));

const QuantityControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  width: 'fit-content',
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const QuantityInput = styled(TextField)({
  '& .MuiInputBase-input': {
    textAlign: 'center',
    width: '40px',
    padding: '8px 0',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

const OrderSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
}));

const CartPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { items, itemCount, total, isLoading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Shopping Cart
      </Typography>

      {items.length === 0 ? (
        <Box textAlign="center" py={8}>
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Looks like you haven't added any products to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<KeyboardBackspace />}
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {items.map((item) => (
              <CartItemCard key={item.id} elevation={1}>
                <ProductImage
                  component="img"
                  image={item.imageUrl || '/placeholder-product.png'}
                  alt={item.name}
                  onClick={() => navigate(`/products/${item.id}`)}
                  sx={{ cursor: 'pointer' }}
                />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        component={RouterLink}
                        to={`/products/${item.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {item.category}
                      </Typography>
                      {item.stock < 10 && (
                        <Chip
                          label={`Only ${item.stock} left`}
                          size="small"
                          color="warning"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 'auto',
                      pt: 1,
                    }}
                  >
                    <QuantityControl>
                      <QuantityButton
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove fontSize="small" />
                      </QuantityButton>
                      <QuantityInput
                        value={item.quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0 && value <= item.stock) {
                            handleQuantityChange(item.id, value);
                          }
                        }}
                        inputProps={{
                          min: 1,
                          max: item.stock,
                          type: 'number',
                        }}
                        variant="outlined"
                        size="small"
                      />
                      <QuantityButton
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Add fontSize="small" />
                      </QuantityButton>
                    </QuantityControl>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CartItemCard>
            ))}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                mb: 4,
              }}
            >
              <Button
                startIcon={<KeyboardBackspace />}
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none' }}
              >
                Continue Shopping
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => navigate('/cart/clear')}
                sx={{ textTransform: 'none' }}
              >
                Clear Cart
              </Button>
            </Box>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <OrderSummary elevation={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body1">${total.toFixed(2)}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography variant="body1">
                    {total > 100 ? 'Free' : '$10.00'}
                  </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax (10%)" />
                  <Typography variant="body1">
                    ${(total * 0.1).toFixed(2)}
                  </Typography>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="h6" fontWeight="bold">
                    $
                    {(
                      total +
                      (total > 100 ? 0 : 10) +
                      total * 0.1
                    ).toFixed(2)}
                  </Typography>
                </ListItem>
              </List>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ mt: 3 }}
              >
                Proceed to Checkout
              </Button>

              {!isAuthenticated && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please <RouterLink to="/login">login</RouterLink> to complete
                  your purchase
                </Alert>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  We Accept
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((method) => (
                    <Chip
                      key={method}
                      label={method}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </OrderSummary>
          </Grid>
        </Grid>
      )}

      {/* Features */}
      <Grid container spacing={3} sx={{ mt: 6 }}>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              p: 2,
            }}
          >
            <LocalShipping
              color="primary"
              sx={{ fontSize: 40, mb: 1 }}
            />
            <Typography variant="h6" gutterBottom>
              Free Shipping
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On orders over $100
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              p: 2,
            }}
          >
            <ShoppingBag
              color="primary"
              sx={{ fontSize: 40, mb: 1 }}
            />
            <Typography variant="h6" gutterBottom>
              Easy Returns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              30-day return policy
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Payment
              color="primary"
              sx={{ fontSize: 40, mb: 1 }}
            />
            <Typography variant="h6" gutterBottom>
              Secure Payment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              100% secure checkout
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
