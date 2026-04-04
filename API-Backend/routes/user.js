const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const multer = require("multer");
const { SendMail } = require("../helpers/mailing");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// ── Repositories (single source of truth for data access) ──────────────────
const userRepo = require("../repositories/userAuthRepository");
const { getUserById, updateUserProfile } = userRepo;
const addressRepo = require("../repositories/addressRepository");
const orderRepo = require("../repositories/orderRepository");
const wishlistRepo = require("../repositories/wishlistRepository");

// Configure multer for hero image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/profile";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "hero-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
}).single("hero_image");

const { createShiprocketOrder } = require("../utils/shiprocket");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

router.post("/api/user/send-notification", async (req, res) => {
  try {
    const { name, phone, email, subject } = req.body;

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
    <h2 style="color: #6B21A8;">Brand Waitlist Brand Owner Details</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Message:</strong></p>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border: 1px solid #ddd;">
      <p>${subject.replace(/\n/g, "<br>")}</p>
    </div>
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #888;">This message was sent via the DesignersDen contact form.</p>
  </div>
`;

    await SendMail(htmlContent,"Need to Add My Brand to DreamXStore","ashiqfiroz08@gmail.com");
// console.log("done")
res.json({status:"done"})

  } catch (err) {
    res.json({message:err});
  }
});


router.post("/api/user/other-brands", authenticate, async (req, res) => {
  try {
    const brands = await userRepo.getBrandUsers({
      filter: { _id: { $ne: req.user._id } },
    });

    res.json({
      success: true,
      brands: brands.map(b => ({ username: b.username, hero_image: b.hero_image, _id: b._id }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching other brand accounts"
    });
  }
});

router.post("/api/user/add-collab", authenticate, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Collab user id is required" });
    }

    // Add the collab id to the user's collabs array (create if not exists)
    const updatedUser = await userRepo.addCollab(req.user._id, id);

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.log(updatedUser)
    res.json({ success: true, user: { username: updatedUser.username, collab: updatedUser.collab } });
  } catch (error) {
    console.error("Error adding collab:", error);
    res.status(500).json({ success: false, message: "Failed to add collab" });
  }
});

router.post("/api/user/hero-images", async (req, res) => {
  try {
    const { ids } = req.body;
    //console.log(ids)
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required" });
    }

    const users = await userRepo.getUsersByIds(ids);
    const images = users.map(user => ({
      id: user._id,
      hero_image: user.hero_image
    }));
    //console.log(images)
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching hero images" });
  }
});


router.post("/api/user/stats", async (req, res) => {
  try {
    const totalUsers = await userRepo.countUsers();
    const brandUsers = await userRepo.getBrandUsers();

    res.json({
      totalUsers,
      brandAccounts: brandUsers.map(user => ({
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user stats" });
  }
});

// Get user profile
router.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        lastName: user.lastName,
        email: user.email,
        firstName: user.firstName,
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        isBrand: user.isBrand,
        hero_image: user.hero_image,
        collab: user.collab || [],
        wishlist: user.wishlist || [],
        addresses: user.addresses || [],
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
});

// Get user profile
router.post("/api/user/public-profile", async (req, res) => {
  try {
    const user = await getUserById(req.body.id);
    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        bio: user.bio,
        isBrand: user.isBrand,
        hero_image: user.hero_image,
      },
    });
  } catch (err) {
    res.json({ Status: "Error" });
  }
});
// Update user profile
router.post(
  "/api/user/profile/update",
  authenticate,
  upload,
  async (req, res) => {
    try {
      const { username, lastName, bio, email } = req.body;
      let pickupLocations = req.body["pickup_locations[]"];

      if (pickupLocations && !Array.isArray(pickupLocations)) {
        pickupLocations = [pickupLocations];
      }

      const repoUpdates = {};
      if (username) repoUpdates.username = username;
      if (lastName) repoUpdates.lastName = lastName;
      if (bio) repoUpdates.bio = bio;
      if (email) repoUpdates.email = email;

      // If a new hero image was uploaded, add it to the update data
      if (req.file) {
        // Delete old hero image if it exists
        if (req.user.hero_image) {
          const oldImagePath = path.join(__dirname, '..', req.user.hero_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        repoUpdates.heroImageUrl = req.file.path;
      }

      // Only update pickup locations and hero image for brands
      if (req.user.isBrand) {
        repoUpdates.pickupLocation = (pickupLocations || []).join(',');
      }

      console.log(repoUpdates);

      const updatedUser = await updateUserProfile(req.user._id, repoUpdates);

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user profile",
      });
    }
  }
);

// PUT /api/user/profile - Update user profile with Cloudinary image support
router.put(
  "/api/user/profile",
  authenticate,
  async (req, res) => {
    try {
      const { firstName, lastName, username, bio, phone, hero_image } = req.body;
      
      const repoUpdates = {};
      if (firstName !== undefined) repoUpdates.firstName = firstName;
      if (lastName !== undefined) repoUpdates.lastName = lastName;
      if (username !== undefined) repoUpdates.username = username;
      if (bio !== undefined) repoUpdates.bio = bio;
      if (phone !== undefined) repoUpdates.phone = phone;
      
      // Handle Cloudinary image (comes as {url, publicId})
      if (hero_image) {
        repoUpdates.heroImageUrl = hero_image.url || hero_image;
        repoUpdates.heroImagePublicId = hero_image.publicId || null;
      }
      
      const updatedUser = await updateUserProfile(req.user._id, repoUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        user: updatedUser
      });
    } catch (error) {
      console.error('[updateProfile] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        error: error.message
      });
    }
  }
);

router.get("/api/public/profile/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "..", "public", "profile", filename);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    res.sendFile(imagePath);
  });
});

router.post("/api/user/send-forgot-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP as password (legacy behavior)
    await userRepo.setPasswordDirect(user._id, otp);

    // Send OTP via email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is:</p>
        <h3 style="color: #6B21A8;">${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `;
    await SendMail(htmlContent, "Your Password Reset OTP", email);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error sending forgot OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/api/user/forgot-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.password !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(user._id, hashedPassword);

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});


// Create new order (Called after successful payment)
router.post("/api/orders", authenticate, async (req, res) => {
  try {
    const { items, shippingData, total, paymentStatus, paymentMethod } = req.body;

    const order = await orderRepo.createOrder(req.user._id, {
      items,
      total,
      paymentStatus,
      paymentMethod,
      shippingAddressSnapshot: shippingData,
    });

    if (!order) {
      return res.status(503).json({ success: false, error: "No datastore available" });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

// Get Latest Orders Route
router.post("/api/orders/latest", authenticate, async (req, res) => {
  try {
    const orders = await orderRepo.getLatestOrders(req.user._id, 10);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching latest orders:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get top 4 brand users
router.post("/api/user/top-brands", async (req, res) => {
  try {
    const brands = await userRepo.getBrandUsers({ limit: 4 });

    if (!brands || brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No brand users found",
      });
    }

    const result = brands.map((user) => ({
      username: user.username,
      bio: user.bio,
      hero_image: user.hero_image,
    }));
    console.log(result);

    res.json({
      success: true,
      brands: result,
    });
  } catch (error) {
    console.error("Error fetching top brand users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top brand users",
    });
  }
});

// Wishlist endpoints
/**
 * POST /api/user/wishlist/add
 * Add product to wishlist
 */
router.post("/api/user/wishlist/add", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const result = await wishlistRepo.addToWishlist(req.user._id, productId);

    if (result.unavailable) {
      return res.status(503).json({ success: false, message: 'Wishlist is temporarily unavailable' });
    }
    if (result.alreadyExists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    res.json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('[addToWishlist] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product to wishlist' });
  }
});

/**
 * POST /api/user/wishlist/remove
 * Remove product from wishlist
 */
router.post("/api/user/wishlist/remove", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    await wishlistRepo.removeFromWishlist(req.user._id, productId);
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('[removeFromWishlist] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product from wishlist' });
  }
});

/**
 * GET /api/user/wishlist
 * Get user's wishlist with pagination
 */
router.get("/api/user/wishlist", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { items, total } = await wishlistRepo.getWishlist(req.user._id, page, limit);

    res.json({
      success: true,
      data: items,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[getWishlist] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
});

/**
 * GET /api/user/orders
 * Get user's order history
 */
router.get("/api/user/orders", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await orderRepo.getOrders(req.user._id, { page: parseInt(page), limit: parseInt(limit), status });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
  } catch (error) {
    console.error('[getUserOrders] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

/**
 * GET /api/user/orders/stats
 * Get user's order statistics (total orders, total spend)
 */
router.get("/api/user/orders/stats", authenticate, async (req, res) => {
  try {
    const stats = await orderRepo.getOrderStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[getUserOrderStats] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order statistics', error: error.message });
  }
});

/**
 * GET /api/user/orders/:orderId
 * Get specific order details
 */
router.get("/api/user/orders/:orderId", authenticate, async (req, res) => {
  try {
    const order = await orderRepo.getOrderById(req.user._id, req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('[getOrderDetails] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
  }
});

/**
 * GET /api/user/addresses
 * Get all user addresses
 */
router.get("/api/user/addresses", authenticate, async (req, res) => {
  try {
    const addresses = await addressRepo.getAddresses(req.user._id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('[getAddresses] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses', error: error.message });
  }
});

/**
 * POST /api/user/addresses
 * Add a new address
 */
router.post("/api/user/addresses", authenticate, async (req, res) => {
  try {
    const { type, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

    if (!name || !phone || !addressLine1 || !city || !state || !zipCode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const addresses = await addressRepo.addAddress(req.user._id, {
      type, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault,
    });

    if (!addresses) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Address added successfully', data: addresses });
  } catch (error) {
    console.error('[addAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to add address', error: error.message });
  }
});

/**
 * PUT /api/user/addresses/:addressId
 * Update an address
 */
router.put("/api/user/addresses/:addressId", authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

    const addresses = await addressRepo.updateAddress(req.user._id, addressId, {
      type, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault,
    });

    if (!addresses) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, message: 'Address updated successfully', data: addresses });
  } catch (error) {
    console.error('[updateAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
});

/**
 * DELETE /api/user/addresses/:addressId
 * Delete an address
 */
router.delete("/api/user/addresses/:addressId", authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    const addresses = await addressRepo.deleteAddress(req.user._id, addressId);

    if (!addresses) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted successfully', data: addresses });
  } catch (error) {
    console.error('[deleteAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
});

/**
 * PUT /api/user/addresses/:addressId/default
 * Set an address as default
 */
router.put("/api/user/addresses/:addressId/default", authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    const addresses = await addressRepo.setDefaultAddress(req.user._id, addressId);

    if (!addresses) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, message: 'Default address updated successfully', data: addresses });
  } catch (error) {
    console.error('[setDefaultAddress] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address', error: error.message });
  }
});

// ── Contact Form ──────────────────────────────────────────────────────────────
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    const content = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || 'support@dreamxstore.com';

    try {
      await SendMail(content, `Contact: ${subject || 'General Inquiry'} from ${name}`, adminEmail);
    } catch (mailError) {
      console.warn('[contact] Mail send failed (non-blocking):', mailError);
    }

    res.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('[contact] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
