import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import parse_event from '../../utils/parse_event.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('delete_event_sheet')
    .setDescription("Supprime une google sheet d'un événement")
    .addStringOption(o =>
      o
        .setName('event_link')
        .setDescription("Lien de l'événement discord")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const event = parse_event(interaction.options.getString('event_link')!);
    if (!event) {
      return interaction.reply({
        content: `L'événement n'existe pas`,
        ephemeral: true,
      });
    }
    await interaction.deferReply({
      ephemeral: true,
    });
    await interaction.editReply({
      content: `Suppression de la google sheet...`,
    });
    const e = await interaction.guild!.scheduledEvents.fetch(event);
    const googleEvent = e.description!.match(/kotick@\w*/)?.[0].split('@')[1];
    if (!googleEvent) {
      return interaction.editReply({
        content: `L'événement n'est pas relié à un événement google`,
      });
    }

    await db.none(
      `UPDATE discord.event SET sheet_id = NULL WHERE event_id = $1 AND guild_id = $2`,
      [googleEvent, interaction.guildId],
    );
    interaction.editReply({
      content: `La google sheet a bien été supprimée ! Utilisez \`/create_event_sheet\` pour en créer une nouvelle.`,
    });
  },
};
