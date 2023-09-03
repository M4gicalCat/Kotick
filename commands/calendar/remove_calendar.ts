import { SlashCommandBuilder } from '@discordjs/builders';
import { removeCalendar } from '../../google/calendar.js';
import { ChatInputCommandInteraction } from 'discord.js';

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
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('calendar_id');
    if (!id?.length) {
      await interaction.reply({
        content: "Aucun id n'a été spécifié.",
        ephemeral: true,
        flags: 64,
      });
      return;
    }
    try {
      await removeCalendar(id!, interaction.guildId!);
      await interaction.reply({
        content: `Le calendrier \`${id}\` a bien été supprimé !`,
        ephemeral: true,
      });
    } catch (e) {
      await interaction.reply({
        content: `Une erreur s'est produite en supprimant le calendrier \`${id}\` !\n${e}`,
        ephemeral: true,
      });
    }
  },
};
