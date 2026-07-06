import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import YouTube from 'youtube-sr';

export const data = new SlashCommandBuilder()
    .setName('videolength')
    .setDescription('Gets the length of a YouTube video')
    .addStringOption(option => 
        option.setName('url')
            .setDescription('The YouTube link')
            .setRequired(true)
    );

export async function execute(interaction) {
    const videoUrl = interaction.options.getString('url');
    await interaction.deferReply();

    try {
        const video = await YouTube.getVideo(videoUrl);

        if (!video) {
            return await interaction.editReply('❌ Could not find a video with that link.');
        }

        // Translate length from milliseconds to minutes/seconds
        const totalSeconds = Math.floor(video.duration / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedDuration = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

        const embed = new EmbedBuilder()
            .setTitle(video.title || 'YouTube Video')
            .setURL(videoUrl)
            .setDescription(`📺 **Channel:** ${video.channel?.name || 'Unknown'}`)
            .addFields(
                { name: '⏳ Length', value: `\`${formattedDuration}\``, inline: true },
                { name: '👁️ Views', value: `\`${video.views?.toLocaleString() || '0'}\``, inline: true }
            )
            .setThumbnail(video.thumbnail?.url || null)
            .setColor('#FF0000')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error(error);
        await interaction.editReply('❌ Make sure it is a valid YouTube video link!');
    }
}

export default { data, execute };
