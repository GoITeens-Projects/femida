const { config } = require("dotenv");
const Level = require("../../models/Level");
const cfg = require("../../constants/config");

config();

const guildId = process.env.GUILD_ID;
const roles = cfg.levelRoles;

// Додавання ролі користувачеві
async function addRole(userId, roleId) {
    await fetch(
        `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        }
    );
}

// Зняття ролі з користувача
async function removeRole(userId, roleId) {
    await fetch(
        `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${process.env.TOKEN}`,
            },
        }
    );
}

module.exports = async function addRoleLevel({ level, xp }, userId) {
    // Отримання поточного рівня користувача з бази даних
    const userLevelData = await Level.findOne({ userId });
    const currentLevel = userLevelData ? userLevelData.level : 0;

    // Знайти найбільший рівень, який кратний 5, і користувач досягнув або перевищив його
    let newRole = null;
    for (let i = roles.length - 1; i >= 0; i--) {
        if (level >= roles[i].level) {
            newRole = roles[i];
            break;
        }
    }

    if (newRole) {
        // Затримка перед додаванням нової ролі
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Додаємо нову роль
        await addRole(userId, newRole.roleId);

        // Видаляємо всі попередні ролі, які користувач міг мати
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].level < newRole.level) {
                await removeRole(userId, roles[i].roleId);
            }
        }
    }
};