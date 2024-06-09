const {
    Client,
    Events,
    GatewayIntentBits,
    Partials,
    ButtonStyle,
    WebhookClient,
    ButtonBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    Webhook
} = require('discord.js');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./messages.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Successfully connected to the database.');
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT
        )`);
    }
});

const token = process.env.DISCORD_TOKEN;

const CUSINI_CHANNEL_ID = '622019376027271178';
let webhook;
let responseProbability = 0.05;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

client.once(Events.ClientReady, async c => {
    console.log(`Нагиев готов. Залогинен как: ${c.user.tag}`);

    var channel = await client.channels.fetch('1006909946237042738');

    const webhooks = await channel.fetchWebhooks();
    webhook = webhooks.find(wh => wh.name === 'nagiev-webhook');

    if (!webhook) {
        webhook = await channel.createWebhook({
            name: 'nagiev-webhook',
            avatar: 'https://i.imgur.com/AfFp7pu.png',
        })
            .then(webhook => console.log(`Вебхук создан: ${webhook.name}`))
            .catch(console.error);
    }

});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        if (reaction.emoji.name === '📌' && reaction.message.channel.id === CUSINI_CHANNEL_ID) {
            const users = await reaction.users.fetch();

            if (users.size !== 1) return;

            const guild = client.guilds.cache.get('336164923983921163');
            const channel = guild.channels.cache.get(CUSINI_CHANNEL_ID);
            const pinMessage = await channel.messages.fetch(reaction.message.id);

            console.log(`${user.username} закрепил сообщение: ${pinMessage.id}`);

            const redirectButton = new ButtonBuilder()
                .setLabel('Перейти к сообщению')
                .setStyle(ButtonStyle.Link)
                .setURL(pinMessage.url);

            const row = new ActionRowBuilder()
                .addComponents(redirectButton);

            const files = [...pinMessage.attachments.values()].map(attachment => ({
                attachment: attachment.url,
                name: attachment.name
            }));

            await webhook.send({
                content: pinMessage.content,
                username: pinMessage.author.username,
                avatarURL: pinMessage.author.displayAvatarURL(),
                files: files,
                components: [row],

            });
        }
        if (reaction.emoji.name === '❌') {
            if (reaction.message.channel.id === '1006909946237042738') {
                reaction.message.delete();
            }
        }
    } catch (error) {
        console.error(`An error occurred:`, error);
    }
});

client.on(Events.MessageCreate, async message => {
    if (message.channel.id != CUSINI_CHANNEL_ID) return;
    if (message.author.bot) return;

    // Insert recent messages into the database
    const stmt = db.prepare("INSERT INTO messages (content) VALUES (?)");
    stmt.run(message.content, (err) => {
        if (err) {
            return console.error('Error inserting message:', err.message);
        }
        console.log('Message saved:', message.content);
    });
    stmt.finalize();

    const contentLower = message.content.toLowerCase();
    const setChanceRegex = /^нагиев шанс (\d+)$/;
    // const names = ['нагиев', 'дима', 'дмитрий', 'димка', 'димусь', 'дим', 'димасик'];
    //
    // if (names.some(n => contentLower.includes(n))) {
    //     fetchRandomMessage(message);
    //     return;
    // }


    if (contentLower === 'сколько стоит любовь') {
        message.channel.send('двадцать восемь мультов');
        console.log(`${message.author.username} использовал сколько стоит любовь`);
        return;
    } else if (contentLower === 'нагиев почаще') {
        responseProbability = Math.min(responseProbability + 0.05, 1.0); // max 100%
        message.channel.send(`=БАМ БАМ БАМ= chance =  ${Math.round(responseProbability * 100)}%`);
        return;
    } else if (contentLower === 'нагиев потише') {
        responseProbability = Math.max(responseProbability - 0.05, 0.0); // min 0%
        message.channel.send(`=ДЕДУ НАДО ВЫЙТИ= chance =  ${Math.round(responseProbability * 100)}%`);
        return;
    } else if (setChanceRegex.test(contentLower)) {
        const match = contentLower.match(setChanceRegex);
        const chance = parseInt(match[1], 10);

        if (chance >= 0 && chance <= 100) {
            responseProbability = chance / 100;
            message.channel.send(`=ШАНС УСТАНОВЛЕН= chance = ${chance}%`);
            return;
        } else {
            message.channel.send('Число должно быть между 0 и 100.');
            return;
        }
    }

    if (Math.random() < responseProbability) {
        fetchRandomMessage(message);
    }
});

const fetchRandomMessage = (message) => {
    const randomId = Math.floor(Math.random() * 692100) + 1;
    db.get("SELECT content FROM messages WHERE id = ? AND content IS NOT NULL AND content != ''", [randomId], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (row) {
            if (row.content.trim() === '') {
                fetchRandomMessage(message);
            } else {
                message.channel.send(row.content);
            }
        } else {
            fetchRandomMessage(message);
        }
    });
};

client.login(token);