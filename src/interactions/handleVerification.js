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
};
