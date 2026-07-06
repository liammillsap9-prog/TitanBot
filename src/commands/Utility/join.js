import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('Generates a direct launch link to join a Roblox game')
    .addStringOption(option => 
        option.setName('link')
            .setDescription('The Roblox game URL (e.g., roblox.com/games/123456/)')
            .setRequired(true)
    );

export async function execute(interaction) {
    const gameLink = interaction.options.getString('link');

    // Pull the Place ID number cleanly out of the link
    const idMatch = gameLink.match(/games\/(\d+)/);

    if (!idMatch) {
        return interaction.reply({
            content: '❌ Invalid Roblox game link! Make sure it looks like `https://www.roblox.com/games/XXXXX/game-name`.',
            ephemeral: true
        });
    }

    const placeId = idMatch[1];

    // Create the deep-link URI that tells the computer to open the Roblox App directly
    const launchUri = `roblox://experiences/start?placeId=${placeId}`;

    const embed = new EmbedBuilder()
        .setTitle('🚀 Launch Roblox Game')
        .setDescription(`Click the button below to launch **Place ID: \`${placeId}\`** directly into your Roblox client!`)
        .setColor('#00FF7F')
        .setTimestamp();

    // Add an interactive button that holds the launch URL
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Join Game')
                .setURL(launchUri)
                .setStyle(ButtonStyle.Link)
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}

export default { data, execute };
