const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const FortniteAPI = require("fortnite-api-io");
const getSteamSales = require('./steamScraper');

require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

const fortniteAPI = new FortniteAPI(FORTNITE_API_KEY);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const ITEMS_PER_PAGE = 5;

// Fetch Fortnite shop data
async function fetchFortniteShopData() {
    try {
        const shopData = await fortniteAPI.v2.getDailyShop();

        if (!shopData || !shopData.shop || shopData.shop.length === 0) {
            return null;
        }

        const shopSections = shopData.shop.map((entry) => {
            const firstGranted = entry.granted?.[0];
            const itemName = firstGranted?.name || 'Unknown Item';
            const itemPrice = entry.price?.finalPrice || 'Unknown Price';
            const itemImage = firstGranted?.images?.icon || firstGranted?.images?.featured || firstGranted?.images?.full_background || null;

            return {
                name: itemName,
                price: itemPrice,
                image: itemImage,
                rarity: entry.rarity?.name || 'Unknown Rarity',
            };
        });

        return shopSections;

    } catch (error) {
        console.error('Error fetching Fortnite shop data:', error);
        return null;
    }
}

// Send shop items with pagination
async function sendPaginatedShopMessage(channel) {
    const shopItems = await fetchFortniteShopData();
    if (!shopItems) {
        channel.send('Shop data not available right now. Please try again later.');
        return;
    }

    let currentPage = 0;

    const totalPages = Math.ceil(shopItems.length / ITEMS_PER_PAGE);

    async function sendPage(page) {
        const embed = new EmbedBuilder()
            .setTitle(`Fortnite Shop (Page ${page + 1}/${totalPages})`)
            .setColor(0x1e90ff)
            .setFooter({ text: 'Made by ChicakElite' });

        const itemsToShow = shopItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

        itemsToShow.forEach(item => {
            embed.addFields({
                name: item.name,
                value: `Price: ${item.price} V-Bucks\nRarity: ${item.rarity}`,
                inline: true,
            });

            if (item.image) {
                embed.setThumbnail(item.image);
            }
        });

        const message = await channel.send({ embeds: [embed] });

        // Add reactions for pagination
        if (totalPages > 1) {
            await message.react('◀️');
            await message.react('▶️');

            // Collect reactions for pagination
            const filter = (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
            const collector = message.createReactionCollector({ filter, time: 60000 });

            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name === '▶️' && currentPage < totalPages - 1) {
                    currentPage++;
                    sendPage(currentPage);
                } else if (reaction.emoji.name === '◀️' && currentPage > 0) {
                    currentPage--;
                    sendPage(currentPage);
                }
            });

            collector.on('end', () => {
                message.reactions.removeAll(); // Clean up reactions after the collector ends
            });
        }
    }

    sendPage(currentPage);
}

// Handle "!fortnite shop" command
client.on('messageCreate', async (message) => {
    if (message.content === '!fortnite shop') {
        try {
            const channel = message.channel;
            await sendPaginatedShopMessage(channel);
        } catch (error) {
            console.error('Error fetching shop data:', error);
            message.channel.send('An error occurred while fetching the shop data.');
        }
    }
});

// Handle "!check bot" command
client.on('messageCreate', async (message) => {
    if (message.content === '!check bot') {
        message.channel.send('Bot is Working Fine!');
    }
});

// Handle "!check healthy" command
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!check healthy') {
        console.log('Attempting to send message to channel:', CHANNEL_ID);

        try {
            const channel = await client.channels.fetch(CHANNEL_ID);

            if (!channel) {
                console.log('Channel not found!');
                message.channel.send('Channel not found. Make sure the CHANNEL_ID is correct.');
                return;
            }

            console.log('Channel found:', channel.name);

            await channel.send('Hello! This is a test message.');

        } catch (error) {
            console.error('Error sending message:', error);
            message.channel.send('An error occurred while sending the message.');
        }
    }
});

// Utility function to send Steam sales to a channel
async function sendSteamSales(channel) {
    try {
        const salesData = await getSteamSales();
        if (!salesData || salesData.length === 0) {
            channel.send('No Steam sales available at the moment. Please try again later.');
            return;
        }
        const createSalesTable = (startIndex) => {
            let salesTable = "```";
            salesTable += "🔥 Steam Sales 🔥\n\n";
            salesTable += "No  | Title                   | Discount | Original Price | Sale Price\n";
            salesTable += "----------------------------------------------------------------------\n";
            salesData.slice(startIndex, startIndex + 20).forEach((sale, index) => {
                const title = sale.title.length > 20 ? sale.title.substring(0, 20) + '...' : sale.title;
                salesTable += `${String(startIndex + index + 1).padEnd(4)}  ${title.padEnd(25)} ${sale.discount.padEnd(9)}    ${sale.originalPrice.padEnd(15)}  ${sale.salePrice}\n`;
            });
            salesTable += "```\n";
            return salesTable;
        };
        let startIndex = 0;
        while (startIndex < salesData.length) {
            const salesTable = createSalesTable(startIndex);
            await channel.send(salesTable);
            startIndex += 20;
        }
        await channel.send("[View more sales on Steam](https://store.steampowered.com/search/?category1=998%2C996&os=win&specials=1&filter=topsellers&ndl=1)");
    } catch (error) {
        console.error('Error fetching Steam sales:', error);
        channel.send('An error occurred while fetching the Steam sales.');
    }
}

// Handle "!steam sales" command
client.on('messageCreate', async (message) => {
    if (message.content === '!steam sales') {
        await sendSteamSales(message.channel);
    }
});

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    console.log(`Channel ID: ${CHANNEL_ID}`);

    const STEAM_SALES_CRON = process.env.STEAM_SALES_CRON || '5 0 * * *';
    console.log(`Steam sales cron: ${STEAM_SALES_CRON}`);

    // Schedule daily Steam sales post at adjustable time via STEAM_SALES_CRON
    const cron = require('node-cron');
    cron.schedule(STEAM_SALES_CRON, async () => {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel) {
                console.error('Steam sales cron: Channel not found!');
                return;
            }
            await sendSteamSales(channel);
        } catch (error) {
            console.error('Steam sales cron error:', error);
        }
    }, {
        timezone: "Asia/Jakarta"
    });
});

// Log in to Discord
client.login(DISCORD_TOKEN);
