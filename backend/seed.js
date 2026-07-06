const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const FoundItem = require("./models/FoundItem");
const LostItem = require("./models/LostItem");
const Claim = require("./models/Claim");

dotenv.config({ path: path.join(__dirname, ".env") });

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is missing. Add it to your .env file before running the seed script.");
  process.exit(1);
}

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@lostfound.local",
    password: "Admin@1234",
    phone: "9990001111",
    role: "admin",
  },
  {
    name: "John Carter",
    email: "john.carter@example.com",
    password: "Password@123",
    phone: "9876543210",
    role: "user",
  },
  {
    name: "Aisha Khan",
    email: "aisha.khan@example.com",
    password: "Password@123",
    phone: "9123456780",
    role: "user",
  },
  {
    name: "Meera Singh",
    email: "meera.singh@example.com",
    password: "Password@123",
    phone: "9012345678",
    role: "user",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(mongoUri);

    await Promise.all([
      User.deleteMany({}),
      FoundItem.deleteMany({}),
      LostItem.deleteMany({}),
      Claim.deleteMany({}),
    ]);

    const hashedPasswords = await Promise.all(
      seedUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    const insertedUsers = await User.insertMany(hashedPasswords);

    const adminUser = insertedUsers.find((user) => user.role === "admin");
    const johnUser = insertedUsers.find((user) => user.email === "john.carter@example.com");
    const aishaUser = insertedUsers.find((user) => user.email === "aisha.khan@example.com");
    const meeraUser = insertedUsers.find((user) => user.email === "meera.singh@example.com");

    const foundItems = [
      {
        postedBy: adminUser._id,
        category: "Wallet",
        description: "Brown leather wallet found near the library entrance. Contains a metro card and student ID holder.",
        location: "Library",
        dateFound: new Date("2026-07-01"),
        imageUrl: "https://images.unsplash.com/photo-1589756823695-278bc923f962?auto=format&fit=crop&w=1200&q=80",
        verificationQuestion: "What item is inside the wallet?",
        verificationAnswer: "metro card",
        status: "open",
      },
      {
        postedBy: aishaUser._id,
        category: "Backpack",
        description: "Blue backpack with a laptop sleeve and a red keychain, found in the cafeteria.",
        location: "Cafeteria",
        dateFound: new Date("2026-07-02"),
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
        verificationQuestion: "What color is the keychain?",
        verificationAnswer: "red",
        status: "claimed",
      },
      {
        postedBy: meeraUser._id,
        category: "Phone",
        description: "Black smartphone with a cracked corner on the back, found near the main gate.",
        location: "Main Gate",
        dateFound: new Date("2026-07-03"),
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
        verificationQuestion: "What is the lock screen wallpaper?",
        verificationAnswer: "mountains",
        status: "open",
      },
    ];

    const lostItems = [
      {
        postedBy: johnUser._id,
        category: "Wallet",
        description: "Lost a brown leather wallet with my student ID and metro card inside near the library.",
        location: "Library",
        dateLost: new Date("2026-06-30"),
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80",
        status: "resolved",
      },
      {
        postedBy: aishaUser._id,
        category: "Backpack",
        description: "Blue backpack with a laptop and a red keychain misplaced in the cafeteria.",
        location: "Cafeteria",
        dateLost: new Date("2026-07-01"),
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        status: "open",
      },
      {
        postedBy: meeraUser._id,
        category: "Phone",
        description: "Black phone with a cracked corner on the back and mountains wallpaper.",
        location: "Main Gate",
        dateLost: new Date("2026-07-03"),
        imageUrl: "https://images.unsplash.com/photo-1512499617640-c74ae5b5ac5b?auto=format&fit=crop&w=1200&q=80",
        status: "open",
      },
    ];

    const insertedFoundItems = await FoundItem.insertMany(foundItems);
    const insertedLostItems = await LostItem.insertMany(lostItems);

    const walletFoundItem = insertedFoundItems.find((item) => item.category === "Wallet");
    const backpackFoundItem = insertedFoundItems.find((item) => item.category === "Backpack");
    const phoneFoundItem = insertedFoundItems.find((item) => item.category === "Phone");

    const walletLostItem = insertedLostItems.find((item) => item.category === "Wallet");
    const backpackLostItem = insertedLostItems.find((item) => item.category === "Backpack");
    const phoneLostItem = insertedLostItems.find((item) => item.category === "Phone");

    const claims = [
      {
        foundItem: walletFoundItem._id,
        lostItem: walletLostItem._id,
        claimedBy: johnUser._id,
        submittedAnswer: "metro card",
        similarityScore: 0.86,
        confidence: "high",
        status: "pending",
      },
      {
        foundItem: backpackFoundItem._id,
        lostItem: backpackLostItem._id,
        claimedBy: aishaUser._id,
        submittedAnswer: "red",
        similarityScore: 0.92,
        confidence: "high",
        status: "approved",
      },
      {
        foundItem: phoneFoundItem._id,
        lostItem: phoneLostItem._id,
        claimedBy: meeraUser._id,
        submittedAnswer: "city skyline",
        similarityScore: 0.18,
        confidence: "low",
        status: "rejected",
      },
    ];

    await Claim.insertMany(claims);

    await LostItem.updateOne({ _id: walletLostItem._id }, { status: "resolved" });
    await LostItem.updateOne({ _id: backpackLostItem._id }, { status: "open" });
    await LostItem.updateOne({ _id: phoneLostItem._id }, { status: "open" });

    console.log("Seed completed successfully.");
    console.log(`Users inserted: ${insertedUsers.length}`);
    console.log(`Found items inserted: ${insertedFoundItems.length}`);
    console.log(`Lost items inserted: ${insertedLostItems.length}`);
    console.log(`Claims inserted: ${claims.length}`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();