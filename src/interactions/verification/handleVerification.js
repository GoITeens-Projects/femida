const useSocket = require("../../utils/useSocket");

module.exports = async function handleVerification(msg) {
  if (!msg.content.toLowerCase().startsWith("verify")) return;
  function validateEmail(email) {
    const regExp =
      /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
    return regExp.test(email);
  }
  const email = msg.content.slice(7, msg.content.length);
  if (!validateEmail(email) || email.length < 3 || email.length > 259) {
    return await msg.reply("Такої електронної пошти не існує((");
  }
  msg.react("💙");
  const waitMsg = await msg.channel.send("Зачекай трохи..");
  const userObj = {
    email,
    id: msg.author.id,
    avatar: msg.author.displayAvatarURL({ dynamic: true }) || "",
    username: msg.author.username,
    globalName: msg.author.globalName,
  };
  useSocket(userObj, msg, waitMsg);
};
