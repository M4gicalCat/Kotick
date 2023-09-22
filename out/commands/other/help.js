import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche une liste des commandes'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#006600')
            .setTitle('Commandes disponibles')
            .setDescription(`Voici la liste des commandes disponibles`)
            .addFields([
            {
                name: '**PARAMÉTRAGE DU SERVEUR**',
                value: 'Commandes relatives au paramétrage du bot sur ce serveur',
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '`/init_server`',
                value: 'Première commande à utiliser. Paramètre les rôles enfant et responsable.',
            },
            {
                name: '`/channel_eclais`',
                value: 'Paramètre le channel actuel comme à utiliser pour les rappels destinés aux éclais.',
            },
            {
                name: '`/channel_responsables`',
                value: 'Paramètre le channel actuel comme à utiliser pour les rappels destinés aux responsables.',
            },
            {
                name: '`/drive_folder`',
                value: "Lie un dossier google drive pour y créer les feuilles d'activité. Pensez à partager le dossier avec `bot.kotick@gmail.com` en écriture",
            },
            {
                name: '`/prepa_acti`',
                value: "Active ou désactive les rappels de création d'activité, en spécifiant le nombre de jours avant le rappel",
            },
            {
                name: '`/presence_acti`',
                value: 'Active ou désactive les demandes de présence aux éclais, en spécifiant le nombre de jours avant la demande',
            },
            {
                name: '`/rappel_acti`',
                value: "Active ou désactive les rappels d'activité le jour même",
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '**UTILISATEURS**',
                value: 'Commandes relatives aux utilisateurs du serveur',
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '`/add_user`',
                value: "Ajoute un utilisateur à la liste des responsables, pour pouvoir le ping dans les rappels d'activité",
            },
            {
                name: '`/show_users`',
                value: 'Montre tous les utilisateurs enregistrés comme responsables, avec leur nom et leur compte discord',
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '**CALENDRIER**',
                value: "Commandes relatives à l'utilisation des calendriers google",
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '`/register_calendar`',
                value: 'Lie un calendrier google à ce serveur. Pensez à partager le calendrier avec `bot.kotick@gmail.com`',
            },
            {
                name: '`/list_calendars`',
                value: 'Liste tous les calendriers google qui sont reliés à ce serveur.',
            },
            {
                name: '`/remove_calendar`',
                value: 'Enlève un calendrier google de ceux liés à ce serveur.',
            },
            {
                name: '`/load_events`',
                value: "Charge un nombre donné d'événements depuis les calendriers google liés au serveur.",
                inline: true,
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '**DRIVE**',
                value: "Commandes relatives à l'utilisation de google drive",
            },
            { name: '\u200B', value: '\u200B' },
            {
                name: '`/create_event_sheet`',
                value: "Crée une feuille google pour la gestion d'une activité (comme un week-end)." +
                    "Permet de lister le nombre d'activités à préparer et les responsables référents, afin d'avoir des rappels",
            },
            {
                name: '`/delete_event_sheet`',
                value: 'Supprime le lien entre une feuille google et un événement, afin de pouvoir en recrééer une.',
            },
            {
                name: '`/close_event_sheet`',
                value: "Marque une feuille google comme terminée. Le bot va lire cette feuille pour générer les rappels de création d'activités",
            },
            { name: '\u200B', value: '\u200B' },
        ])
            .setFooter({
            text: 'Kotick',
            iconURL: 'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
        });
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    },
};
