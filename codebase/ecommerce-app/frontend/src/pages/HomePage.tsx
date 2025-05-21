import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  ArrowForward,
  Star,
  FlashOn,
  LocalShipping,
  Security,
  Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { productApi, Product } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { ProductCard } from '../components/ProductCard';

const HeroSection = styled('section')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(8, 0),
  marginBottom: theme.spacing(6),
  overflow: 'hidden',
}));

const HeroContent = styled(Container)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  height: '100%',
  padding: '4rem 0',
});

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    fontSize: '3.5rem',
    lineHeight: 1.1,
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  maxWidth: '600px',
  opacity: 0.9,
  [theme.breakpoints.up('md')]: {
    fontSize: '1.25rem',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4, 2),
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '2rem',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '50%',
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  },
}));

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Fetch featured products
  const {
    data: featuredProducts = [],
    isLoading: isLoadingFeatured,
  } = useQuery<Product[]>('featuredProducts', () =>
    productApi.getProducts({ featured: true, limit: 8 })
  );

  // Fetch new arrivals
  const {
    data: newArrivals = [],
    isLoading: isLoadingNewArrivals,
  } = useQuery<Product[]>('newArrivals', () =>
    productApi.getProducts({ sort: 'newest', limit: 8 })
  );

  // Fetch best sellers
  const {
    data: bestSellers = [],
    isLoading: isLoadingBestSellers,
  } = useQuery<Product[]>('bestSellers', () =>
    productApi.getProducts({ sort: 'bestseller', limit: 8 })
  );

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
  };

  const features = [
    {
      icon: <LocalShipping />,
      title: 'Free Shipping',
      description: 'On all orders over $50',
    },
    {
      icon: <Refresh />,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: <Security />,
      title: 'Secure Payment',
      description: '100% secure payment',
    },
    {
      icon: <FlashOn />,
      title: 'Fast Delivery',
      description: 'Same day shipping',
    },
  ];

  const heroSlides = [
    {
      title: 'Summer Collection 2024',
      subtitle: 'Discover our new arrivals with up to 30% off',
      image: '/images/hero-1.jpg',
      buttonText: 'Shop Now',
      buttonVariant: 'contained' as const,
    },
    {
      title: 'Limited Time Offer',
      subtitle: 'Get 50% off on selected items',
      image: '/images/hero-2.jpg',
      buttonText: 'View Deals',
      buttonVariant: 'outlined' as const,
    },
    {
      title: 'New Tech Gadgets',
      subtitle: 'The latest tech at unbeatable prices',
      image: '/images/hero-3.jpg',
      buttonText: 'Explore',
      buttonVariant: 'contained' as const,
    },
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Slider */}
      <Box sx={{ mb: 8 }}>
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={!isMobile}
          modules={[Autoplay, Pagination, Navigation]}
          style={{
            '--swiper-pagination-color': theme.palette.primary.main,
            '--swiper-navigation-color': theme.palette.primary.main,
          }}
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <HeroSection>
                <HeroContent>
                  <Box sx={{ maxWidth: '600px' }}>
                    <Chip
                      label="New Arrival"
                      color="secondary"
                      size="small"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                    <HeroTitle variant="h2" component="h1">
                      {slide.title}
                    </HeroTitle>
                    <HeroSubtitle variant="h5">
                      {slide.subtitle}
                    </HeroSubtitle>
                    <Button
                      variant={slide.buttonVariant}
                      color={slide.buttonVariant === 'contained' ? 'secondary' : 'primary'}
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/products')}
                      sx={{
                        borderRadius: '50px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      {slide.buttonText}
                    </Button>
                  </Box>
                </HeroContent>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: '50%',
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.1,
                    [theme.breakpoints.up('md')]: {
                      opacity: 1,
                      backgroundPosition: 'right',
                    },
                  }}
                />
              </HeroSection>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard elevation={2}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <SectionTitle variant="h4" component="h2">
            Featured Products
          </SectionTitle>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate('/products?filter=featured')}
          >
            View All
          </Button>
        </Box>

        {isLoadingFeatured ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* New Arrivals */}
      <Box bgcolor="background.paper" py={8}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <SectionTitle variant="h4" component="h2">
              New Arrivals
            </SectionTitle>
            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products?sort=newest')}
            >
              View All
            </Button>
          </Box>

          {isLoadingNewArrivals ? (
            <Box display="flex" justifyContent="center" my={8}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {newArrivals.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Best Sellers */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <SectionTitle variant="h4" component="h2">
            Best Sellers
          </SectionTitle>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate('/products?sort=bestseller')}
          >
            View All
          </Button>
        </Box>

        {isLoadingBestSellers ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {bestSellers.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Newsletter Section */}
      <Box bgcolor="primary.main" color="primary.contrastText" py={8}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Subscribe to Our Newsletter
            </Typography>
            <Typography variant="body1" mb={4} maxWidth="600px" mx="auto">
              Stay updated with our latest products, promotions, and news. Subscribe to
              our newsletter today!
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                maxWidth: '500px',
                mx: 'auto',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '4px 0 0 4px',
                  fontSize: '1rem',
                  outline: 'none',
                }}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                sx={{
                  borderRadius: '0 4px 4px 0',
                  px: 4,
                  py: '12px',
                  fontWeight: 600,
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
