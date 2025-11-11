const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();


// Import routes
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google.auth');
const designRoutes = require('./routes/design');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
var downloadRouter = require('./routes/download');


const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
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
        process.exit(1);
    });

// Routes


//auth routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);

//upload routes
app.use('/api/upload', uploadRoutes);

//admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin', productRoutes);

//product and user routes
app.use('/', userRoutes);

// reviews routes
app.use('/api', reviewRoutes);

//public product routes
app.use('/api/products', productRoutes);

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