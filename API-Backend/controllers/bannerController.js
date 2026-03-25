const Banner = require('../models/Banner');

/**
 * GET /api/banners
 * Get all active banners
 */
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('[getBanners] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/banners
 * Get all banners (admin)
 */
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('[getAllBanners] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/banners
 * Create a new banner
 */
exports.createBanner = async (req, res) => {
  try {
    const { image, title, buttonText, link, order, isActive } = req.body;

    if (!image || !title || !buttonText || !link) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: image, title, buttonText, link'
      });
    }

    const banner = new Banner({
      image,
      title,
      buttonText,
      link,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await banner.save();

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('[createBanner] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
      error: error.message
    });
  }
};

/**
 * PUT /api/admin/banners/:id
 * Update a banner
 */
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, title, buttonText, link, order, isActive } = req.body;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    if (image) banner.image = image;
    if (title) banner.title = title;
    if (buttonText) banner.buttonText = buttonText;
    if (link) banner.link = link;
    if (order !== undefined) banner.order = order;
    if (isActive !== undefined) banner.isActive = isActive;

    await banner.save();

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('[updateBanner] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/banners/:id
 * Delete a banner
 */
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('[deleteBanner] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
      error: error.message
    });
  }
};

/**
 * PUT /api/admin/banners/:id/toggle
 * Toggle banner active status
 */
exports.toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner
    });
  } catch (error) {
    console.error('[toggleBanner] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner',
      error: error.message
    });
  }
};
