const badWords = require("../../constants/badWords");
const goodWords = require("../../constants/goodWords"); // Слова, которые могут быть похожи на плохие
const {
  roles: { mutedRole: mutedRoleID, adminRoles },
} = require("../../constants/config");
const muteDuration = 60; // Продолжительность мута в секундах

// Мапа для отслеживания количества предупреждений каждого пользователя
const warnedUsers = new Map();

module.exports = async (message) => {
  const userId = message.author.id;
  const content = message.content.toLowerCase();
  const guild = message.guild;

  try {
    // Пропуск сообщений от администраторов и модераторов
    if (adminRoles.some((roleId) => message.member.roles.cache.has(roleId))) {
      return;
    }

    // Игнорирование сообщений, которые содержат "хорошие" слова
    if (goodWords.some((goodWord) => content.includes(goodWord))) {
      return;
    }

    // Проверка и увеличение счетчика плохих слов для пользователя
    if (warnedUsers.has(userId)) {
      warnedUsers.set(userId, warnedUsers.get(userId) + 1);
    } else {
      warnedUsers.set(userId, 1);
    }

    let warned = false; // Флаг, чтобы отметить, если было предупреждение

    // Проверка на наличие плохих слов в сообщении
    for (const word of badWords) {
      if (content.includes(word)) {
        // Удаление сообщения
        await message.delete().catch((err) => {
          console.error("Не удалось удалить сообщение:", err);
        });

        // Проверка, существует ли роль "Muted"
        const mutedRole = guild.roles.cache.get(mutedRoleID);
        if (!mutedRole) {
          console.error("Muted role not found.");
          await message.channel.send(`${message.author}, роль "Muted" не найдена.`);
          return;
        }

        // Проверка, есть ли у пользователя уже роль "Muted"
        if (message.member.roles.cache.has(mutedRoleID)) {
          await message.channel.send(
            `${message.author}, ти вже в муті за використання поганих слів!`
          );
          return;
        }

        // Если это первое предупреждение
        if (warnedUsers.get(userId) === 1) {
          await message.channel.send(
            `${message.author}, не використовуй поганих слів! Це твоє останнє попередження :warning:`
          );
          warned = true;
        }

        // Если это второе или больше предупреждение, накладывается мут
        if (warnedUsers.get(userId) >= 2) {
          await message.channel.send(`${message.author}, ти догрався. Мут накладено.`);
          // Добавление роли "Muted"
          await message.member.roles.add(mutedRole).catch((err) => {
            console.error("Не удалось добавить роль 'Muted':", err);
          });

          // Снятие роли "Muted" через muteDuration секунд
          setTimeout(async () => {
            await message.member.roles.remove(mutedRole).catch((err) => {
              console.error("Не удалось снять роль 'Muted':", err);
            });
            await message.channel.send(`${message.author}, ти більше не в муті.`);
          }, muteDuration * 1000);
        }

        break; // Выход из цикла при нахождении плохого слова
      }
    }

    // Дополнительная логика, если нужно, для первого предупреждения
    if (!warned && warnedUsers.get(userId) === 1) {
      // Можете добавить какую-то логику здесь, если необходимо
    }
  } catch (error) {
    console.error("Ошибка при обработке сообщения:", error);
  }
};
