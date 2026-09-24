import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Demo Merchants ──────────────────────────────────────────
  const testMerchant = await prisma.merchant.upsert({
    where: { apiKey: "sk_test_halalpay_demo_123" },
    update: {},
    create: {
      name: "Demo Merchant (Test)",
      apiKey: "sk_test_halalpay_demo_123",
      webhookUrl: "http://localhost:3001/webhooks",
      active: true,
    },
  });

  const bookStore = await prisma.merchant.upsert({
    where: { apiKey: "sk_test_bookstore_456" },
    update: {},
    create: {
      name: "Halal Book Store",
      apiKey: "sk_test_bookstore_456",
      webhookUrl: null,
      active: true,
    },
  });

  console.log(`  ✔ Merchant: ${testMerchant.name} (key: ${testMerchant.apiKey})`);
  console.log(`  ✔ Merchant: ${bookStore.name} (key: ${bookStore.apiKey})`);

  // ─── Sample PaymentMethods + Transactions ────────────────────

  // 1. Card payment (success)
  const cardPM = await prisma.paymentMethod.create({
    data: {
      merchantId: testMerchant.id,
      type: "card",
      cardLast4: "4242",
      cardBrand: "visa",
      cardExpiry: "1228",
      billingName: "Ahmed Khan",
    },
  });

  const tx1 = await prisma.transaction.create({
    data: {
      merchantId: testMerchant.id,
      paymentMethodId: cardPM.id,
      amount: 49.99,
      currency: "USD",
      status: "success",
      gateway: "card",
      mccCode: "5411",
      description: "Sample grocery purchase",
      message: "Approved",
      gatewayRef: "card_seed_001",
    },
  });

  // 2. bKash payment (success)
  const bkashPM = await prisma.paymentMethod.create({
    data: {
      merchantId: testMerchant.id,
      type: "bkash",
      mobileNumber: "01712345678",
      accountType: "personal",
      billingName: "Rahim Uddin",
    },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      merchantId: testMerchant.id,
      paymentMethodId: bkashPM.id,
      amount: 18.99,
      currency: "USD",
      status: "success",
      gateway: "bkash",
      mccCode: "5411",
      description: "Book purchase via bKash",
      message: "Approved",
      gatewayRef: "bkash_seed_001",
    },
  });

  // 3. Nagad payment (rejected — compliance)
  const nagadPM = await prisma.paymentMethod.create({
    data: {
      merchantId: testMerchant.id,
      type: "nagad",
      mobileNumber: "01898765432",
      accountType: "personal",
      billingName: "Test User",
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      merchantId: testMerchant.id,
      paymentMethodId: nagadPM.id,
      amount: 120.00,
      currency: "USD",
      status: "rejected",
      gateway: "nagad",
      mccCode: "7995",
      description: "Blocked gambling transaction",
      message: "Compliance rejected: MCC 7995",
    },
  });

  console.log(`  ✔ Transaction: ${tx1.id} (card / ${tx1.status})`);
  console.log(`  ✔ Transaction: ${tx2.id} (bkash / ${tx2.status})`);
  console.log(`  ✔ Transaction: ${tx3.id} (nagad / ${tx3.status})`);

  // ─── Product Catalog ─────────────────────────────────────────
  console.log("\n🛒 Seeding product catalog...");

  // Clear old products (and their cart items)
  await prisma.cartItem.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("  ✔ Cleared existing products");

  const products = [
    // ── Grocery ──
    { name: "Organic Whole Milk (1 Gallon)", description: "USDA certified organic whole milk. Pasture-raised, no antibiotics or hormones.", price: 5.99, currency: "USD", category: "grocery", brand: "Horizon", stock: 300, rating: 4.5, reviewCount: 412, mccCode: "5411", tags: "milk,dairy,organic,drink,protein", imageUrl: "https://placehold.co/400x400/f3e5f5/7B1FA2?text=Organic+Milk" },
    { name: "Avocados (6 Count Bag)", description: "Ripe Hass avocados from California. Perfect for guacamole or toast.", price: 4.49, currency: "USD", category: "grocery", brand: "Mission", stock: 200, rating: 4.3, reviewCount: 287, mccCode: "5411", tags: "avocado,fruit,fresh,produce", imageUrl: "https://placehold.co/400x400/e8f5e9/2E7D32?text=Avocados" },
    { name: "Extra Virgin Olive Oil (1L)", description: "Cold-pressed Italian extra virgin olive oil. Rich flavor for cooking and salads.", price: 12.99, currency: "USD", category: "grocery", brand: "Bertolli", stock: 150, rating: 4.7, reviewCount: 534, mccCode: "5411", tags: "oil,olive,cooking,italian,kitchen", imageUrl: "https://placehold.co/400x400/fff9c4/F57F17?text=Olive+Oil" },
    { name: "Free-Range Eggs (18 Count)", description: "Cage-free, free-range large brown eggs. Rich in protein and Omega-3.", price: 6.29, currency: "USD", category: "grocery", brand: "Vital Farms", stock: 400, rating: 4.4, reviewCount: 201, mccCode: "5411", tags: "eggs,protein,breakfast,free-range", imageUrl: "https://placehold.co/400x400/fce4ec/C62828?text=Free+Range+Eggs" },
    { name: "Organic Green Tea (100 Bags)", description: "Premium Japanese-style green tea bags. Antioxidant-rich and refreshing.", price: 8.49, currency: "USD", category: "grocery", brand: "Bigelow", stock: 180, rating: 4.6, reviewCount: 356, mccCode: "5411", tags: "tea,green-tea,organic,beverage,drink", imageUrl: "https://placehold.co/400x400/efebe9/4E342E?text=Green+Tea" },
    { name: "Wild-Caught Salmon Fillets (1 lb)", description: "Fresh Atlantic salmon fillets. Sustainably sourced, rich in Omega-3.", price: 14.99, currency: "USD", category: "grocery", brand: "Whole Foods", stock: 60, rating: 4.8, reviewCount: 189, mccCode: "5411", tags: "fish,salmon,protein,fresh,seafood", imageUrl: "https://placehold.co/400x400/e0f2f1/00695C?text=Salmon+Fillets" },
    { name: "Sparkling Water Variety Pack (24 Cans)", description: "Naturally flavored sparkling water. Zero calories, zero sweeteners.", price: 9.99, currency: "USD", category: "grocery", brand: "LaCroix", stock: 250, rating: 4.2, reviewCount: 678, mccCode: "5411", tags: "water,sparkling,drink,beverage,zero-calorie", imageUrl: "https://placehold.co/400x400/e3f2fd/1565C0?text=Sparkling+Water" },
    { name: "Almond Butter (16 oz)", description: "Creamy roasted almond butter. No palm oil, no added sugar.", price: 10.49, currency: "USD", category: "grocery", brand: "Justin's", stock: 120, rating: 4.5, reviewCount: 321, mccCode: "5411", tags: "almond,butter,spread,snack,healthy", imageUrl: "https://placehold.co/400x400/fff3e0/E65100?text=Almond+Butter" },

    // ── Electronics ──
    { name: "Apple iPhone 16 (128GB)", description: "6.1\" Super Retina XDR display, A18 chip, 48MP camera system, USB-C.", price: 799.00, currency: "USD", category: "electronics", brand: "Apple", stock: 40, rating: 4.7, reviewCount: 1240, mccCode: "5732", tags: "phone,smartphone,apple,iphone", imageUrl: "https://placehold.co/400x400/fff3e0/FF6F00?text=iPhone+16" },
    { name: "Apple iPhone 16 Pro Max (256GB)", description: "6.9\" Super Retina XDR, A18 Pro chip, 48MP triple camera, titanium design.", price: 1199.00, currency: "USD", category: "electronics", brand: "Apple", stock: 25, rating: 4.8, reviewCount: 890, mccCode: "5732", tags: "phone,smartphone,apple,iphone,pro", imageUrl: "https://placehold.co/400x400/1a1a1a/FFFFFF?text=iPhone+16+Pro" },
    { name: "Samsung Galaxy S24 Ultra (256GB)", description: "6.8\" QHD+ AMOLED, Snapdragon 8 Gen 3, 200MP camera, S Pen included.", price: 1299.99, currency: "USD", category: "electronics", brand: "Samsung", stock: 30, rating: 4.6, reviewCount: 567, mccCode: "5732", tags: "phone,smartphone,samsung,galaxy,android", imageUrl: "https://placehold.co/400x400/e8eaf6/283593?text=Galaxy+S24" },
    { name: "Google Pixel 9 Pro (128GB)", description: "6.3\" LTPO OLED, Tensor G4 chip, 50MP triple camera, 7 years of updates.", price: 999.00, currency: "USD", category: "electronics", brand: "Google", stock: 35, rating: 4.5, reviewCount: 342, mccCode: "5732", tags: "phone,smartphone,google,pixel,android", imageUrl: "https://placehold.co/400x400/e3f2fd/1565C0?text=Pixel+9+Pro" },
    { name: "Apple AirPods Pro (2nd Gen)", description: "Active noise cancellation, adaptive audio, USB-C charging case.", price: 249.00, currency: "USD", category: "electronics", brand: "Apple", stock: 100, rating: 4.7, reviewCount: 2340, mccCode: "5732", tags: "airpods,earbuds,wireless,audio,apple", imageUrl: "https://placehold.co/400x400/fafafa/37474F?text=AirPods+Pro" },
    { name: "Apple MacBook Air M3 (13\")", description: "M3 chip, 8GB RAM, 256GB SSD, 18-hour battery life, Liquid Retina display.", price: 1099.00, currency: "USD", category: "electronics", brand: "Apple", stock: 20, rating: 4.8, reviewCount: 678, mccCode: "5732", tags: "laptop,macbook,apple,computer", imageUrl: "https://placehold.co/400x400/e0e0e0/424242?text=MacBook+Air" },

    // ── Clothing ──
    { name: "Nike Dri-FIT Running T-Shirt", description: "Lightweight moisture-wicking tee. Perfect for workouts and casual wear.", price: 35.00, currency: "USD", category: "clothing", brand: "Nike", stock: 150, rating: 4.3, reviewCount: 456, mccCode: "5651", tags: "tshirt,athletic,running,men,nike", imageUrl: "https://placehold.co/400x400/fff9c4/F9A825?text=Nike+Tee" },
    { name: "Levi's 501 Original Fit Jeans", description: "Classic straight-leg jeans. 100% cotton denim, button fly.", price: 69.50, currency: "USD", category: "clothing", brand: "Levi's", stock: 80, rating: 4.5, reviewCount: 1890, mccCode: "5651", tags: "jeans,denim,casual,men,levis", imageUrl: "https://placehold.co/400x400/e3f2fd/1565C0?text=Levi+501" },
    { name: "Nike Air Max 270 (Men)", description: "Max Air unit for all-day comfort. Mesh upper for breathability.", price: 150.00, currency: "USD", category: "clothing", brand: "Nike", stock: 70, rating: 4.4, reviewCount: 780, mccCode: "5651", tags: "shoes,sneakers,nike,footwear,men", imageUrl: "https://placehold.co/400x400/e0e0e0/424242?text=Air+Max+270" },

    // ── Books ──
    { name: "Learn Python Programming", description: "Complete Python guide from basics to advanced. 450+ pages with exercises.", price: 39.99, currency: "USD", category: "books", brand: "O'Reilly", stock: 55, rating: 4.5, reviewCount: 189, mccCode: "5942", tags: "programming,python,education,tech", imageUrl: "https://placehold.co/400x400/e3f2fd/0D47A1?text=Python+Book" },
    { name: "Atomic Habits", description: "James Clear's bestselling book on habit formation and personal growth.", price: 18.99, currency: "USD", category: "books", brand: "Penguin", stock: 80, rating: 4.8, reviewCount: 1023, mccCode: "5942", tags: "self-help,habits,personal-growth", imageUrl: "https://placehold.co/400x400/fff3e0/FF6F00?text=Atomic+Habits" },
    { name: "The 7 Habits of Highly Effective People", description: "Stephen Covey's classic on leadership and personal effectiveness.", price: 16.99, currency: "USD", category: "books", brand: "Simon & Schuster", stock: 60, rating: 4.7, reviewCount: 890, mccCode: "5942", tags: "self-help,leadership,personal-growth", imageUrl: "https://placehold.co/400x400/fff8e1/FF8F00?text=7+Habits" },
    { name: "Mindset: The New Psychology of Success", description: "Carol Dweck's influential book on growth mindset and achieving potential.", price: 14.99, currency: "USD", category: "books", brand: "Random House", stock: 75, rating: 4.6, reviewCount: 765, mccCode: "5942", tags: "self-help,mindset,personal-growth", imageUrl: "https://placehold.co/400x400/fff8e1/FF8F00?text=Mindset" },
    { name: "Clean Code: A Handbook of Agile Software", description: "Robert C. Martin's essential guide to writing clean, maintainable code.", price: 42.99, currency: "USD", category: "books", brand: "Pearson", stock: 45, rating: 4.6, reviewCount: 2340, mccCode: "5942", tags: "programming,software,engineering,tech", imageUrl: "https://placehold.co/400x400/e8eaf6/283593?text=Clean+Code" },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`  ✔ Seeded ${products.length} products across ${[...new Set(products.map(p => p.category))].join(", ")}`);

  console.log("\n✅ Seeding complete!\n");
  console.log("Use this header to test the v1 API:");
  console.log(`  Authorization: Bearer ${testMerchant.apiKey}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
