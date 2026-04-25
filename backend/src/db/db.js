import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongo_uri = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD,
);

const connectDB = async () => {
  try {
    await mongoose.connect(mongo_uri);
    console.log("DB connected successfully 💗💗💗");
    // Drop old email unique index if it exists
    try {
      await mongoose.connection.collection("users").dropIndex("email_1");
      console.log("Dropped old email_1 index");
    } catch {
      // index doesn't exist, ignore
    }
  } catch (error) {
    console.error("unable to connect DB 💥💥💥", error.message);
    process.exit(1);
  }
};

export default connectDB;
