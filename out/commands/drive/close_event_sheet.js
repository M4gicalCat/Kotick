import { SlashCommandBuilder } from '@discordjs/builders';
import parse_event from '../../utils/parse_event.js';
import db, { pgp } from '../../db/config.js';
import { getActivitiesFromSheet } from '../../google/sheets.js';
import { PERM } from '../../utils/permissions.js';
export default {
    data: new SlashCommandBuilder()
        .setName('close_event_sheet')
        .setDescription('Marque un événement comme terminé et le met à jour depuis une google sheet')
        .addStringOption(o => o
        .setName('event_link')
        .setDescription("Lien de l'événement discord")
        .setRequired(true)),
    perms: PERM.RESPONSABLE,
    async execute(interaction) {
        var _a, _b;
        await interaction.deferReply({
            ephemeral: true,
        });
        const eventId = parse_event(interaction.options.getString('event_link'));
        if (!eventId) {
            return interaction.editReply({
                content: `Veuillez bien préciser un lien d'événement discord`,
            });
        }
        const event = await interaction.guild.scheduledEvents.fetch(eventId);
        if (!event) {
            return interaction.editReply({
                content: `L'événement n'existe pas`,
            });
        }
        const googleEvent = (_a = event
            .description.match(/kotick@\w*/)) === null || _a === void 0 ? void 0 : _a[0].split('@')[1];
        console.log(googleEvent, interaction.guildId);
        const { sheet_id } = (_b = (await db.oneOrNone(`
      SELECT sheet_id FROM discord.event WHERE event_id = $1 AND guild_id = $2`, [googleEvent, interaction.guildId]))) !== null && _b !== void 0 ? _b : {};
        if (!sheet_id) {
            return interaction.editReply({
                content: `Cet événement n'est pas relié à une google sheet. Utilisez \`/create_event_sheet\` pour en créer une.`,
            });
        }
        await interaction.editReply({
            content: `Récupération de la google sheet...`,
        });
        const actis = await getActivitiesFromSheet(sheet_id);
        await interaction.editReply({
            content: `Création des activités...`,
        });
        const names = await db.any(`SELECT id, name FROM discord.user_name WHERE name IN ($1:csv) AND guild_id = $2`, [[...new Set(actis.flatMap(a => a.responsables))], interaction.guildId]);
        for (const acti of actis) {
            await db.none(`
        INSERT INTO discord.event_activity (event_id, activity_name, guild_id) VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [googleEvent, acti.name, interaction.guildId]);
            await db.none(`INSERT INTO discord.event_user (event_id, activity_name, user_id, guild_id) VALUES 
        ${acti.responsables
                .map(r => pgp.as.format('($1, $2, $3, $4)', [
                googleEvent,
                acti.name,
                names.find(n => n.name === r).id,
                interaction.guildId,
            ]))
                .join(', ')}
      `);
        }
        await db.none(`UPDATE discord.event SET meeting_done = true WHERE event_id = $1 AND guild_id = $2`, [googleEvent, interaction.guildId]);
        interaction.editReply({
            content: `La préparation de cet événement est maintenant terminée avec ${actis.length} activités !`,
        });
    },
};
