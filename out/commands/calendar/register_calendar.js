import { SlashCommandBuilder } from '@discordjs/builders';
import { addCalendar } from '../../google/calendar.js';
import { PERM } from '../../utils/permissions.js';
export default {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0)
        .setName('register_calendar')
        .setDescription('Enregistre un calendrier google.')
        .addStringOption(option => option
        .setName('calendar_id')
        .setDescription("L'id du calendrier à enregistrer.")
        .setRequired(true)),
    perms: PERM.RESPONSABLE,
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true,
        });
        const id = interaction.options.getString('calendar_id');
        if (!id) {
            await interaction.editReply({
                content: "Aucun identifiant n'a été spécifié.",
            });
            return;
        }
        try {
            await addCalendar(id, interaction.guildId);
            await interaction.editReply({
                content: `Le calendrier \`${id}\` est enregistré !`,
            });
        }
        catch (e) {
            await interaction.editReply({
                content: `Une erreur s'est produite en enregistrant le calendrier \`${id}\` !\n${e}`,
            });
        }
    },
};
