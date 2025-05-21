import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Home,
  Category,
  Person,
  ExitToApp,
  ShoppingBag,
  AdminPanelSettings,
  Search,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 4),
  },
}));

const NavItems = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const DrawerContainer = styled('div')(({ theme }) => ({
  width: 250,
  padding: theme.spacing(2, 0),
}));

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3, 0),
  minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 64px)`,
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4, 0),
  },
}));

const Footer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3, 0),
  marginTop: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.action.hover,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const SearchInput = styled('input')(({ theme }) => ({
  color: 'inherit',
  padding: theme.spacing(1, 1, 1, 0),
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  transition: theme.transitions.create('width'),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '20ch',
    '&:focus': {
      width: '30ch',
    },
  },
  border: 'none',
  background: 'transparent',
  '&:focus': {
    outline: 'none',
  },
}));

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Products', icon: <Category />, path: '/products' },
  ];

  const userMenuItems = [
    { text: 'Profile', icon: <Person />, onClick: () => navigate('/profile') },
    { text: 'Orders', icon: <ShoppingBag />, onClick: () => navigate('/orders') },
  ];

  if (user?.isAdmin) {
    userMenuItems.push({
      text: 'Admin',
      icon: <AdminPanelSettings />,
      onClick: () => navigate('/admin'),
    });
  }

  const drawer = (
    <DrawerContainer>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            {userMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  item.onClick();
                  handleDrawerToggle();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </>
      )}
    </DrawerContainer>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledAppBar position="fixed">
        <Container maxWidth="xl">
          <StyledToolbar disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                E-Commerce
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    sx={{ color: 'inherit' }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </Box>

            <SearchContainer>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <SearchInput
                placeholder="Search products..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const searchQuery = (e.target as HTMLInputElement).value;
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              />
            </SearchContainer>

            <NavItems>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/cart"
                aria-label="shopping cart"
              >
                <Badge badgeContent={itemCount} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {isAuthenticated ? (
                <>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleProfileMenuOpen}
                      size="small"
                      sx={{ ml: 2 }}
                      aria-controls="account-menu"
                      aria-haspopup="true"
                    >
                      <Avatar
                        alt={user.name || 'User'}
                        src={user.avatar}
                        sx={{ width: 32, height: 32 }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => navigate('/profile')}>
                      <Avatar /> Profile
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/orders')}>
                      <ListItemIcon>
                        <ShoppingBag fontSize="small" />
                      </ListItemIcon>
                      My Orders
                    </MenuItem>
                    {user?.isAdmin && (
                      <MenuItem onClick={() => navigate('/admin')}>
                        <ListItemIcon>
                          <AdminPanelSettings fontSize="small" />
                        </ListItemIcon>
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <ExitToApp fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/register"
                    sx={{ ml: 1, display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </NavItems>
          </StyledToolbar>
        </Container>
      </StyledAppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <MainContent>
        <Toolbar /> {/* This is for proper spacing below the app bar */}
        <Container maxWidth="xl" sx={{ height: '100%' }}>
          {children}
        </Container>
      </MainContent>

      <Footer>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} E-Commerce App. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Button
                component="a"
                href="#"
                color="inherit"
                size="small"
              >
                Terms
              </Button>
              <Button
                component="a"
                href="#"
                color="inherit"
                size="small"
              >
                Privacy
              </Button>
              <Button
                component="a"
                href="#"
                color="inherit"
                size="small"
              >
                Contact
              </Button>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default Layout;
