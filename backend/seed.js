import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongo_uri = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD,
);

// Map DummyJSON tags to grocery categories + assign sensible units
const tagToCategoryMap = {
  fruits: "Fruits",
  vegetables: "Vegetables",
  meat: "Meat & Poultry",
  seafood: "Seafood",
  dairy: "Dairy",
  beverages: "Beverages",
  "pet supplies": "Pet Supplies",
  "cooking essentials": "Oils & Ghee",
  grains: "Grains & Rice",
  "health supplements": "Health & Supplements",
  condiments: "Breakfast & Spreads",
  desserts: "Snacks & Packaged Food",
  "household essentials": "Household",
  coffee: "Beverages",
};

const categoryUnitMap = {
  Fruits: "kg",
  Vegetables: "kg",
  "Meat & Poultry": "kg",
  Seafood: "kg",
  Dairy: "pack",
  Beverages: "pack",
  "Pet Supplies": "pack",
  "Oils & Ghee": "liter",
  "Grains & Rice": "kg",
  "Health & Supplements": "pack",
  "Breakfast & Spreads": "pack",
  "Snacks & Packaged Food": "pack",
  Household: "pack",
};

function mapCategory(tags) {
  for (const tag of tags || []) {
    if (tagToCategoryMap[tag]) return tagToCategoryMap[tag];
  }
  return "Groceries";
}

async function seed() {
  try {
    await mongoose.connect(mongo_uri);
    console.log("DB connected for seeding");

    // Fetch grocery products from DummyJSON
    const res = await fetch(
      "https://dummyjson.com/products/category/groceries?limit=30",
    );
    const data = await res.json();
    const apiProducts = data.products;

    console.log(`Fetched ${apiProducts.length} products from DummyJSON`);

    // Transform to our schema
    const groceryItems = apiProducts.map((p) => {
      const category = mapCategory(p.tags);
      return {
        name: p.title,
        description: p.description,
        price: Math.round(p.price * 80), // Convert USD→NPR rough estimate
        discount: Math.round(p.discountPercentage) || 0,
        category,
        brand: "",
        images: p.images || [],
        unit: categoryUnitMap[category] || "pack",
        stockQuantity: p.stock || 50,
        isOrganic: (p.tags || []).some((t) =>
          ["fruits", "vegetables"].includes(t),
        ),
        isFresh: (p.tags || []).some((t) =>
          ["fruits", "vegetables", "meat", "seafood", "dairy"].includes(t),
        ),
        isAvailable: true,
      };
    });

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("Cleared existing products and categories");

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(groceryItems.map((item) => item.category)),
    ];
    const categoryDocs = await Category.insertMany(
      uniqueCategories.map((name) => ({ name })),
    );
    console.log(`Seeded ${categoryDocs.length} categories`);

    const inserted = await Product.insertMany(groceryItems);
    console.log(`Seeded ${inserted.length} grocery items with images`);
  } catch (err) {
    console.error("Seeding failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("DB disconnected");
  }
}

seed();
