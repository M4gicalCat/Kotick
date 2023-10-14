import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';
import { PERM } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channel_responsables')
    .setDescription(
      'Enregistre le channel actuel comme channel des responsables',
    ),
  perms: PERM.RESPONSABLE,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const a = await db.oneOrNone(
      `
      UPDATE discord.guild_settings SET meeting_reminders_channel = $1 WHERE guild_id = $2 RETURNING 1;
    `,
      [interaction.channelId, interaction.guildId],
    );
    if (!a) {
      interaction.editReply({
        content: `Le channel <#${interaction.channelId}> n'a pas été enregistré comme channel des responsables !
Veuillez utiliser /init_server d'abord.`,
      });
    } else {
      interaction.editReply({
        content: `Le channel <#${interaction.channelId}> est maintenant le channel des responsables !`,
      });
    }
  },
};
