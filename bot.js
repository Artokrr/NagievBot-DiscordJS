const { Client, Events, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
    },
});

client.once(Events.ClientReady, c => {
    console.log(`Нагиев готов. Залогинен как: ${c.user.tag}`);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.emoji.name === '📌' && reaction.message.channel.id === '622019376027271178') {
        const guild = client.guilds.cache.get('336164923983921163');
        const channel = guild.channels.cache.get('622019376027271178');

        // Get the message
        const pinMessageID = await channel.messages.fetch(reaction.message.id);
        const pinMessage = await channel.messages.fetch(reaction.message);

        // Check if it's the first pin reaction
        if (pinMessageID.reactions.cache.get('📌').count === 1) {
            const targetChannel = guild.channels.cache.get('1006909946237042738');

            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#2f3136')
                .setAuthor({ name: pinMessage.author.username, iconURL: pinMessage.author.avatarURL() })
                .setTimestamp(pinMessage.createdTimestamp);

            // Add content to embed
            if (pinMessage.content) {
                embed.setDescription(pinMessage.content);
            }

            // Add image to embed
            if (pinMessage.attachments.size > 0) {
                embed.setImage(pinMessage.attachments.first().url);
            }

            // Create button
            const redirectButton = new ButtonBuilder()
                .setLabel('Перейти к сообщению')
                .setStyle(ButtonStyle.Link)
                .setURL(pinMessageID.url);
            /*  const deleteButton = new ButtonBuilder()
                 .setCustomId('delete')
                 .setLabel('Удалить закреп')
                 .setStyle(ButtonStyle.Danger); */

            const row = new ActionRowBuilder().addComponents(redirectButton);

            // Send message
            await targetChannel.send({
                embeds: [embed],
                components: [row],
            });
        }
    }

    // Check if emoji is a delete emoji
    if (reaction.emoji.name === '❌') {
        if (reaction.message.channel.id === '1006909946237042738') {
            reaction.message.delete();
        }
    }
});


client.on(Events.MessageCreate, async message => {
    if (message.content.toLowerCase() === 'сколько стоит любовь') {
        message.channel.send('двадцать восемь мультов');
        console.log(`${message.author.username} использовал сколько стоит любовь`);
    }
});

client.login(token);

