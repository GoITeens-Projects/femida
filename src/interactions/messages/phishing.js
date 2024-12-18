const checkForPhishing = require("eth-phishing-detect");
const urlRegex = /(?:https?:\/\/[^\s]+|\[[^\]]+\]\((https?:\/\/[^\s]+)\))/g;

module.exports = async (message) => {
  const content = message.content;

  const matches = [...content.matchAll(urlRegex)];

  if (matches.length > 0) {
    for (const match of matches) {
      const url = match[1] || match[0];

      console.log(`Знайдено посилання: ${url}`);

      const result = checkForPhishing(url);
      console.log(`Результат перевірки для ${url}:`, result);

      if (!result) {
        message.reply(`Це посилання може бути небезпечним: ${url}`);
      }
    }
  } else {
    console.log("Посилань не знайдено у цьому повідомленні.");
  }
};
