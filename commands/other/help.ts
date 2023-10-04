import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche une liste des commandes')
    .addStringOption(o =>
      o
        .addChoices({ name: 'Paramétrage du serveur', value: 'server' })
        .addChoices({ name: 'Utilisateurs', value: 'users' })
        .addChoices({ name: 'Calendrier', value: 'calendar' })
        .addChoices({ name: 'Drive', value: 'drive' })
        .setName('category')
        .setDescription('Catégorie de commandes'),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const category = interaction.options.getString('category') ?? 'help';
    const fields = [];
    switch (category) {
      case 'server':
        fields.push(
          ...[
            {
              name: '**PARAMÉTRAGE DU SERVEUR**',
              value: 'Commandes relatives au paramétrage du bot sur ce serveur',
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: '`/init_server`',
              value:
                'Première commande à utiliser. Paramètre les rôles enfant et responsable.',
            },
            {
              name: '`/channel_eclais`',
              value:
                'Paramètre le channel actuel comme à utiliser pour les rappels destinés aux éclais.',
            },
            {
              name: '`/channel_responsables`',
              value:
                'Paramètre le channel actuel comme à utiliser pour les rappels destinés aux responsables.',
            },
            {
              name: '`/drive_folder`',
              value:
                "Lie un dossier google drive pour y créer les feuilles d'activité. Pensez à partager le dossier avec `bot.kotick@gmail.com` en écriture",
            },
            {
              name: '`/prepa_acti`',
              value:
                "Active ou désactive les rappels de création d'activité, en spécifiant le nombre de jours avant le rappel",
            },
            {
              name: '`/presence_acti`',
              value:
                'Active ou désactive les demandes de présence aux éclais, en spécifiant le nombre de jours avant la demande',
            },
            {
              name: '`/rappel_acti`',
              value: "Active ou désactive les rappels d'activité le jour même",
            },
          ],
        );
        break;
      case 'users':
        fields.push(
          ...[
            {
              name: '**UTILISATEURS**',
              value: 'Commandes relatives aux utilisateurs du serveur',
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: '`/add_user`',
              value:
                "Ajoute un utilisateur à la liste des responsables, pour pouvoir le ping dans les rappels d'activité",
            },
            {
              name: '`/show_users`',
              value:
                'Montre tous les utilisateurs enregistrés comme responsables, avec leur nom et leur compte discord',
            },
          ],
        );
        break;
      case 'calendar':
        fields.push(
          ...[
            {
              name: '**CALENDRIER**',
              value:
                "Commandes relatives à l'utilisation des calendriers google",
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: '`/register_calendar`',
              value:
                'Lie un calendrier google à ce serveur. Pensez à partager le calendrier avec `bot.kotick@gmail.com`',
            },
            {
              name: '`/list_calendars`',
              value:
                'Liste tous les calendriers google qui sont reliés à ce serveur.',
            },
            {
              name: '`/remove_calendar`',
              value: 'Enlève un calendrier google de ceux liés à ce serveur.',
            },
            {
              name: '`/load_events`',
              value:
                "Charge un nombre donné d'événements depuis les calendriers google liés au serveur.",
              inline: true,
            },
          ],
        );
        break;
      case 'drive':
        fields.push(
          ...[
            {
              name: '**DRIVE**',
              value: "Commandes relatives à l'utilisation de google drive",
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: '`/create_event_sheet`',
              value:
                "Crée une feuille google pour la gestion d'une activité (comme un week-end)." +
                "Permet de lister le nombre d'activités à préparer et les responsables référents, afin d'avoir des rappels",
            },
            {
              name: '`/delete_event_sheet`',
              value:
                'Supprime le lien entre une feuille google et un événement, afin de pouvoir en recrééer une.',
            },
            {
              name: '`/close_event_sheet`',
              value:
                "Marque une feuille google comme terminée. Le bot va lire cette feuille pour générer les rappels de création d'activités",
            },
          ],
        );
        break;
      default:
        fields.push(
          ...[
            {
              name: '`**AIDE**`',
              value:
                "Utilisez `/help` avec une option pour voir l'aide relative à sa catégorie.",
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: 'Mise en place du serveur',
              value:
                'Pour mettre en place rapidement le bot sur le serveur il faut :',
            },
            {
              name: '`/init_server`',
              value: `Cette commande initialise le bot sur le serveur. C'est la première à lancer.`,
            },
            {
              name: '`/channel_eclais`',
              value:
                'Cette commande définit le channel pour les rappels éclais. Elle est à utiliser dans le channel correspondant',
            },
            {
              name: '`/channel_responsables`',
              value:
                'Cette commande définit le channel pour les rappels responsables. Elle est à utiliser dans le channel correspondant',
            },
            { name: '\u200B', value: '\u200B' },
            {
              name: '`/help Paramétrage du serveur`',
              value: `Pour la suite, regardez l'aide avec l'option "Paramétrage du serveur", ou une autre option`,
            },
            { name: '\u200B', value: '\u200B' },
          ],
        );
    }
    const embed = new EmbedBuilder()
      .setColor('#006600')
      .setTitle(category === 'help' ? 'Aide' : 'Commandes disponibles')
      .setDescription(
        category === 'help'
          ? "Comment utiliser la commande d'aide"
          : `Voici la liste des commandes disponibles`,
      )
      .addFields(fields)
      .setFooter({
        text: 'Kotick',
        iconURL:
          'https://cdn.discordapp.com/app-icons/1146507687291531349/d9aa1f23d1ce85e9fa36a58a5021f61f.png?size=4096',
      });
    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};

const oldFields = [
  { name: '\u200B', value: '\u200B' },

  { name: '\u200B', value: '\u200B' },

  { name: '\u200B', value: '\u200B' },

  { name: '\u200B', value: '\u200B' },
];
