import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('67')
    .setDescription('Makes the bot say 67');

export async function execute(interaction) {
    // This makes the bot reply directly to the slash command interaction
    await interaction.reply('67');
}

// Exporting as default in case your command handler expects default imports
export default { data, execute };
