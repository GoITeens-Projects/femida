const Level = require("../models/Level");
const messages = require("../models/messages.js");

module.exports = async (
  message,
  antiSpam,
  userCooldowns,
  userMuteCooldowns
) => {
  // Отримання ідентифікатора користувача та тексту повідомлення
  const userId = message.author.id;
  const content = message.content;

  try {
    // Отримання часу останнього повідомлення користувача
    const lastMessageTime = userCooldowns.get(userId) || 0;
    const currentTime = Date.now();

    // Збереження нового повідомлення в базі даних
    const newMessage = new messages({
      userId: userId,
      message: content,
    });
    await newMessage.save();
    // console.log(`User wrote: ${content}`);

    // Перевірка наявності користувача в списку cooldowns
    if (!userCooldowns.has(userId)) {
      // Додавання користувача до списку cooldowns та встановлення таймауту
      userCooldowns.set(userId, currentTime);

      setTimeout(async () => {
        // Отримання кількості аналогічних повідомлень користувача
        const countOfSameMessages = await messages.countDocuments({
          userId: userId,
          message: content,
        });

        // Отримання повідомлень користувача на каналі
        const userMessages = await message.channel.messages.fetch({
          limit: 100,
        });
        // Фільтрація спам-повідомлень користувача
        const userSpamMessages = userMessages.filter(
          (msg) =>
            msg.author.id === userId &&
            msg.content === content &&
            msg.id !== message.id
        );

        // Видалення спам-повідомлень
        userSpamMessages.forEach(async (msg) => {
          try {
            await msg.delete();
          } catch (error) {
            console.error("Error deleting message:", error);
          }
        });

        // Визначення дій в залежності від кількості аналогічних повідомлень
        if (countOfSameMessages >= antiSpam.warnThreshold) {
          switch (true) {
            case countOfSameMessages >= antiSpam.banTreshold:
              message.channel.send(antiSpam.banMessage);
              // Отримання об'єкта користувача
              // const bannedUser = message.guild.members.cache.get(userId);
              // // Блокування користувача на сервері
              // bannedUser.ban({ reason: 'Excessive spam' });
              break;
            case countOfSameMessages >= antiSpam.kickTreshold:
              // message.channel.send(antiSpam.kickMessage);
              // const kickedUser = message.guild.members.cache.get(userId);
              // // Вилучення користувача з серверу
              // kickedUser.kick({ reason: 'Excessive spam' });
              break;
            case countOfSameMessages >= antiSpam.muteTreshold:
              // Встановлення ролі "Muted" та часу мута
              const lastMuteTime = userMuteCooldowns.get(userId) || 0;
              const muteCooldown = 60 * 1000; // 1 хвилина

              if (currentTime - lastMuteTime > muteCooldown) {
                const muteRole = message.guild.roles.cache.find(
                  (role) => role.name === "Muted"
                );
                if (muteRole) {
                  const member = message.guild.members.cache.get(userId);
                  if (member) {
                    member.roles.add(muteRole);
                    message.channel.send(
                      `<@${userId}> ${antiSpam.muteMessage}`
                    );

                    userMuteCooldowns.set(userId, currentTime);

                    // Зняття ролі "Muted" після вказаного часу
                    setTimeout(() => {
                      member.roles.remove(muteRole);
                    }, antiSpam.unMuteTime * 1000);
                  }
                }
              }
              break;
            case countOfSameMessages >= antiSpam.warnThreshold:
              // Надсилання попередження та віднімання деякої кількості досвіду (XP)
              message.channel.send(antiSpam.warnMessage);
              const id = message.author.id;
              Level.findOne({ userId: id })
                .exec()
                .then((op) => {
                  if (op !== null) {
                    let exp = op.currentXp - 5;
                    Level.updateOne({ userId: id }, { currentXp: exp }).then();
                    console.log("Points deducted");
                  }
                });
              break;
            default:
              break;
          }
        }

        // Видалення користувача зі списку cooldowns
        userCooldowns.delete(userId);
      }, 1000);
    }
  } catch (error) {
    console.log(error);
  }
};
