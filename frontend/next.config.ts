import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

// Automagic Asset Copier
const srcDir = `C:\\Users\\INSPIRED TECH\\.gemini\\antigravity\\brain\\c185ad6c-f589-4cd5-ace9-1281f834bd9f`;
const destDir = `C:\\Users\\INSPIRED TECH\\all-file\\ecomarche website\\frontend\\public\\images`;

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileMap = {
    "hero_banner_1779002231970.png": "hero_banner.png",
    "promo_accessories_1779002250363.png": "promo_accessories.png",
    "promo_essentials_1779002268969.png": "promo_essentials.png",
    "collection_banner_1779002286033.png": "collection_banner.png",
    "cat_women_1779002304389.png": "cat_women.png",
    "cat_men_1779002323238.png": "cat_men.png",
    "cat_accessories_1779002342538.png": "cat_accessories.png",
    "cat_kids_1779002362792.png": "cat_kids.png",
    "cat_kurti_1779002380618.png": "cat_kurti.png",
    "cat_saree_1779002399385.png": "cat_saree.png",
    "cat_tshirt_1779002418436.png": "cat_tshirt.png",
    "cat_winter_1779002441953.png": "cat_winter.png",
    "prod_jacket_1779002460043.png": "prod_jacket.png",
    "prod_handbag_1779002478539.png": "prod_handbag.png",
    "prod_hoodie_1779002495718.png": "prod_hoodie.png",
    "prod_dress_1779002514014.png": "prod_dress.png",
    "avatar_female_1_1779002532963.png": "avatar_female_1.png"
  };

  Object.entries(fileMap).forEach(([srcName, destName]) => {
    const srcPath = path.join(srcDir, srcName);
    const destPath = path.join(destDir, destName);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`[Asset Copier] Copied ${srcName} -> ${destName}`);
    }
  });
} catch (e) {
  console.error("[Asset Copier Error]", e);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
      },
    ],
  },
};

export default nextConfig;
