# 🎮 Discord Fortnite & Steam Sales Bot

A powerful, easy-to-use Discord bot built with Node.js that automatically posts daily Fortnite shop updates and Steam sales to your server! Includes interactive commands, scheduled posts, and health checks.

---

## ✨ Features

- 🛒 **Fortnite Shop:** Fetches and posts the daily Fortnite shop with beautiful embeds.
- 💸 **Steam Sales:** Posts a daily summary of the hottest Steam sales in your channel.
- 🕒 **Automatic Scheduling:** Sends Fortnite shop at 8:00 AM and Steam sales at 9:00 AM every day (server time).
- 💬 **Interactive Commands:**
  - `!fortnite shop` — Get the latest Fortnite shop right now
  - `!steam sales` — Get the latest Steam sales instantly
  - `!check bot` — Check if the bot is online
  - `!check healthy` — Health check for your bot setup
- 🔒 **Environment-based configuration**

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Tamlica/Steam-Fortnite-Shop-Discord-Bot
cd Steam-Fortnite-Shop-Discord-Bot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following:
```env
DISCORD_TOKEN=your-discord-bot-token
FORTNITE_API_KEY=your-fortnite-api-key
CHANNEL_ID=your-discord-channel-id
```

> **Tip:** The bot will post daily updates to the channel specified by `CHANNEL_ID`.

### 4. Start the Bot
```bash
npm start
```

---

## 🛠️ Commands

| Command            | Description                                      |
|--------------------|--------------------------------------------------|
| `!fortnite shop`   | Get the latest Fortnite shop in the channel      |
| `!steam sales`     | Get the latest Steam sales in the channel        |
| `!check bot`       | Check if the bot is online                       |
| `!check healthy`   | Health check for your bot setup                  |

---

## ⏰ Scheduled Tasks

- **Fortnite Shop:** Posts daily at **08:00 AM** (server time)
- **Steam Sales:** Posts daily at the time specified by `STEAM_SALES_CRON` (default: **09:00 AM** server time)

You can change the Steam sales schedule by setting the `STEAM_SALES_CRON` variable in your `.env` file. This uses standard [cron syntax](https://crontab.guru/). For example, to post at 7:30 AM every day:

```env
STEAM_SALES_CRON=30 7 * * *
```

---

## ⚙️ Configuration

All configuration is done via environment variables in your `.env` file:

| Variable            | Description                                |
|---------------------|--------------------------------------------|
| `DISCORD_TOKEN`     | Your Discord bot token                     |
| `FORTNITE_API_KEY`  | Your Fortnite API key                      |
| `CHANNEL_ID`        | Channel ID to post updates to              |
| `STEAM_SALES_CRON`  | Cron schedule for Steam sales (optional)   |

---

## 📦 Scripts

| Script           | Description                      |
|------------------|----------------------------------|
| `npm start`      | Start the bot                    |
| `npm run scrape-steam` | Run the Steam scraper manually |

---

## 📝 License
MIT

---

## 🙋‍♂️ Need Help?
Open an issue or pull request on [GitHub](https://github.com/yourusername/discord-fortniteapi)!