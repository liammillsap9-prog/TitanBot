import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('fetchuniverse')
    .setDescription('Gets the Universe ID and lists all sub-places of a Roblox game using its link')
    .addStringOption(option => 
        option.setName('link')
            .setDescription('The Roblox game URL (e.g., roblox.com/games/123456/)')
            .setRequired(true)
    );

export async function execute(interaction) {
    await interaction.deferReply();
    const gameLink = interaction.options.getString('link');

    // Pull the starting Place ID number cleanly out of the link
    const idMatch = gameLink.match(/games\/(\d+)/);

    if (!idMatch) {
        return interaction.editReply('❌ Invalid Roblox game link! Make sure it looks like `https://www.roblox.com/games/XXXXX/game-name`.');
    }

    const startPlaceId = idMatch[1];

    try {
        // Step 1: Get the Universe ID from the Place ID
        const universeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${startPlaceId}/universe`);
        
        if (!universeResponse.ok) {
            return interaction.editReply('❌ Could not look up that game. Double-check if the link is correct.');
        }

        const universeData = await universeResponse.json();
        const universeId = universeData.universeId;

        if (!universeId) {
            return interaction.editReply('❌ No Universe ID found associated with that Place.');
        }

        // Step 2: Fetch the list of sub-places belonging to this Universe ID
        const placesResponse = await fetch(`https://develop.roblox.com/v1/universes/${universeId}/places?isAllPlaces=true&limit=10`);
        let placeListString = 'No sub-places found.';

        if (placesResponse.ok) {
            const placesData = await placesResponse.json();
            
            if (placesData.data && placesData.data.length > 0) {
                // Map out the list items nicely with links to their respective sub-places
                placeListString = placesData.data.map((place, index) => {
                    const isRoot = place.id == startPlaceId ? ' (★ Main Start)' : '';
                    return `**${index + 1}.** [${place.name}](https://www.roblox.com/games/${place.id}/) \nID: \`${place.id}\`${isRoot}`;
                }).join('\n\n');
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('🎮 Roblox Experience & Sub-Places')
            .addFields(
                { name: '📍 Main Place ID', value: `\`${startPlaceId}\``, inline: true },
                { name: '🌌 Universe ID', value: `\`${universeId}\``, inline: true },
                { name: '🗺️ Found Sub-Places / Levels', value: placeListString, inline: false }
            )
            .setColor('#00AAFF')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ Failed to pull sub-places from the Roblox API. Try again in a moment.');
    }
}

export default { data, execute };
