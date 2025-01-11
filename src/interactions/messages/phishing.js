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
  const member = message.guild.members.cache.get(message.author.id);
  if (adminRoles.some((role) => member.roles.cache.has(role))) return;

  const content = message.content;

  const matches = [...content.matchAll(urlRegex)];

  if (matches.length > 0) {
    for (const match of matches) {
      const url = match[1] || match[0];

      console.log(`Знайдено посилання: ${url}`);

      if (phishUrls.some((url) => url.includes(url))) {
        await message.guild.members.cache
          .get(message.author.id)
          .timeout(
            1000 * 60 * 60 * 24 * 1,
            "Мут за фішинг(скорочувач посилань)"
          );
        await message.delete();
        return;
      }

      if (url.includes("discord.gg") && !url.includes("eMEVTNvg")) {
        await message.delete();
      }

      if (phishingRegex.test(url) || redirectionRegex.test(url)) {
        await message.guild.members.cache
          .get(message.author.id)
          .timeout(1000 * 60 * 60 * 24 * 7, "Мут за фішинг");
        await message.delete();
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
