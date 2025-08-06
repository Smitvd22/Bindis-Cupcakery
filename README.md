# Bindi's Cupcakery 🧁

A modern, full-stack e-commerce web application for a cloud kitchen specializing in cupcakes, cakes, and custom dessert hampers. This project was developed for the **GWOC (GirlScript Winter of Code)** program, showcasing a complete bakery management system with order processing, payment integration, and real-time notifications.

## 🏆 Project Achievement

This project was created as part of the **GWOC (GirlScript Winter of Code)** program, demonstrating advanced full-stack development skills with modern web technologies and comprehensive e-commerce functionality.

![GWOC](https://img.shields.io/badge/GWOC-Project-brightgreen?style=for-the-badge&logo=git&logoColor=white)
![Full Stack](https://img.shields.io/badge/Full_Stack-Application-blue?style=for-the-badge&logo=react&logoColor=white)

## 👥 Contributors

- **[Smit Deoghare]** - Full-Stack Development & Database Design  
- **[Naishadh Rana]** - Backend Integration & API Development
- **[Angela Dutta]** - Frontend Development & UI/UX Design
- **[Rudray Dave]** - Payment Integration & DevOps

## 🎯 Project Overview

Bindi's Cupcakery is a comprehensive cloud kitchen management platform that enables customers to browse products, customize hampers, place orders, and track deliveries. The platform features an admin dashboard for order management and integrates with payment gateways and WhatsApp notifications.

### Key Business Features

- **Product Catalog** - Browse cupcakes, cakes, and desserts by categories
- **Custom Hampers** - Create personalized dessert boxes with multiple items
- **Order Management** - Complete order lifecycle from placement to pickup
- **Payment Processing** - Secure online payments and cash-on-delivery options
- **Real-time Notifications** - WhatsApp integration for order updates
- **Admin Dashboard** - Comprehensive order and inventory management
- **User Authentication** - Secure login system with JWT tokens
- **Review System** - Customer feedback and rating management

## ✨ Key Features

### Customer Features
- 🛍️ **Product Browsing** - Categorized product display with search and filters
- 🎨 **Custom Hamper Builder** - Interactive dessert box customization
- 🛒 **Shopping Cart** - Add/remove items with quantity management
- 💳 **Multiple Payment Options** - Online payment and pay-on-pickup
- 📱 **Order Tracking** - Real-time order status updates
- ⭐ **Review System** - Rate and review purchased products
- 👤 **User Profiles** - Account management and order history

### Admin Features
- 📊 **Order Dashboard** - View and manage current orders
- ✅ **Order Processing** - Accept/reject orders with status updates
- 📦 **Inventory Management** - Add/edit products and categories
- 💬 **WhatsApp Integration** - Automated customer notifications
- 📈 **Analytics** - Order history and performance metrics
- 🔧 **Menu Customization** - Dynamic product and category management

### Technical Features
- 🔐 **JWT Authentication** - Secure user and admin authentication
- 🎯 **RESTful API** - Well-structured backend API endpoints
- 📱 **Responsive Design** - Mobile-first responsive interface
- ⚡ **Real-time Updates** - Live order status synchronization
- 🐳 **Docker Containerization** - Complete containerized deployment
- 🔄 **Database Transactions** - ACID-compliant order processing

## 🛠️ Tech Stack

### Frontend Framework
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.1.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Styling & UI
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4.7-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-Icons-orange?style=for-the-badge&logo=react&logoColor=white)

### Backend Framework
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.21.2-000000?style=for-the-badge&logo=express&logoColor=white)

### Database & Storage
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### Authentication & Security
![JWT](https://img.shields.io/badge/JWT-Tokens-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-Hashing-red?style=for-the-badge&logo=security&logoColor=white)

### Payment Integration
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-3395FF?style=for-the-badge&logo=razorpay&logoColor=white)
![Google Pay](https://img.shields.io/badge/Google_Pay-Integration-4285F4?style=for-the-badge&logo=google-pay&logoColor=white)

### Communication & Notifications
![Twilio](https://img.shields.io/badge/Twilio-WhatsApp-F22F46?style=for-the-badge&logo=twilio&logoColor=white)

### DevOps & Deployment
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white)

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 18 or higher)
- **PostgreSQL** (version 13 or higher)
- **Docker & Docker Compose** (for containerized deployment)
- **Git** for version control

### Environment Variables

Create `.env` files in both server and react directories:

#### Server Environment (server/.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bindis_cupcakery
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
jwtSecret=your_jwt_secret_key

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=whatsapp:+1234567890

# Payment Gateway Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

#### React Environment (react/.env)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Installation Methods

#### Method 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Bindis-Cupcakery.git
   cd Bindis-Cupcakery
   ```

2. **Set up environment variables**
   ```bash
   # Copy and configure environment files
   cp server/.env.example server/.env
   cp react/.env.example react/.env
   # Edit the .env files with your configurations
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Initialize the database**
   ```bash
   # Connect to the database container
   docker exec -it db psql -U postgres
   # Run the database initialization scripts
   \i /var/lib/postgresql/data/database.sql
   ```

#### Method 2: Manual Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Bindis-Cupcakery.git
   cd Bindis-Cupcakery
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../react
   npm install
   ```

4. **Set up PostgreSQL Database**
   ```bash
   # Create database
   createdb bindis_cupcakery
   
   # Run database schema
   psql -d bindis_cupcakery -f server/database.sql
   ```

5. **Start the Backend Server**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:5000
   ```

6. **Start the Frontend Development Server**
   ```bash
   cd react
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173) (with Docker: [http://localhost:8000](http://localhost:8000))
- **Backend API**: [http://localhost:5000](http://localhost:5000) (with Docker: [http://localhost:3000](http://localhost:3000))
- **Database**: localhost:5432 (PostgreSQL)

## 📊 Database Schema

### Core Tables

- **users** - Customer authentication and profiles
- **categories** - Product categories (Cupcakes, Cakes, etc.)
- **products** - Individual bakery items with details
- **hampers** - Pre-made and custom dessert boxes
- **carts & cart_items** - Shopping cart management
- **current_orders** - Active orders being processed
- **order_history** - Completed order records
- **reviews** - Customer feedback and ratings

### Key Relationships

```sql
users (1) -> (n) carts (1) -> (n) cart_items (n) -> (1) products
users (1) -> (n) current_orders -> order_history
products (n) -> (1) categories
products (1) -> (n) reviews
```

## 🔌 API Endpoints

### Authentication Routes
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/admin/login` - Admin login
- `GET /auth/is-verify` - Token verification

### Product Routes
- `GET /products` - List all products
- `GET /products/:id` - Product details
- `GET /products/category/:name` - Products by category
- `GET /categories` - List categories

### Cart & Order Routes
- `POST /cart/add` - Add item to cart
- `GET /cart` - Get cart contents
- `POST /cart/checkout` - Place order
- `GET /track/current-order` - Track active order

### Admin Routes
- `GET /admin/current-orders` - Manage orders
- `PUT /admin/current-orders/:id/status` - Update order status
- `POST /admin/products` - Add new products
- `GET /admin/categories` - Manage categories

## 🎨 Component Architecture

### Frontend Structure
```
src/
├── components/
│   ├── Auth/           # Login, Register components
│   ├── Cart/           # Shopping cart functionality
│   ├── Products/       # Product display components
│   ├── Orders/         # Order management
│   ├── Admin/          # Admin dashboard
│   └── UI/            # Reusable UI components
├── config/
│   └── api.js         # API configuration
└── assets/            # Images and static files
```

### Backend Structure
```
server/
├── routes/
│   ├── auth.js        # Authentication routes
│   ├── products.js    # Product management
│   ├── cart.js        # Cart operations
│   ├── orders.js      # Order processing
│   └── admin.js       # Admin operations
├── middleware/
│   ├── authorization.js # JWT middleware
│   └── validInfo.js     # Input validation
└── utils/
    └── jwtGenerator.js  # JWT utilities
```

## 🌟 Advanced Features

### Custom Hamper Builder
- Interactive dessert selection interface
- Real-time price calculation
- Customizable quantity limits
- Visual hamper preview

### WhatsApp Integration
- Automated order confirmations
- Status update notifications
- Pickup reminders
- Admin notifications

### Payment Processing
- Razorpay integration for online payments
- Google Pay support
- Pay-on-pickup option
- Transaction verification

### Admin Dashboard
- Real-time order monitoring
- Inventory management
- Customer communication tools
- Sales analytics

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **CORS Protection** - Configured cross-origin resource sharing
- **SQL Injection Prevention** - Parameterized queries
- **Rate Limiting** - API endpoint protection

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized images and loading
- Progressive Web App features

## 🚀 Deployment

### Production Deployment

1. **Environment Configuration**
   ```bash
   # Set production environment variables
   NODE_ENV=production
   API_BASE_URL=https://your-domain.com
   ```

2. **Build Frontend**
   ```bash
   cd react
   npm run build
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Heroku, Railway, Render, or AWS EC2
- **Database**: AWS RDS, Google Cloud SQL, or DigitalOcean Managed Database

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd react
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for user workflows

## 📈 Performance Optimizations

- **Image Optimization** - Lazy loading and compression
- **Code Splitting** - Dynamic imports for route-based splitting
- **Database Indexing** - Optimized queries with proper indexes
- **Caching** - API response caching and static asset caching
- **Minification** - Compressed CSS and JavaScript bundles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ES6+ JavaScript standards
- Use meaningful component and variable names
- Write comprehensive comments for complex logic
- Ensure responsive design for all new features
- Add appropriate error handling and validation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

For support or queries regarding this project:

- **Email**: support@bindiscupcakery.com
- **Phone**: +91 88491 30189
- **GitHub Issues**: [Create an Issue](https://github.com/your-username/Bindis-Cupcakery/issues)

## 🙏 Acknowledgments

- **GWOC Team** - For providing the platform and opportunity
- **Open Source Community** - For the amazing libraries and tools
- **Contributors** - For their valuable contributions and feedback
- **Beta Testers** - For helping identify and resolve issues

---

**Made with 💝 for sweet memories and delicious moments**

![Bindi's Cupcakery](https://img.shields.io/badge/Bindi's-Cupcakery-pink?style=for-the-badge&logo=cake&logoColor=white)
