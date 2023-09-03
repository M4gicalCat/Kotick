import { SlashCommandBuilder } from '@discordjs/builders';
import { addCalendar } from '../../google/calendar.js';
import { ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(0)
    .setName('register_calendar')
    .setDescription('Enregistre un calendrier google.')
    .addStringOption(option =>
      option
        .setName('calendar_id')
        .setDescription("L'id du calendrier à enregistrer.")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('calendar_id');
    if (!id) {
      await interaction.reply({
        content: "Aucun identifiant n'a été spécifié.",
        ephemeral: true,
        flags: 64,
      });
      return;
    }
    try {
      await addCalendar(id!, interaction.guildId!);
      await interaction.reply({
        content: `Le calendrier \`${id}\` est enregistré !`,
        ephemeral: true,
      });
    } catch (e) {
      await interaction.reply({
        content: `Une erreur s'est produite en enregistrant le calendrier \`${id}\` !\n${e}`,
        ephemeral: true,
      });
    }
  },
};
