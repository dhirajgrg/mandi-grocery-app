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
  } catch (error) {
    console.error("unable to connect DB 💥💥💥", error.message);
    process.exit(1);
  }
};

export default connectDB;
