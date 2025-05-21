# E-Commerce Application

A full-stack e-commerce application built with React, TypeScript, Node.js, Express, and MongoDB.

## Project Structure

```
ecommerce-app/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx           # Main App component
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Features

### Frontend

- **Modern React with TypeScript**: Type-safe code with React 18 and TypeScript
- **Component-Based Architecture**: Reusable UI components for consistent design
- **State Management**: React Context API for global state management
- **API Integration**: Axios for API requests with React Query for data fetching, caching, and state management
- **Routing**: React Router v6 for navigation
- **Form Handling**: Form validation and submission
- **Authentication**: JWT-based authentication with protected routes
- **Responsive Design**: Mobile-first approach with Material-UI

### Backend

- **Node.js with Express**: RESTful API endpoints
- **TypeScript**: Type-safe backend code
- **MongoDB with Mongoose**: Data modeling and database operations
- **Authentication**: JWT-based authentication and authorization
- **Input Validation**: Request validation
- **Error Handling**: Centralized error handling middleware
- **Security**: Implementation of security best practices

## Main Features

- User authentication (register, login, profile management)
- Product browsing and searching
- Product categorization
- Shopping cart functionality
- Order processing
- Payment integration (placeholder)
- User reviews and ratings
- Admin dashboard for product and order management

## API Endpoints

### Auth

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)
- `POST /api/products/:id/reviews` - Create product review
- `GET /api/products/top` - Get top rated products

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item quantity
- `DELETE /api/cart/items/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin)
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders` - Get all orders (admin)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

## License

This project is licensed under the MIT License.
