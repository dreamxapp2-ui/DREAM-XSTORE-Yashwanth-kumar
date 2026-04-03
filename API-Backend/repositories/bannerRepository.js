const Banner = require('../models/Banner');
const prisma = require('../lib/prisma');
const {
  canUseMongoFallback,
  canUsePostgres,
  runPostgres: sharedRunPostgres,
} = require('../lib/dbHelpers');

function normalizeBanner(record) {
  if (!record) {
    return null;
  }

  const banner = typeof record.toObject === 'function' ? record.toObject() : { ...record };
  const bannerId = banner.id || banner._id?.toString();

  return {
    ...banner,
    id: bannerId,
    _id: banner._id || bannerId,
    order: banner.order ?? banner.sortOrder ?? 0,
  };
}

function toPrismaPayload(payload) {
  return {
    image: payload.image,
    title: payload.title,
    buttonText: payload.buttonText,
    link: payload.link,
    sortOrder: payload.order ?? 0,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
  };
}

async function runPostgres(operationName, operation) {
  return sharedRunPostgres(`bannerRepo.${operationName}`, operation);
}

async function getBanners() {
  const postgresBanners = await runPostgres('read active banners', () =>
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  );

  if (postgresBanners && postgresBanners.length > 0) {
    return postgresBanners.map(normalizeBanner);
  }

  if (!canUseMongoFallback()) {
    return postgresBanners ? postgresBanners.map(normalizeBanner) : [];
  }

  const mongoBanners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();

  return mongoBanners.map(normalizeBanner);
}

async function getAllBanners() {
  const postgresBanners = await runPostgres('read all banners', () =>
    prisma.banner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  );

  if (postgresBanners && postgresBanners.length > 0) {
    return postgresBanners.map(normalizeBanner);
  }

  if (!canUseMongoFallback()) {
    return postgresBanners ? postgresBanners.map(normalizeBanner) : [];
  }

  const mongoBanners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();

  return mongoBanners.map(normalizeBanner);
}

async function createBanner(payload) {
  const postgresBanner = await runPostgres('create banner', () =>
    prisma.banner.create({
      data: toPrismaPayload(payload),
    })
  );

  if (postgresBanner) {
    return normalizeBanner(postgresBanner);
  }

  const mongoBanner = await Banner.create({
    image: payload.image,
    title: payload.title,
    buttonText: payload.buttonText,
    link: payload.link,
    order: payload.order ?? 0,
    isActive: payload.isActive !== undefined ? payload.isActive : true,
  });

  return normalizeBanner(mongoBanner);
}

async function updateBanner(id, payload) {
  const postgresUpdateData = {};

  if (payload.image !== undefined) postgresUpdateData.image = payload.image;
  if (payload.title !== undefined) postgresUpdateData.title = payload.title;
  if (payload.buttonText !== undefined) postgresUpdateData.buttonText = payload.buttonText;
  if (payload.link !== undefined) postgresUpdateData.link = payload.link;
  if (payload.order !== undefined) postgresUpdateData.sortOrder = payload.order;
  if (payload.isActive !== undefined) postgresUpdateData.isActive = payload.isActive;

  const postgresBanner = await runPostgres('update banner', async () => {
    const existingBanner = await prisma.banner.findUnique({ where: { id } });

    if (!existingBanner) {
      return null;
    }

    return prisma.banner.update({
      where: { id },
      data: postgresUpdateData,
    });
  });

  if (postgresBanner) {
    return normalizeBanner(postgresBanner);
  }

  const mongoBanner = await Banner.findById(id);

  if (!mongoBanner) {
    return null;
  }

  if (payload.image !== undefined) mongoBanner.image = payload.image;
  if (payload.title !== undefined) mongoBanner.title = payload.title;
  if (payload.buttonText !== undefined) mongoBanner.buttonText = payload.buttonText;
  if (payload.link !== undefined) mongoBanner.link = payload.link;
  if (payload.order !== undefined) mongoBanner.order = payload.order;
  if (payload.isActive !== undefined) mongoBanner.isActive = payload.isActive;

  await mongoBanner.save();
  return normalizeBanner(mongoBanner);
}

async function deleteBanner(id) {
  const postgresDeleted = await runPostgres('delete banner', async () => {
    const existingBanner = await prisma.banner.findUnique({ where: { id } });

    if (!existingBanner) {
      return null;
    }

    return prisma.banner.delete({ where: { id } });
  });

  if (postgresDeleted) {
    return true;
  }

  const mongoBanner = await Banner.findByIdAndDelete(id);
  return Boolean(mongoBanner);
}

async function toggleBanner(id) {
  const postgresBanner = await runPostgres('toggle banner', async () => {
    const existingBanner = await prisma.banner.findUnique({ where: { id } });

    if (!existingBanner) {
      return null;
    }

    return prisma.banner.update({
      where: { id },
      data: { isActive: !existingBanner.isActive },
    });
  });

  if (postgresBanner) {
    return normalizeBanner(postgresBanner);
  }

  const mongoBanner = await Banner.findById(id);

  if (!mongoBanner) {
    return null;
  }

  mongoBanner.isActive = !mongoBanner.isActive;
  await mongoBanner.save();

  return normalizeBanner(mongoBanner);
}

module.exports = {
  createBanner,
  deleteBanner,
  getAllBanners,
  getBanners,
  toggleBanner,
  updateBanner,
};