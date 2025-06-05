const fs = require("node:fs");
const path = require("node:path");

class CustomInteractions {
  constructor() {
    this.interactions = [];
    this.deployInteractions();
  }
  deployInteractions() {
    const foldersPath = path.join(__dirname, "../components/");
    const componentsFolders = fs.readdirSync(foldersPath);

    for (const folder of componentsFolders) {
      // Grab all the command files from the commands directory you created earlier
      const componentsPath = path.join(foldersPath, folder);
      const componentsFiles = fs
        .readdirSync(componentsPath)
        .filter((file) => file.endsWith(".js"));
      // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
      for (const file of componentsFiles) {
        const filePath = path.join(componentsPath, file);
        const interaction = require(filePath);
        if ("component" in interaction && "execute" in interaction) {
          this.interactions.push(interaction);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      }
    }
  }
  handlCustomInteractions(interaction, client) {
    if (interaction.isChatInputCommand()) return;
    if (this.interactions.legnth === 0) {
      console.error("Empty interactions!");
      return;
    }
    const component = this.interactions.find(
      (savedInteraction) =>
        savedInteraction.component.data.custom_id === interaction.customId
    );
    if (!component) {
      console.error("Interaction was not found!");
      return;
    }
    try {
      component.execute(interaction, client);
    } catch (err) {
      console.log("Error while handling custom component events");
    }
  }
}

module.exports = CustomInteractions;
