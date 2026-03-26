const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/auth");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const multer = require("multer");
const { SendMail } = require("../helpers/mailing");
const path = require("path");
const fs = require("fs");

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
const bcrypt = require("bcryptjs");
const { addToWishlist, removeFromWishlist, getWishlist } = require("../controllers/wishlistController");

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
    const brands = await User.find({
      isBrand: true,
      _id: { $ne: req.user._id }
    }).select("username hero_image _id");

    res.json({
      success: true,
      brands
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
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { collab: id } }, // $addToSet prevents duplicates
      { new: true }
    ).select("username collab");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.log(updatedUser)
    res.json({ success: true, user: updatedUser });
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

    const users = await User.find({ _id: { $in: ids } }).select("_id hero_image");
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
    const totalUsers = await User.countDocuments({});
    const brandUsers = await User.find({ isBrand: true }).select("email username createdAt");

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
    const user = await User.findById(req.user._id).select(
      "username lastName email bio isBrand hero_image collab wishlist addresses role createdAt phone"
    );
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
        phone: user.phone,
        bio: user.bio,
        role: user.role,
        isBrand: user.isBrand,
        hero_image: user.hero_image,
        collab: user.collab,
        wishlist: user.wishlist,
        addresses: user.addresses,
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
    const user = await User.findById(req.body.id).select(
      "username lastName email bio isBrand hero_image"
    ); // Only select needed fields, exclude _id
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

      const updates = {
        username,
        lastName,
        bio,
        email,
      };

      // If a new hero image was uploaded, add it to the update data
      if (req.file) {
        // Delete old hero image if it exists
        if (req.user.hero_image) {
          const oldImagePath = path.join(__dirname, '..', req.user.hero_image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updates.hero_image = req.file.path;
      }

      // Only update pickup locations and hero image for brands
      if (req.user.isBrand) {
        updates.pickup_locations = pickupLocations || [];
      }

      console.log(updates);

      const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        select:
          "email username lastName bio isBrand pickup_locations hero_image",
      });

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
      
      console.log('[updateProfile] Body:', req.body);
      
      const updates = {};
      
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (username !== undefined) updates.username = username;
      if (bio !== undefined) updates.bio = bio;
      if (phone !== undefined) updates.phone = phone;
      
      // Handle Cloudinary image (comes as {url, publicId})
      if (hero_image) {
        console.log('[updateProfile] Saving hero_image:', hero_image);
        updates.hero_image = hero_image;
      }
      
      console.log('[updateProfile] Updates:', updates);
      
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, select: 'email username firstName lastName bio phone hero_image isBrand' }
      );
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      console.log('[updateProfile] Updated user:', updatedUser);
      
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

// // Update user profile
// router.post('/api/user/profile/update', authenticate, (req, res) => {
//     upload(req, res, async (err) => {
//         if (err instanceof multer.MulterError) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'File upload error',
//                 error: err.message
//             });
//         } else if (err) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Error uploading file',
//                 error: err.message
//             });
//         }

//         try {
//             const { username, lastName, bio } = req.body;
//             const updateData = {
//                 username: username || req.user.username,
//                 lastName: lastName || req.user.lastName,
//                 bio: bio || req.user.bio
//             };

//             // If a new hero image was uploaded, add it to the update data
//             if (req.file) {
//                 // Delete old hero image if it exists
//                 if (req.user.hero_image) {
//                     const oldImagePath = path.join(__dirname, '..', req.user.hero_image);
//                     if (fs.existsSync(oldImagePath)) {
//                         fs.unlinkSync(oldImagePath);
//                     }
//                 }
//                 updateData.hero_image = req.file.path;
//             }

//             const updatedUser = await User.findByIdAndUpdate(
//                 req.user._id,
//                 { $set: updateData },
//                 { new: true, select: 'username lastName email bio hero_image' }
//             );

//             if (!updatedUser) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'User not found'
//                 });
//             }

//             res.json({
//                 success: true,
//                 user: {
//                     email: updatedUser.email,
//                     username: updatedUser.username,
//                     lastName: updatedUser.lastName,
//                     bio: updatedUser.bio,
//                     hero_image: updatedUser.hero_image
//                 }
//             });
//         } catch (error) {
//             console.error('Error updating user profile:', error);
//             // Delete uploaded file if update fails
//             if (req.file) {
//                 fs.unlinkSync(req.file.path);
//             }
//             res.status(500).json({
//                 success: false,
//                 message: 'Error updating user profile'
//             });
//         }
//     });
// });

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Optionally: Save OTP to user document or a cache with expiry (not shown here)
    user.password = otp;
    //user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.password !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});


// Checkout Route
// router.post('/api/checkout', authenticate ,async (req, res) => {
// =======
//         console.error('Error updating user profile:', error);
//         res.status(500).json({ success: false, message: 'Error updating user profile' });
//     }
// });

// router.post("/api/checkout", authenticate, async (req, res) => {
//   try {
//     const { address, items, totals } = req.body;

//     if (!address || !items.length) {
//       return res
//         .status(400)
//         .json({ error: "Address and cart items are required" });
//     }

//     const user = await User.findById(req.user._id);

//     const newOrder = new Order({
//       User: user._id,
//       address,
//       items,
//       subtotal: totals.subtotal,
//       tax: totals.tax,
//       shipping: totals.shipping,
//       total: totals.total,
//       status: "Pending",
//       createdAt: new Date(),
//     });

//     await newOrder.save();

//     const shiprocketOrderPayload = {
//       order_id: newOrder._id.toString(),
//       order_date: new Date().toISOString().split("T")[0],
//       billing_customer_name: user.username,
//       billing_last_name: user.lastName || "",
//       billing_address: address,
//       billing_city: "Mumbai", // Ideally extract from address or form
//       billing_pincode: "400001", // Get from user form
//       billing_state: "Maharashtra",
//       billing_country: "India",
//       billing_email: user.email,
//       billing_phone: "9999999999", // Ideally collected from user

//       shipping_is_billing: true,
//       order_items: items.map((item) => ({
//         name: item.title,
//         sku: item.category,
//         units: item.quantity,
//         selling_price: item.price,
//       })),
//       payment_method: "Prepaid",
//       sub_total: totals.subtotal,
//       length: 10,
//       breadth: 10,
//       height: 10,
//       weight: 0.5,
//       pickup_location: user.pickup_locations?.[0] || "Primary Location",
//     };

//     console.log("Shiprocket Order Payload:", shiprocketOrderPayload);

//         const {
//             text,
//             city,
//             state,
//             pincode,
//             phone
//         } = address;

//         const shiprocketOrderPayload = {
//             order_id: newOrder._id.toString(),
//             order_date: new Date().toISOString().split('T')[0],
//             billing_customer_name: user.username,
//             billing_last_name: user.lastName || '',
//             billing_address: text,
//             billing_city: city,
//             billing_pincode: pincode,
//             billing_state: state,
//             billing_country: "India",
//             billing_email: user.email,
//             billing_phone: phone,
//             shipping_is_billing: true,
//             order_items: items.map(item => ({
//                 name: item.title,
//                 sku: item.category,
//                 units: item.quantity,
//                 selling_price: item.price
//             })),
//             payment_method: "Prepaid",
//             sub_total: totals.subtotal,
//             length: 10,
//             breadth: 10,
//             height: 10,
//             weight: 0.5,
//             pickup_location: user.pickup_locations?.[0] || "Primary Location"
//         };

//         console.log("Shiprocket Order Payload:", shiprocketOrderPayload);

//         const shiprocketRes = await createShiprocketOrder(shiprocketOrderPayload);
//         console.log("✅ Shiprocket response:", shiprocketRes);

//         res.status(201).json({
//             message: 'Order placed successfully!',
//             orderId: newOrder._id,
//             shiprocketOrder: shiprocketRes
//         });

//     } catch (error) {
//         console.error('Checkout error:', error?.response?.data || error.message || error);
//         res.status(500).json({ error: 'Something went wrong during checkout.' });
//     }
// });


// Create new order (Called after successful payment)
router.post("/api/orders", authenticate, async (req, res) => {
  try {
    const { items, shippingData, total, paymentStatus, paymentMethod } = req.body;

    const { mongoose } = require('mongoose');
    const newOrder = new Order({
      _id: new mongoose.Types.ObjectId(),
      userId: req.user._id,
      items: items.map(item => ({
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: total,
      tax: 0,
      shippingFee: 0,
      total: total,
      paymentStatus: paymentStatus || 'completed',
      paymentMethod: paymentMethod || 'card',
      shippingAddressSnapshot: shippingData,
      orderStatus: 'processing',
      createdAt: new Date()
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

// Get Latest Orders Route
router.post("/api/orders/latest", authenticate, async (req, res) => {
  try {
    // Fetch orders of the authenticated user, sorted by most recent first
    console.log(`[Orders] Fetching latest orders for user: ${req.user._id}`);
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Sort in descending order
      .limit(10); // Adjust limit as needed
    
    console.log(`[Orders] Found ${orders.length} latest orders`);

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching latest orders:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Get top 4 brand users
router.post("/api/user/top-brands", async (req, res) => {
  try {
    const brands = await User.find({ isBrand: true })
      .select("username bio hero_image")
      .limit(4);

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
router.post("/api/user/wishlist/add", authenticate, addToWishlist);

/**
 * POST /api/user/wishlist/remove
 * Remove product from wishlist
 */
router.post("/api/user/wishlist/remove", authenticate, removeFromWishlist);

/**
 * GET /api/user/wishlist
 * Get user's wishlist with pagination
 */
router.get("/api/user/wishlist", authenticate, getWishlist);

/**
 * GET /api/user/orders
 * Get user's order history
 */
router.get("/api/user/orders", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (status) {
      filter.orderStatus = status;
    }

    console.log(`[getUserOrders] Fetching orders for user: ${req.user._id}, filter:`, filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'name images price')
      .lean();

    console.log(`[getUserOrders] Found ${orders.length} orders`);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[getUserOrders] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

/**
 * GET /api/user/orders/stats
 * Get user's order statistics (total orders, total spend)
 */
router.get("/api/user/orders/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`[getUserOrderStats] Fetching stats for user: ${userId}`);

    // Get total orders count
    const totalOrders = await Order.countDocuments({ userId });
    console.log(`[getUserOrderStats] Total orders: ${totalOrders}`);

    // Calculate total spend (only completed orders)
    const completedOrders = await Order.find({
      userId,
      paymentStatus: 'completed'
    }).select('total');

    const totalSpend = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Get order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent orders (last 5)
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.productId', 'name images')
      .lean();

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpend,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentOrders
      }
    });
  } catch (error) {
    console.error('[getUserOrderStats] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/user/orders/:orderId
 * Get specific order details
 */
router.get("/api/user/orders/:orderId", authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id
    })
      .populate('items.productId', 'name images price brandName')
      .populate('shippingId')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('[getOrderDetails] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

/**
 * GET /api/user/addresses
 * Get all user addresses
 */
router.get("/api/user/addresses", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    console.error('[getAddresses] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses',
      error: error.message
    });
  }
});

/**
 * POST /api/user/addresses
 * Add a new address
 */
router.post("/api/user/addresses", authenticate, async (req, res) => {
  try {
    const { type, name, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !addressLine1 || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Add new address
    user.addresses.push({
      type: type || 'shipping',
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: isDefault || false
    });

    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('[addAddress] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: error.message
    });
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

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      type: type || user.addresses[addressIndex].type,
      name: name || user.addresses[addressIndex].name,
      phone: phone || user.addresses[addressIndex].phone,
      addressLine1: addressLine1 || user.addresses[addressIndex].addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : user.addresses[addressIndex].addressLine2,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      zipCode: zipCode || user.addresses[addressIndex].zipCode,
      country: country || user.addresses[addressIndex].country,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault
    };

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('[updateAddress] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
});

/**
 * DELETE /api/user/addresses/:addressId
 * Delete an address
 */
router.delete("/api/user/addresses/:addressId", authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('[deleteAddress] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
});

/**
 * PUT /api/user/addresses/:addressId/default
 * Set an address as default
 */
router.put("/api/user/addresses/:addressId/default", authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Unset all defaults
    user.addresses.forEach(addr => addr.isDefault = false);

    // Set the specified address as default
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses[addressIndex].isDefault = true;
    await user.save();

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('[setDefaultAddress] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
      error: error.message
    });
  }
});

module.exports = router;
