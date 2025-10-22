const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Design = require("../models/Design");
const User = require("../models/User");
const authenticate = require("../middleware/auth");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/designs";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).fields([
  { name: "image_1", maxCount: 1 },
  { name: "image_2", maxCount: 1 },
  { name: "image_3", maxCount: 1 },
  { name: "image_4", maxCount: 1 },
]);

const upload_design = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size (5MB per file)
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
}).array("images", 6);

// Get user's designs - Profile Route
router.get("/profile", authenticate, async (req, res) => {
  try {
    const designs = await Design.find({ designer: req.user._id })
      .populate("designer", "name email")
      .sort({ createdAt: -1 });
    console.log(designs)
    res.json({
      success: true,
      designs,
    });
  } catch (error) {
    console.error("Error fetching designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching designs",
    });
  }
});

// Get user's designs - Profile Route
router.get("/profile-2", async (req, res) => {
  try {
    const designs = await Design.find({ designer: req.query.id})
      .populate("designer", "name email")
      .sort({ createdAt: -1 });
    console.log(designs)
    res.json({
      success: true,
      designs,
    });
  } catch (error) {
    console.error("Error fetching designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching designs",
    });
  }
});

router.post("/latest-designs", async (req, res) => {
  console.log("des")
  try {
    // Find all users who have at least one design
    const designs = await Design.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$designer",
          design: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "design.designer",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          image_1: { $arrayElemAt: ["$design.images", 0] },
          username: "$user.name",
          // Instead of designId, return username again (or you can remove this line)
          // designId: "$design._id"
        }
      }
    ]);
   console.log(designs)
    res.json({
      success: true,
      count: designs.length,
      designs
    });
  } catch (error) {
    console.error("Error fetching latest designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest designs"
    });
  }
});

// Add design route with multiple image upload
router.post("/adddesign", authenticate, (req, res) => {
  upload_design(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files",
      });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded",
        });
      }

      const { title, description, price, category, isPublic, brand_upload, colab, discount, sizes } =
        req.body;

      if (!title || !price || !category) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
        return res.status(400).json({
          success: false,
          message: "Title, price, and category are required",
        });
      }

      const imagePaths = req.files.map((file) => file.path);

      const user = await User.findById(req.user._id);

      // Parse sizes if it's a JSON string or comma-separated string
      let parsedSizes = sizes;
      if (typeof sizes === "string") {
        try {
          parsedSizes = JSON.parse(sizes);
        } catch {
          parsedSizes = sizes.split(",").map(s => s.trim());
        }
      }

      const design = new Design({
        title,
        description,
        designer: req.user._id,
        price: parseFloat(price),
        discount: parseFloat(discount),
        category,
        images: imagePaths,
        isPublic: isPublic === "true",
        brand_upload,
        colabs: colab,
        pickup_location: user.pickup_location,
        pincode: user.pincode,
        sizes: parsedSizes
      });

      await design.save();

      res.status(201).json({
        success: true,
        message: "Design added successfully",
        design: {
          _id: design._id,
          title: design.title,
          description: design.description,
          price: design.price,
          discount: design.discount,
          category: design.category,
          images: design.images,
          isPublic: design.isPublic,
          sizes: design.sizes,
        },
      });
    } catch (error) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }

      console.error("Error adding design:", error);
      res.status(500).json({
        success: false,
        message: "Error adding design",
      });
    }
  });
});

router.get("/design/:id", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res
        .status(404)
        .json({ success: false, message: "Design not found" });
    }
    //console.log(req.user)
    res.json({
      _id: design._id,
      title: design.title,
      description: design.description,
      price: design.price,
      discount:design.discount,
      sizes:design.sizes,
      brand_upload: design.brand_upload,
      timestamp: design.timestamp,
      userLogin: design.designer == String(req.user._id) ? 1 : 0,
      image_1: design.image_1 || "",
      image_2: design.image_2 || "",
      image_3: design.image_3 || "",
      image_4: design.image_4 || "",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching design" });
  }
});
router.get("/design/:id/image/front", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || !design.images[0]) {
      return res.status(404).send("Image not found");
    }

    // Add proper content type header
    res.setHeader("Content-Type", "image/*");
    // Enable CORS if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    //console.log(path.resolve(design.images[0]))
    // Send the file
    res.sendFile(path.resolve(design.images[0]));
  } catch (error) {
    console.error("Error fetching front image:", error);
    res.status(500).send("Error fetching image");
  }
});

router.get("/design/:id/image/:position", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res
        .status(404)
        .json({ success: false, message: "Design not found" });
    }

    const position = req.params.position;
    const imageField = `image_${position}`;
    //console.log(design);
    let imagePath = path.join(__dirname, "..", design[imageField]);

    if (!design[imageField]) {
      return res.status(404).send("Image not found");
    }
    console.log(imagePath)
    if(imagePath == ""){
    // If the stored image is an SVG, return alternative images
    if (path.extname(design[imageField]) === ".svg") {
      if (position === "front" && design.images && design.images.length >= 2) {
        imagePath = path.join(__dirname, "..", design.images[1]); // 2nd image (index 1)
      } else if (
        position === "back" &&
        design.images &&
        design.images.length >= 3
      ) {
        imagePath = path.join(__dirname, "..", design[imageField]); // 3rd image (index 2)
      }
    }
   }

   
    console.log(imagePath)

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send("Image file not found");
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
});

// Get design image (back)
router.get("/design/:id/image/back", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || !design.images[1]) {
      return res.status(404).send("Image not found");
    }

    // Add proper content type header
    res.setHeader("Content-Type", "image/*");
    // Enable CORS if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Send the file
    res.sendFile(path.resolve(design.images[3]));
  } catch (error) {
    console.error("Error fetching back image:", error);
    res.status(500).send("Error fetching image");
  }
});

router.get("/design_png/:id/image/front", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || !design.images[0]) {
      return res.status(404).send("Image not found");
    }

    // Add proper content type header
    res.setHeader("Content-Type", "image/*");
    // Enable CORS if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    //console.log(path.resolve(design.images[0]))
    // Send the file
    res.sendFile(path.resolve(design.images[1]));
  } catch (error) {
    console.error("Error fetching front image:", error);
    res.status(500).send("Error fetching image");
  }
});

// Get design image (back)
router.get("/design_png/:id/image/back", authenticate, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design || !design.images[1]) {
      return res.status(404).send("Image not found");
    }

    // Add proper content type header
    res.setHeader("Content-Type", "image/*");
    // Enable CORS if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Send the file
    res.sendFile(path.resolve(design.images[2]));
  } catch (error) {
    console.error("Error fetching back image:", error);
    res.status(500).send("Error fetching image");
  }
});

// Get artifact/file from server by design ID
router.get("/artifacts/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the design by ID that contains this file
    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    // Check access permissions
    if (
      !design.isPublic &&
      design.designer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Construct file path
    const filePaths = design.images.map((image) =>
      path.join("uploads/designs", path.basename(image))
    );

    // Check if files exist
    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: `File not found: ${filePath}`,
        });
      }
    }

    // Send files
    // Note: For simplicity, sending only the first file found
    res.sendFile(path.resolve(filePaths[0]));
  } catch (error) {
    console.error("Error fetching artifact:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching file",
    });
  }
});

// Get top 25 public designs Todo later based on ratings get the list
router.get("/public", async (req, res) => {
  try {
    const brandedUsers = await User.find({ isBrand: true }).select("_id");
    const brandedUserIds = brandedUsers.map((user) => user._id);

    const publicDesigns = await Design.find({
      isPublic: true,
      designer: { $in: brandedUserIds },
    })
      .select("_id title category images price")
      .sort({ createdAt: -1 })
      .limit(25);

    const formattedDesigns = publicDesigns.map((design) => ({
      _id: design._id,
      title: design.title,
      category: design.category,
      price: design.price,
      imagePath1: design.images[0], // First image path
      imagePath2: design.images[1],
      description: design.description,
    }));

    res.json({
      success: true,
      count: formattedDesigns.length,
      designs: formattedDesigns,
    });
  } catch (error) {
    console.error("Error fetching public designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching public designs",
    });
  }
});

router.get("/publicBranded", async (req, res) => {
  try {
    // const brandedUsers = await User.find({ isBrand: false }).select('_id');
    // const brandedUserIds = brandedUsers.map(user => user._id);

    const publicDesigns = await Design.find({
      isPublic: true,
      brand_upload: true,
    })
      .select("_id title category images price discount designer pincode pickup_location sizes")
      .sort({ createdAt: -1 })
      .limit(25);

    const formattedDesigns = publicDesigns.map((design) => ({
      _id: design._id,
      designer:design.designer,
      title: design.title,
      category: design.category,
      price: design.price,
      discount:design.discount,
      imagePath1: design.images[0], // First image path
      imagePath2: design.images[1],
      description: design.description,
      sizes: design.sizes,
      pickup_location : design.pickup_location,
      pincode : design.pincode
    }));
   //console.log(formattedDesigns)
    res.json({
      success: true,
      count: formattedDesigns.length,
      designs: formattedDesigns,
    });
  } catch (error) {
    console.error("Error fetching public designs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching public designs",
    });
  }
});

// Edit design
router.post("/editdesign/:id", authenticate, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Error uploading files",
      });
    }

    try {
      const designId = req.params.id;
      const { title, description, price, category, isPublic, discount, sizes } = req.body;

      const design = await Design.findById(designId);

      if (!design) {
        return res.status(404).json({
          success: false,
          message: "Design not found",
        });
      }

      if (design.designer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to edit this design",
        });
      }

      // Parse sizes if it's a JSON string or comma-separated string
      let parsedSizes = sizes;
      if (typeof sizes === "string") {
        try {
          parsedSizes = JSON.parse(sizes);
        } catch {
          parsedSizes = sizes.split(",").map(s => s.trim());
        }
      }

      const updateFields = {
        title: title || design.title,
        description: description || design.description,
        price: price || design.price,
        discount: discount || design.discount,
        category: category || design.category,
        isPublic:
          isPublic === "true"
            ? true
            : isPublic === "false"
            ? false
            : design.isPublic,
        sizes: parsedSizes || design.sizes,
      };

      // Update images if new files are uploaded
      if (req.files) {
        // Process each image field
        const imageFields = ["image_1", "image_2", "image_3", "image_4"];

        for (const field of imageFields) {
          // Check if this field was uploaded
          if (req.files[field] && req.files[field][0]) {
            // Get the file path
            const filePath = req.files[field][0].path;

            // Delete the old image if it exists
            const oldImagePath = design[field];
            if (
              oldImagePath &&
              fs.existsSync(path.join(__dirname, "..", oldImagePath))
            ) {
              fs.unlinkSync(path.join(__dirname, "..", oldImagePath));
            }

            // Update the field with the new path
            // Make sure to store the relative path in the database
            updateFields[field] = filePath.replace(/\\/g, "/");
          }
        }
      }

      const updatedDesign = await Design.findByIdAndUpdate(
        designId,
        { $set: updateFields },
        { new: true }
      );

      res.json({
        success: true,
        message: "Design updated successfully",
        design: updatedDesign,
      });
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({
        success: false,
        message: "Error updating design",
      });
    }
  });
});

// Delete design
router.delete("/deletedesign/:id", authenticate, async (req, res) => {
  try {
    const designId = req.params.id;

    const design = await Design.findById(designId);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Design not found",
      });
    }

    if (design.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this design",
      });
    }

    for (const imagePath of design.images) {
      const fullPath = path.resolve(imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await Design.findByIdAndDelete(designId);

    res.json({
      success: true,
      message: "Design deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting design:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting design",
    });
  }
});

module.exports = router;
