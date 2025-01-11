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
  try {
    const resp = await fetch("http://" + process.env.FEMIDA_API + "/verify", {
      method: "POST",
      body: JSON.stringify(userObj),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
      },
    });
    const data = await resp.json();
    waitMsg.edit(data?.message);
    if (resp.status === 400) {
      msg.react("🚩");
    }
  } catch (err) {
    console.log(err);
    msg.react("🚩");
    waitMsg.edit("Трапилася дивна помилка. Спробуй пізніше");
  }
};
