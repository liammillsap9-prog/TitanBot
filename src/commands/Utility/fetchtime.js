import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('fetchtime')
    .setDescription('Gets the current live time and date');

export async function execute(interaction) {
    const now = new Date();
    
    // Forces the server to translate the time into your specific time zone
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZone: 'America/New_York' // Change this if you aren't in Eastern Time!
    });
    
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/New_York'
    });

    const embed = new EmbedBuilder()
        .setTitle('🕒 Current Time')
        .addFields(
            { name: 'Time', value: `\`${timeString}\``, inline: true },
            { name: 'Date', value: `\`${dateString}\``, inline: true }
        )
        .setColor('#00AAFF')
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

export default { data, execute };
