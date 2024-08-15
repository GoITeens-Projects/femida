const { config } = require("dotenv");

const Level = require("../models/Level");
const getLimit = require("./getNeededXp")
const updateLevel = require("./updateLevel")
const studentRoleId = require("../constants/studentRoleId");
const main = require("../index.js")

config()

module.exports = async (id, amount, exeption) => {
  const insistUsers = await Level.find({ userId: id });
    if (insistUsers.length === 0) {
      const newUser = new Level({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        xp: 0,
        currentXp: 0,
        level: 0,
      });

      await newUser.save();
    }
    const user = await Level.findOne({ userId: id });
    const GUILD_ID = process.env.GUILD_ID;
    const guild = main.client.guilds.cache.get(GUILD_ID);
    const member = guild.members.cache.get(id)
    const isStudent = member.roles.cache.has(studentRoleId);

    if(exeption){
      const up = isStudent ? user.xp +( amount * 1.25) : (user.xp + amount) ;
      await Level.updateOne({ userId: id }, { xp: up })
      updateLevel(user, user.id)
    }else{
      const limit = getLimit(user.level, isStudent)
      if(user.currentXp === limit) return
      const extra = amount  * 1.25
      let up = isStudent ? user.xp + extra : user.xp + amount;
      console.log(amount  * 1.25)
      let curLimit = isStudent ? user.currentXp + (amount * 1.25) : user.currentXp + amount 
      console.log(user.xp + (amount  * 1.25))
      if(curLimit > limit){
       curLimit = limit
       up = limit - user.currentXp 
      } 
      await Level.updateOne({ userId: id }, { xp: up, currentXp: curLimit })
      updateLevel(user, user.id)
    }
  
}