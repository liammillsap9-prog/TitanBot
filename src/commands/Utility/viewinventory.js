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
        // Official Roblox inventory endpoint for classic assets (Hats, Accessories, etc. - AssetType 8 is Hat)
        // We look up the first 10 items in their inventory
        const inventoryUrl = `https://inventory.roblox.com/v2/users/${userId}/inventory?assetTypes=8&limit=10&sortOrder=Desc`;
        
        const response = await fetch(inventoryUrl);
        
        if (response.status === 403) {
            return interaction.editReply('❌ This user\'s inventory is private or restricted. The bot cannot view it.');
        }

        if (!response.ok) {
            return interaction.editReply('❌ Failed to pull inventory data. Make sure the User ID is valid.');
        }

        const invData = await response.json();

        if (!invData.data || invData.data.length === 0) {
            return interaction.editReply('📁 This user\'s public inventory is empty or contains no public accessories/hats.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎒 Public Inventory Search (User: ${userId})`)
            .setDescription('Showing the latest public accessories/hats found in this player\'s inventory:')
            .setColor('#FFAA00')
            .setTimestamp();

        // Loop through the items found and add them to the embed fields
        invData.data.slice(0, 5).forEach((item, index) => {
            embed.addFields({
                name: `${index + 1}. ${item.name}`,
                value: `**Asset ID:** \`${item.assetId}\`\n[View on Roblox](https://www.roblox.com/catalog/${item.assetId})`,
                inline: false
            });
        });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ An error occurred while communicating with the Roblox Inventory API.');
    }
}

export default { data, execute };
