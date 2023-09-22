import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../../db/config.js';
export default {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0)
        .setName('list_calendars')
        .setDescription('Liste tous les calendriers enregistrés.'),
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true,
        });
        const calendars = await db.any(`
        SELECT calendar_id FROM discord.guild_calendar WHERE guild_id = $1
    `, [interaction.guildId]);
        if (!(calendars === null || calendars === void 0 ? void 0 : calendars.length)) {
            await interaction.editReply({
                content: "Aucun calendrier n'est enregistré.",
            });
            return;
        }
        await interaction.editReply({
            content: `${calendars.length} calendrier${calendars.length > 1 ? 's' : ''} enregistrés :\n${calendars.map((c) => `- \`${c.calendar_id}\`\n`)}`,
        });
    },
};
