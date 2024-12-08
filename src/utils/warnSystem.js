const { EmbedBuilder } = require("discord.js");
const Level = require("../models/Level");
const { guildId } = require("../constants/config");
const main = require("../index");

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
        .setTitle("Вітаю тебе, пане порушнику!")
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
      user.send({ embeds: [embed] });
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
      user.send({ embeds: [embed] });
    } catch (err) {
      console.log("Error while sending ban message", err);
    }
  }
  async isEnough(warns, id) {
    const requiredWarns = 5;
    if (Math.round(warns) >= 3 && warns < requiredWarns)
      return await this.sendDirectMessage(id, warns, requiredWarns);
    if (warns < requiredWarns) return;
    const guild = main.client.guilds.cache.get(guildId);
    await this.sendBanMessage(id);
    await Level.deleteOne({ userId: id });
    // guild.ban(id, { reason: "Достатня кількість попереджень для бану" });
  }
  async giveWarn(userId, reason) {
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
    console.log(updatedUserObj.warnings);
    this.isEnough(updatedUserObj.warnings.amount, userId);
  }
  async giveSoftWarn(userId) {
    const currentUser = await Level.findOne({ userId });
    currentUser.warnings.history.push({ date: new Date(), amount: 1 });
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
    this.isEnough(updatedUserObj.warnings.amount);
  }
}

module.exports = new WarnSystem();
