import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resume: { type: String },
  resumeText: { type: String },
  image: { type: String, required: true },
  headline: { type: String, default: "" },      
  portfolio: { type: String, default: "" },     
  skills: { type: Array, default: [] },        
  location: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema);

export default User;