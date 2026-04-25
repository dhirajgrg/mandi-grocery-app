import { Schema, model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true },
);

const Settings = model("settings", settingsSchema);

export default Settings;
