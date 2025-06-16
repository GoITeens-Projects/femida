const { EmbedBuilder, messageLink } = require("discord.js");
const Level = require("../models/Level");
const { guildId } = require("../constants/config");
const main = require("../index");
const SettingsInterface = require("../utils/settings");

class WarnSystem {
  constructor() {
    this.sendBanMessage = this.sendBanMessage.bind(this);
    this.sendDirectMessage = this.sendDirectMessage.bind(this);
    this.giveWarn = this.giveWarn.bind(this);
    this.giveSoftWarn = this.giveSoftWarn.bind(this);
  }
  async sendDirectMessage(userId, amount, requiredAmount = 5) {
    try {
      const diffAmountWarns = requiredAmount - amount;
      const diffAmountSoftWarns =
        Math.round(diffAmountWarns) === diffAmountWarns ? 0 : 1;
      const roundedAmount = Math.round(amount);
      const embed = new EmbedBuilder()
        .setTitle("Вітаю тебе, пане(-і) порушнику(-це)!")
        .setColor("#F5761A")
        .setDescription(
          `Ти порушив/ла правила вже ${roundedAmount} раз${
            roundedAmount === 1
              ? ""
              : roundedAmount === 2 ||
                roundedAmount === 3 ||
                roundedAmount === 4
              ? "и"
              : "ів"
          }. До бану залишилось зовсім трішки`
        )
        .setFooter({
          text: `А точніше ${diffAmountWarns} варн${
            diffAmountWarns === 1
              ? ""
              : diffAmountWarns === 2 || diffAmountWarns === 3
              ? "и"
              : "ів"
          } ${diffAmountSoftWarns ? "і 1 м'який варн" : ""}`,
        });
      const user = await main.client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.log("Error while sending warning message", err);
    }
  }
  async sendBanMessage(userId) {
    try {
      const embed = new EmbedBuilder()
        .setTitle("Навіть трохи сумно розлучатись...")
        .setColor("#FF4F4F")
        .setDescription(
          `Скільки разів ти вже порушив/ла правила нашого серверу.. \n Я не знаю, що ти зробив/ла, але бажаю \n тобі знайти своїх людей на якомусь іншому сервері, \n бо відтепер вхід на наш тобі заблоковано.`
        );
      const user = await main.client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.log("Error while sending ban message", err);
    }
  }
  async sendDirectCmdMessage(userId, amount, requiredAmount = 5, reason) {
    const embed = new EmbedBuilder()
      .setColor("#CF5B2E")
      .setTitle(
        "Адміністрація серверу GoITeens прийняла рішення видати тобі варн (попередження)"
      )
      .setDescription(
        `Це ${amount}/${requiredAmount} порушень. Віднині намагайся бути більш чемним(-ою) \n у дотриманні правил нашого серверу`
      )
      .addFields({ name: "Причина:", value: `\`${reason}\`` });
    try {
      const user = await main.client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  }
  async isEnough(warns, id, sendDirectCmd, reason) {
    const {
      warns: { actions },
    } = await SettingsInterface.getSettings();
    console.log(warns, actions);
    const foundAction = actions.find((action) => action.warnsAmount === warns);
    let requiredWarns = actions.find((elem) => elem.ban)?.warnsAmount;
    if (requiredWarns === undefined) requiredWarns = 5;
    if (foundAction?.kick || foundAction?.ban) {
      const guild = main.client.guilds.cache.get(guildId);
      await Level.deleteOne({ userId: id });
      const member = await guild.members.fetch(id);
      if (foundAction.kick) {
        console.log("KICK"); //? message here
        // member.kick({ reason: "Велика кількість попереджень" });
        return;
      }
      if (foundAction.ban) {
        console.log("BAN");
        await this.sendBanMessage(id);
        // member.ban({ reason: "Достатня кількість попереджень для бану" });
        return;
      }
    }
    if (sendDirectCmd)
      return await this.sendDirectCmdMessage(id, warns, requiredWarns, reason);
    // if (Math.round(warns) >= 3)
    return await this.sendDirectMessage(id, warns, requiredWarns);

    // if (warns < requiredWarns) return;
  }
  async giveWarn(userId, reason, sendDirect = false) {
    const currentUser = await Level.findOne({ userId });
    currentUser.warnings.history.push({ date: new Date(), amount: 1, reason });
    const updatedUserObj = await Level.findOneAndUpdate(
      { userId },
      {
        warnings: {
          amount: currentUser.warnings.amount + 1,
          history: currentUser.warnings.history,
        },
      },
      { new: true }
    );
    this.isEnough(updatedUserObj.warnings.amount, userId, sendDirect, reason);
  }
  async giveSoftWarn(userId, reason, sendDirect = false) {
    const currentUser = await Level.findOne({ userId });
    currentUser.warnings.history.push({ date: new Date(), amount: 1, reason });
    const updatedUserObj = await Level.findOneAndUpdate(
      { userId },
      {
        warnings: {
          amount: currentUser.warnings.amount + 0.5,
          history: currentUser.warnings.history,
        },
      },
      { new: true }
    );
    this.isEnough(updatedUserObj.warnings.amount, userId, sendDirect, reason);
  }
  async sendRemoveWarnMsg(userId, amount, newSum) {
    const guild = main.client.guilds.cache.get(guildId);
    const embed = new EmbedBuilder()
      .setTitle(
        `Адміни прийняли рішення забрати в тебе ${
          amount === 1
            ? "один варн"
            : amount === 0.5
            ? "один софт варн"
            : `декілька варнів`
        }`
      )
      .setColor("#203559")
      .setDescription(
        `Точна кількість знятих варнів: \`${amount.toFixed(
          1
        )}\` \n Нова сума варнів: \`${newSum}\``
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter({ text: "Вибач за недорозуміння" });
    try {
      const user = await main.client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
    }
  }
  async removeWarn(userId, amount) {
    const user = await Level.findOne({ userId });
    console.log(user.warnings);
    if (!user) {
      return {
        ok: false,
        message:
          "Користувача не знайдено у базі даних, відповідно і попереджень він мати не може",
      };
    }
    if (!user.warnings || !user.warnings?.amount) {
      return {
        ok: false,
        message: "У користувача не було і немає варнів",
      };
    }
    let warnsAmount = amount;
    if (user.warnings.amount < amount) {
      warnsAmount = user.warnings.amount;
    }
    const updatedUser = await Level.findOneAndUpdate(
      { userId },
      { warnings: { amount: user.warnings.amount - warnsAmount } },
      { new: true }
    );
    await this.sendRemoveWarnMsg(
      userId,
      warnsAmount,
      updatedUser.warnings.amount
    );
    return { ok: true, message: "Операція пройшла успішно" };
  }
}

module.exports = new WarnSystem();
