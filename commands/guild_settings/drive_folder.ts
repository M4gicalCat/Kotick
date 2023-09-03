import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('drive_folder')
    .setDescription('Paramètre le dossier google drive pour le serveur')
    .addStringOption(o =>
      o.setName('folder_id').setDescription('ID du dossier'),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const folderId = interaction.options.getString('folder_id');
    console.log('folderId', folderId, interaction.guildId);
    await db.one(
      `
      UPDATE discord.guild_settings
      SET drive_folder = $1
      WHERE guild_id = $2
      RETURNING drive_folder;
    `,
      [folderId || null, interaction.guildId],
    );

    await interaction.reply({
      content: `Le dossier google drive est maintenant ${folderId}. Pensez à le partager avec \`bot.kotick@gmail.com\` !`,
      ephemeral: true,
    });
  },
};
