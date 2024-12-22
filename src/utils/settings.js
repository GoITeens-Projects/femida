const NodeCache = require("node-cache");
const settingsCache = new NodeCache({ stdTTL: 600 });
const Settings = require("../models/Settings");

class SettingsInterface {
  async getSettings() {
    const cachedSettings = settingsCache.get("sets");
    if (!cachedSettings) {
      const currentSettings = await Settings.findOne({});
      return currentSettings;
    }
    return cachedSettings;
  }
  async setSettings(settingsObj) {
    // console.log("new", settingsObj);
    settingsCache.set("sets", settingsObj);
    const currentSettings = await Settings.findOne({});
    if (!currentSettings) {
      const createdSettings = new Settings();
      await createdSettings.save();
    }
    const newSettings = await Settings.findOneAndUpdate(
      {},
      { ...settingsObj },
      { new: true }
    );
    console.log(newSettings);
  }
}

module.exports = new SettingsInterface();
