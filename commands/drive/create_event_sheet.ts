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
      return interaction.editReply({
        content: `L'événement n'existe pas`,
      });
    }
    await interaction.editReply({
      content: `Récupération de l'événement...`,
    });
    const event = await interaction.guild!.scheduledEvents.fetch(eventId);
    if (!event) {
      return interaction.editReply({
        content: `L'événement n'existe pas`,
      });
    }
    const sheet_name =
      interaction.options.getString('sheet_name') ?? event.name;

    const googleEvent = event
      .description!.match(/kotick@\w*/)?.[0]
      .split('@')[1];
    if (!googleEvent) {
      return interaction.editReply({
        content: `L'événement n'est pas relié à un événement google`,
      });
    }

    const existingSheet = await db.oneOrNone<{ sheet_id: string }>(
      `
      SELECT sheet_id FROM discord.event WHERE event_id = $1 AND guild_id = $2`,
      [googleEvent, interaction.guildId],
    );
    if (existingSheet) {
      return interaction.editReply({
        content: `Une google sheet existe déjà pour cet événement : https://docs.google.com/spreadsheets/d/${existingSheet.sheet_id}
        Utilisez \`/delete_event_sheet\` si vous souhaiter la supprimer`,
      });
    }

    const { drive_folder: folderId } =
      (await db.oneOrNone(
        `SELECT drive_folder FROM discord.guild_settings WHERE guild_id = $1`,
        [interaction.guildId],
      )) ?? {};
    if (!folderId) {
      return interaction.editReply({
        content: `Aucun dossier google drive n'est enregistré pour ce serveur. Utilisez \`/drive_folder\` pour en ajouter un.`,
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
      (msg: string) =>
        interaction.editReply({
          content: msg,
        }),
    );

    await interaction.followUp({
      content: `feuille créée : https://docs.google.com/spreadsheets/d/${sheetId}
      N'oubliez pas d'utiliser \`/close_event_sheet\` pour terminer la préparation de l'événement une fois que la feuille est prête`,
    });
  },
};
