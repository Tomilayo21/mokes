import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  logoUrl: { type: String, required: true },
  siteTitle: String,
  siteDescription: String,
  supportEmail: String,
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
