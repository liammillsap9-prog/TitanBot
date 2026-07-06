import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('trackugc')
    .setDescription('Fetches the latest catalog items from a specific Roblox Creator or Group ID')
    .addStringOption(option =>
        option.setName('id')
            .setDescription('The Creator or Group ID number')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Is this ID a User or a Group?')
            .setRequired(true)
            .addChoices(
                { name: 'Group', value: 'Group' },
                { name: 'User', value: 'User' }
            )
    );

export async function execute(interaction) {
    await interaction.deferReply();
    
    const creatorId = interaction.options.getString('id');
    const creatorType = interaction.options.getString('type');

    try {
        // Official Roblox Catalog API endpoint to search items by creator
        const catalogUrl = `https://catalog.roblox.com/v1/search/items/details?Category=11&CreatorTargetId=${creatorId}&CreatorType=${creatorType}&SortType=3&Limit=5`;
        
        const response = await fetch(catalogUrl);
        if (!response.ok) {
            return interaction.editReply('❌ Failed to fetch items. Make sure the ID is correct.');
        }

        const result = await response.json();

        if (!result.data || result.data.length === 0) {
            return interaction.editReply('⚠️ No recent items found for this creator.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`🛍️ Latest UGC Items from ${creatorType} (${creatorId})`)
            .setColor('#FFAA00')
            .setTimestamp();

        // Loop through the top 3 newest items found
        result.data.slice(0, 3).forEach((item, index) => {
            const price = item.price === 0 || !item.price ? '🆓 FREE / Offsale' : `💵 ${item.price} Robux`;
            embed.addFields({
                name: `${index + 1}. ${item.name}`,
                value: `**Price:** ${price}\n**Item Type:** ${item.itemType}\n[View Item on Roblox](https://www.roblox.com/catalog/${item.id})`,
                inline: false
            });
        });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ An error occurred while connecting to the Roblox Catalog API.');
    }
}

export default { data, execute };
