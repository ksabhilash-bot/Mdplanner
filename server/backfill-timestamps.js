import "dotenv/config.js"; // load .env variables
import connectToDb from "./src/config/db.js";
import User from "./src/models/User.js";
import Food from "./src/models/Food.js";
import Profile from "./src/models/Profile.js";

const backfillTimestamps = async () => {
  try {
    await connectToDb(); // ✅ reuse your existing DB connection logic
    console.log("✅ Connected to DB");

    const now = new Date();

    const [usersUpdated, foodsUpdated, profilesUpdated] = await Promise.all([
      User.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: now, updatedAt: now } }
      ),
      Food.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: now, updatedAt: now } }
      ),
      Profile.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: now, updatedAt: now } }
      ),
    ]);

    console.log(`✅ Users updated: ${usersUpdated.modifiedCount}`);
    console.log(`✅ Foods updated: ${foodsUpdated.modifiedCount}`);
    console.log(`✅ Profiles updated: ${profilesUpdated.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error backfilling timestamps:", error);
    process.exit(1);
  }
};

backfillTimestamps();
