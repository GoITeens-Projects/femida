const SettingsInterface = require("../../utils/settings");
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
  if (adminRoles.some((role) => member.roles.cache.has(role))) return;

  const content = message.content;

  const matches = [...content.matchAll(urlRegex)];

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
        }
        continue;
      }
      if (settings.scamLinks.targetLinks.some((scamLink) => scamLink === url)) {
        if (settings.scamLinks.actions.mute.enabled) {
          await message.guild.members.cache
            .get(message.author.id)
            .timeout(
              settings.scamLinks.actions.mute.muteTimeMs,
              "Мут за фішинг(скорочувач посилань)"
            );
        }
        if (settings.scamLinks.actions.deleteMsg) {
          await message.delete();
        }
        if (settings.scamLinks.actions.notifyUser.enabled) {
          await message.channel.send(
            `<@${message.author.id}>, не відправляй фішинг посилань!`
          );
        }
        return;
      }
      // console.log(`Знайдено посилання: ${url}`);

      if (phishUrls.some((phishUrl) => url.includes(phishUrl))) {
        if (settings.scamLinks.actions.mute.enabled) {
          await message.guild.members.cache
            .get(message.author.id)
            .timeout(
              settings.scamLink.mute.muteTimeMs,
              "Мут за фішинг(скорочувач посилань)"
            );
        }
        if (settings.scamLinks.actions.deleteMsg) {
          await message.delete();
        }
        if (settings.scamLinks.actions.notifyUser.enabled) {
          await message.channel.send(
            `<@${message.author.id}>, не відправляй фішинг посилань!`
          );
        }
        return;
      }

      if (phishingRegex.test(url) || redirectionRegex.test(url)) {
        if (settings.scamLinks.actions.mute.enabled) {
          await message.guild.members.cache
            .get(message.author.id)
            .timeout(
              settings.scamLink.actions.mute.muteTimeMs,
              "Мут за фішинг(скорочувач посилань)"
            );
        }
        if (settings.scamLinks.actions.deleteMsg) {
          await message.delete();
        }
        if (settings.scamLinks.actions.notifyUser.enabled) {
          await message.channel.send(
            `<@${message.author.id}>, не відправляй фішинг посилань!`
          );
        }
      } else {
        console.log("Itʼs secure link");
      }

      // const result = checkForPhishing(url);

      // console.log(`Результат перевірки для ${url}:`, result);

      // if (!result) {
      //   message.reply(`Це посилання може бути небезпечним: ${url}`);
      // }
    }
  } else {
    console.log("Посилань не знайдено у цьому повідомленні.");
  }
};

// a7fe97d72ac2e2277c1ba244770ffa8b24b889a3a7dd85bf563e04d16eb5ea2d

// const axios = require("axios");

// const urlRegex = /(?:https?:\/\/[^\s]+|\[[^\]]+\]\((https?:\/\/[^\s]+)\))/g;

// // Ваш API-ключ для VirusTotal
// const VIRUSTOTAL_API_KEY = "a7fe97d72ac2e2277c1ba244770ffa8b24b889a3a7dd85bf563e04d16eb5ea2d";

// module.exports = async (message) => {
//   const content = message.content;

//   // Знаходимо всі посилання в повідомленні
//   const matches = [...content.matchAll(urlRegex)];

//   if (matches.length > 0) {
//     for (const match of matches) {
//       const url = match[1] || match[0]; // Отримуємо URL із регулярного виразу

//       console.log(`Знайдено посилання: ${url}`);

//       try {
//         // Кодуючи URL у Base64 (вимагається для VirusTotal)
//         const base64Url = Buffer.from(url).toString("base64");

//         // Надсилаємо URL до VirusTotal для перевірки
//         const response = await axios.post(
//           "https://www.virustotal.com/api/v3/urls",
//           { url: url }, // Передаємо URL у Base64-форматі
//           {
//             headers: {
//               "x-apikey": VIRUSTOTAL_API_KEY,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const analysisId = response.data.data.id;
//         console.log(`Посилання надіслано для аналізу. ID аналізу: ${analysisId}`);

//         // Отримуємо результати аналізу
//         const analysisResponse = await axios.get(
//           `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
//           {
//             headers: {
//               "x-apikey": VIRUSTOTAL_API_KEY,
//             },
//           }
//         );

//         const stats = analysisResponse.data.data.attributes.stats;
//         const isMalicious = stats.malicious > 0;

//         if (isMalicious) {
//           message.reply(`Це посилання може бути небезпечним: ${url}`);
//         } else {
//           console.log(`Посилання ${url} є безпечним.`);
//         }
//       } catch (error) {
//         console.error(`Помилка при перевірці посилання ${url}:`, error.response?.data || error.message);
//         message.reply(`Не вдалося перевірити це посилання: ${url}`);
//       }
//     }
//   } else {
//     console.log("Посилань не знайдено у цьому повідомленні.");
//   }
// };
