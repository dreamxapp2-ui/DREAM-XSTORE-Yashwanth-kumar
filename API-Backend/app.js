const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();

// Triggered nodemon restart for new DB connection


// Import routes
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google.auth');
const designRoutes = require('./routes/design');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const brandRoutes = require('./routes/brand');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const inventoryRoutes = require('./routes/inventory');
const bannerRoutes = require('./routes/banners');
var downloadRouter = require('./routes/download');
const paymentRoutes = require('./payment-api/routes/payment');
const shipmentRoutes = require('./payment-api/routes/shipment');


const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://dreamx-store.onrender.com',
    'http://localhost:3001',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Request from origin ${origin} blocked. Allowed:`, allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        // process.exit(1); // Commented out to allow testing without DB
    });

// Routes


//auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);

//upload routes
app.use('/api/upload', uploadRoutes);

//brand routes
app.use('/api/brand', brandRoutes);

//admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', productRoutes);

//product and user routes
app.use('/', userRoutes);

// reviews routes
app.use('/api', reviewRoutes);

//public product routes
app.use('/api/products', productRoutes);

//inventory routes
app.use('/api/inventory', inventoryRoutes);

//banner routes (public)
app.use('/api/banners', bannerRoutes);

app.use('/api/payment', paymentRoutes);
app.use('/api/shipment', shipmentRoutes);

app.use('/download', downloadRouter);


// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Online Shop API' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;