const { Client, Events, GatewayIntentBits, Partials, EmbedBuilder, ButtonBuilder, Component, ButtonStyle,
    Embed, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, StreamType, AudioPlayerStatus,
    entersState } = require('@discordjs/voice');

const config = require('./config.json');
const token = config.token;
const file = new AttachmentBuilder('./resources/audio/DmitriyNagiev.mp3')

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
    // // When a reaction is received, check if the structure is partial
    // if (reaction.partial) {
    //     try {
    //         await reaction.fetch(); 
    //     } catch (error) {
    //         console.error('Something went wrong when fetching the message:', error);
    //         return;
    //     }
    // }
    if (reaction.emoji.name === '📌' && reaction.message.channel.id === '622019376027271178') {
        // Get the guild and the channel
        console.log(`${user.username} закрепил сообщение`);
        const guild = client.guilds.cache.get('336164923983921163');
        const channel = guild.channels.cache.get('622019376027271178');

        // Get the message
        const pinMessageID = await channel.messages.fetch(reaction.message.id);
        const pinMessage = await channel.messages.fetch(reaction.message);
        /* const regex = /(https?:\/\/(?:www\.)?youtu(?:\.be\/|be\.com\/(?:watch(?:\/|\/?\?(?:\S*&)?v=)|v\/|embed\/|user\/(?:[^/]+\#p\/u\/|[^/]+\/[^/]+\/)))([^"&?\/\s]{11}))/gi;
        const matches = pinMessage.content.match(regex); */

        /*  let url = null;
         if (matches && matches.length > 0) {
             url = matches[0];
         } */


        // Check if it's the first pin reaction
        if (pinMessageID.reactions.cache.get('📌').count === 1) {
            const targetChannel = guild.channels.cache.get('1006909946237042738');

            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#2f3136')
                .setAuthor({ name: pinMessage.author.username, iconURL: pinMessage.author.avatarURL() })
                .setTimestamp(pinMessage.createdTimestamp);

            // if (url) {
            //     embed.setURL(url);
            // }

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
    if (message.content.toLowerCase().includes('вы все гавно')) {
        // const channel = message.member.voice.channel;
        // const connection = joinVoiceChannel({
        //     channelId: channel.id,
        //     guildId: channel.guild.id,
        //     adapterCreator: channel.guild.voiceAdapterCreator,
        // });
        // const resource = createAudioResource('./resources/audio/DmitriyNagiev.mp3');

        //     player.play(resource);
        //     await entersState(player, AudioPlayerStatus.Idle, 30e3);
        //     player.on('error', error => {
        //         console.error(`Ошибка в аудио плеере: ${error.message}`)
        //     });
        //     connection.subscribe(player);
        //     // message.channel.send({ files: [file] });
        message.channel.send({files: [file]});




    }
});

client.login(token);

