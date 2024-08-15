const sameLetters = require("../utils/sameLetters");
const addPoints = require("../utils/addPoints")

module.exports = async function accrualPoints(message) {
        if (
            message.content.length > 3 &&
            !message.author.bot &&
            sameLetters(message.content)
        ) {
            await addPoints( message.author.id, 4, false)
        }
};
