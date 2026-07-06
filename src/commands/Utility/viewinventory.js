import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('viewinventory')
    .setDescription("Looks through a player's public inventory items using their Roblox User ID")
    .addStringOption(option => 
        option.setName('userid')
            .setDescription('The Roblox User ID of the player')
            .setRequired(true)
    );

export async function execute(interaction) {
    await interaction.deferReply();
    const userId = interaction.options.getString('userid');

    try {
        // Roblox modern unauthenticated open cloud fallback endpoint
        const inventoryUrl = `https://apis.roblox.com/cloud/v2/users/${userId}/inventory-items?maxPageSize=10`;
        
        const response = await fetch(inventoryUrl);
        
        if (response.status === 403) {
            return interaction.editReply('❌ This user\'s inventory is private or restricted.');
        }

        if (!response.ok) {
            return interaction.editReply('❌ Failed to connect to the Roblox Inventory cloud. Double check the User ID.');
        }

        const invData = await response.json();

        if (!invData.inventoryItems || invData.inventoryItems.length === 0) {
            return interaction.editReply('📁 This user has no public items visible in their current cloud inventory asset collection.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Public Inventory (User ID: ${userId})`)
            .setDescription('Successfully pulled recent public items found via Open Cloud data:')
            .setColor('#FFAA00')
            .setTimestamp();

        // Loop through the items found and add them safely
        invData.inventoryItems.slice(0, 5).forEach((item, index) => {
            const details = item.assetDetails;
            if (details) {
                const cleanType = details.inventoryItemAssetType ? details.inventoryItemAssetType.replace('_', ' ') : 'Asset';
                embed.addFields({
                    name: `${index + 1}. Item ID: ${details.assetId || 'Unknown'}`,
                    value: `**Type:** \`${cleanType}\`\n[View on Catalog](https://www.roblox.com/catalog/${details.assetId})`,
                    inline: false
                });
            }
        });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ An error occurred while communicating with the Roblox API backend.');
    }
}

export default { data, execute };
