import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('robloxstatus')
    .setDescription('Checks if the Roblox servers are up or down');

export async function execute(interaction) {
    // Acknowledge the command immediately while we fetch the data
    await interaction.deferReply();

    try {
        // Official backend API for status.roblox.com
        const response = await fetch('https://4277980205320394.hostedstatus.com/1.0/status/59db90dbcdeb2f04dadcf16d');
        const data = await response.json();

        // Extract the overall status message
        const overallStatus = data.result.status_overall.status; 
        
        // Determine color and friendly output based on Roblox status
        let isUp = overallStatus.toLowerCase().includes('operational');
        let statusTitle = isUp ? '🟢 Roblox is UP' : '🔴 Roblox is DOWN/EXPERIENCING ISSUES';
        let statusColor = isUp ? '#00FF7F' : '#FF4500';

        const embed = new EmbedBuilder()
            .setTitle(statusTitle)
            .setDescription(`**Current Status:** ${overallStatus}`)
            .addFields(
                { name: 'Official Status Page', value: '[Click here to view](https://status.roblox.com/)', inline: false }
            )
            .setColor(statusColor)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ Failed to check Roblox status. Please try again later.');
    }
}

export default { data, execute };
