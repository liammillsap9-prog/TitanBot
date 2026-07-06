import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('fetchuniverse')
    .setDescription('Gets the Universe ID of a Roblox game using its link')
    .addStringOption(option => 
        option.setName('link')
            .setDescription('The Roblox game URL (e.g., roblox.com/games/123456/)')
            .setRequired(true)
    );

export async function execute(interaction) {
    await interaction.deferReply();
    const gameLink = interaction.options.getString('link');

    // Regex to pull the Place ID number cleanly out of any Roblox game link
    const idMatch = gameLink.match(/games\/(\d+)/);

    if (!idMatch) {
        return interaction.editReply('❌ Invalid Roblox game link! Make sure it looks like `https://www.roblox.com/games/XXXXX/game-name`.');
    }

    const placeId = idMatch[1];

    try {
        // Official unauthenticated Roblox endpoint to match Place IDs to Universe IDs
        const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        
        if (!response.ok) {
            return interaction.editReply('❌ Could not look up that game. Double-check if the Place ID is correct.');
        }

        const data = await response.json();
        const universeId = data.universeId;

        if (!universeId) {
            return interaction.editReply('❌ No Universe ID found associated with that Place.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Roblox Universe Info')
            .addFields(
                { name: '📍 Place ID (From Link)', value: `\`${placeId}\``, inline: true },
                { name: '🌌 Universe ID', value: `\`${universeId}\``, inline: true },
                { name: '🔗 Developer API Link', value: `[Click to view Raw Data](https://games.roblox.com/v1/games?universeIds=${universeId})`, inline: false }
            )
            .setColor('#00AAFF')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ Failed to connect to the Roblox API. Try again in a moment.');
    }
}

export default { data, execute };
