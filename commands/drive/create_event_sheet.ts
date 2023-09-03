import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';
import { createSheet } from '../../google/drive.js';
import parse_event from '../../utils/parse_event.js';

export default {
  data: new SlashCommandBuilder()
    .setName('create_event_sheet')
    .setDescription("Crée une google sheet pour l'évènement")
    .addStringOption(o =>
      o
        .setName('event_link')
        .setDescription("Lien de l'événement discord")
        .setRequired(true),
    )
    .addStringOption(o =>
      o
        .setName('sheet_name')
        .setDescription('Nom de la google sheet')
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const eventId = parse_event(interaction.options.getString('event_link')!);
    if (!eventId) {
      return interaction.followUp({
        content: `L'événement n'existe pas`,
        ephemeral: true,
      });
    }
    await interaction.editReply({
      content: `Récupération de l'événement...`,
    });
    const event = await interaction.guild!.scheduledEvents.fetch(eventId);
    if (!event) {
      return interaction.followUp({
        content: `L'événement n'existe pas`,
        ephemeral: true,
      });
    }
    const sheet_name =
      interaction.options.getString('sheet_name') ?? event.name;

    const googleEvent = event
      .description!.match(/kotick@\w*/)?.[0]
      .split('@')[1];
    if (!googleEvent) {
      return interaction.followUp({
        content: `L'événement n'est pas relié à un événement google`,
        ephemeral: true,
      });
    }

    const existingSheet = await db.oneOrNone(
      `
      SELECT sheet_id FROM discord.event_sheet WHERE event_id = $1 AND guild_id = $2`,
      [eventId, interaction.guildId],
    );
    if (existingSheet) {
      return interaction.followUp({
        content: `Une google sheet existe déjà pour cet événement : https://docs.google.com/spreadsheets/d/${existingSheet}
        Utilisez \`/delete_event_sheet\` pour la supprimer`,
        ephemeral: true,
      });
    }

    const { drive_folder: folderId } =
      (await db.oneOrNone(
        `SELECT drive_folder FROM discord.guild_settings WHERE guild_id = $1`,
        [interaction.guildId],
      )) ?? {};
    if (!folderId) {
      return interaction.followUp({
        content: `Aucun dossier google drive n'est enregistré pour ce serveur. Utilisez \`/drive_folder\` pour en ajouter un.`,
        ephemeral: true,
      });
    }

    await interaction.editReply({
      content: `Création de la google sheet...`,
    });

    const sheetId = await createSheet(
      folderId,
      interaction.guildId!,
      googleEvent,
      sheet_name,
    );

    await interaction.followUp({
      content: `created sheet https://docs.google.com/spreadsheets/d/${sheetId}`,
    });
  },
};
