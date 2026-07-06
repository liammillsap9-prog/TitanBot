import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('viewinventory')
    .setDescription("Looks through a player's public inventory using their Roblox User ID")
    .addStringOption(option => 
        option.setName('userid')
            .setDescription('The Roblox User ID of the player')
            .setRequired(true)
    );

export async function execute(interaction) {
    await interaction.deferReply();
    const userId = interaction.options.getString('userid');

    try {
        // Asset Type 8 = Hats/Accessories. 
        // We route this through inventory.roproxy.com to bypass the cloud hosting IP ban.
        const inventoryUrl = `https://inventory.roproxy.com/v2/users/${userId}/inventory/8?limit=10&sortOrder=Desc`;
        
        const response = await fetch(inventoryUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.status === 403) {
            return interaction.editReply('❌ This user\'s inventory is actually private, or Roblox is rejecting the request.');
        }

        if (!response.ok) {
            return interaction.editReply(`❌ Failed to pull data. Roblox API returned status: ${response.status}`);
        }

        const invData = await response.json();

        if (!invData.data || invData.data.length === 0) {
            return interaction.editReply('📁 This user has no public hats or accessories visible in their inventory.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Public Inventory (User ID: ${userId})`)
            .setDescription('Showing the latest public hats/accessories found in this player\'s collection:')
            .setColor('#FFAA00')
            .setTimestamp();

        // Loop through the items array returned by the v2/inventory endpoint
        invData.data.slice(0, 5).forEach((item, index) => {
            embed.addFields({
                name: `${index + 1}. ${item.name || 'Unknown Item'}`,
                value: `**Asset ID:** \`${item.assetId}\`\n[View on Catalog](https://www.roblox.com/catalog/${item.assetId})`,
                inline: false
            });
        });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ An error occurred while communicating with the proxy backend.');
    }
}

export default { data, execute };
