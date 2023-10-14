import { SlashCommandBuilder } from '@discordjs/builders';
import { removeCalendar } from '../../google/calendar.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { PERM } from '../../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(0)
    .setName('remove_calendar')
    .setDescription('Supprime un calendrier.')
    .addStringOption(option =>
      option
        .setName('calendar_id')
        .setDescription("L'id du calendrier à supprimer.")
        .setRequired(true),
    ),
  perms: PERM.RESPONSABLE,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const id = interaction.options.getString('calendar_id');
    if (!id?.length) {
      await interaction.editReply({
        content: "Aucun id n'a été spécifié.",
      });
      return;
    }
    try {
      await removeCalendar(id!, interaction.guildId!);
      await interaction.editReply({
        content: `Le calendrier \`${id}\` a bien été supprimé !`,
      });
    } catch (e) {
      await interaction.editReply({
        content: `Une erreur s'est produite en supprimant le calendrier \`${id}\` !\n${e}`,
      });
    }
  },
};
