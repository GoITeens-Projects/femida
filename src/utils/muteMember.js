const Level = require("../models/Level");
const SettingsInterface = require("./settings");
const muteMember = async (member, reason) => {
  await member.timeout(
    settings.mute.muteTimeMs ? settings.mute.muteTimeMs : 1000 * 60 * 30,
    reason.toString()
  );
  const settings = await SettingsInterface.getSettings();
  switch (settings.warns.onMute) {
    case "remove-all-warns":
      await Level.findOneAndUpdate({ userId: member.id }, { warnings: 0 });
      break;
    case "remove-all-exept-one":
      const currentMember = await Level.findOne({ userId: member.id });
      await Level.findOneAndUpdate(
        { userId: member.id },
        {
          warnings: {
            amount: 1,
            history: [
              ...history,
              {
                date: new Date(),
                amount: -currentMember.warnings.amount + 1,
                reason: "Налаштування при муті",
              },
            ],
          },
        }
      );
      break;
    case "save-all":
      break;
    default:
      break;
  }
};
module.exports = muteMember;
