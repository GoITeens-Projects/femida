const SettingsInterface = require("../../utils/settings");
const PhishingInterface = require("../../utils/isPhishingURL");
const urlRegex = /(?:https?:\/\/[^\s]+|\[[^\]]+\]\((https?:\/\/[^\s]+)\))/g;
const phishingRegex =
  /^(https?:\/\/)?(www\.)?((\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9-]+\.(?!com|net|org|edu|gov|io|cz|sk)[a-zA-Z]+)(\/|$)/;
const redirectionRegex =
  /(redirect|url|next|goto|out|forward)=https?:\/\/[^\s&]+/i;
const {
  roles: { adminRoles },
} = require("../../constants/config");
const phishUrls = [
  "surl.li",
  "bit.ly",
  "goo.gl",
  "t1p.de",
  "Is.gd",
  "tinyurl.com",
  ".ly",
  "bit.do",
  "su.pr",
  "rb.gy",
  "u.to",
  "is.gd",
];

module.exports = async (message) => {
  const settings = await SettingsInterface.getSettings();
  // console.log(settings.scamLinks);
  if (!settings.scamLinks.enabled) return;

  const member = message.guild.members.cache.get(message.author.id);

  //? Do not check links by admins
  if (adminRoles.some((role) => member.roles.cache.has(role))) return;

  const content = message.content;

  const matches = [...content.matchAll(urlRegex)];

  const punishUser = async (reason) => {
    if (settings.scamLinks.actions.mute.enabled) {
      await message.guild.members.cache
        .get(message.author.id)
        .timeout(settings.scamLinks.actions.mute.muteTimeMs, reason);
    }
    if (settings.scamLinks.actions.deleteMsg) {
      await message.delete();
    }
    if (settings.scamLinks.actions.notifyUser.enabled) {
      await message.channel.send(
        `<@${message.author.id}>, не відправляй фішинг посилань!`
      );
    }
  };

  if (matches.length > 0) {
    for (const match of matches) {
      const url = match[1] || match[0];
      if (url.startsWith("https://discord.gg")) {
        const guildFromInvite = (
          await message.client.fetchInvite(
            url.replace("https://discord.gg/", "")
          )
        )?.guild;

        if (
          !guildFromInvite ||
          (guildFromInvite.id !== "953708116611051600" &&
            guildFromInvite.id !== "1240710842006110260")
        ) {
          await message.delete();
          await message.channel.send(
            "❗Посилання на інші Discord сервери заборонено"
          );
          break;
        }
        continue;
      }
      if (
        settings.scamLinks.targetLinks.some((scamLink) =>
          url.includes(scamLink)
        )
      ) {
        await punishUser(
          "Публікація підозрілих посилань в чат (посилання внесено в список підозрілих адміністраторами)"
        );
        return;
      }
      if (
        settings.scamLinks.exceptions?.some((safeLink) =>
          url.startsWith(safeLink)
        )
      ) {
        console.log("This is safe link. Admins think so");
        continue;
      }
      const {
        passed,
        message: m,
        cached,
      } = await PhishingInterface.isPhishingUrl(url);
      if (!passed) {
        console.log(m);
        await punishUser(m);
        return;
      }
      console.log(`It's secure ${cached ? "cached" : ""} link`);
    }
  } else {
    console.log("Посилань не знайдено у цьому повідомленні");
  }
};
