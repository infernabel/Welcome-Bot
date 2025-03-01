/*

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
                                                 
  _________ ___ ___ ._______   _________    
 /   _____//   |   \|   \   \ /   /  _  \   
 \_____  \/    ~    \   |\   Y   /  /_\  \  
 /        \    Y    /   | \     /    |    \ 
/_______  /\___|_  /|___|  \___/\____|__  / 
        \/       \/                     \/  
                    
DISCORD :  https://discord.com/invite/xQF9f9yUEM                   
YouTube : https://www.youtube.com/@GlaceYT                         

Website        : ssrr.tech  
Test Passed    : ✓

☆.。.:*・°☆.。.:*・°☆.。.:*・°☆.。.:*・°☆
*/

const { REST, Routes, ActivityType } = require("discord.js");
require("dotenv").config();
const fs = require("fs");
const config = require("../config.js");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);

        console.log(`🚀 Version :  v1.2 
📅 ${new Date().toLocaleString()}
💻 Developed by: GlaceYT`);
        async function updateStatus() {
            const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalServers = client.guilds.cache.size;

            let statusMessage;
            switch (config.statusContent) {
                case "A":
                    statusMessage = `${totalUsers.toLocaleString()} Users`;
                    break;
                case "B":
                    statusMessage = `${totalServers.toLocaleString()} Servers`;
                    break;
                case "C":
                    statusMessage = config.customStatus || "/help";
                    break;
                default:
                    statusMessage = "🚀 Running smooth!";
            }

            client.user.setActivity(statusMessage, { type: config.statusType });
            //console.log(`🔄 Updated Status: ${statusMessage}`);
        }
        let activityOptions = { type: config.statusType };


        if (config.statusType === ActivityType.Streaming) {
            if (config.streamingURL && config.streamingURL.startsWith("https://www.twitch.tv/")) {
                activityOptions.url = config.streamingURL;
            } else {
                console.warn("⚠ Invalid streaming URL! Must be a valid Twitch URL.");
                activityOptions.type = ActivityType.Playing;
            }
        }

        updateStatus();
        setInterval(updateStatus, 10 * 1000);


        client.invites = new Map();
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const invites = await guild.invites.fetch();
                client.invites.set(guildId, new Map(invites.map(invite => [invite.code, { inviterId: invite.inviter?.id || "Unknown", uses: invite.uses }])));
            } catch (error) {
                console.error(`❌ Error fetching invites for ${guild.name}:`, error);
            }
        }


        const CLIENT_ID = client.user.id;
        const commands = [];
        const commandFolders = fs.readdirSync("./commands");

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith(".js"));
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                commands.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || config.token);
        try {
            console.log("🔄 Refreshing Slash Commands...");
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
            console.log("✅ Commands Successfully Deployed!");
        } catch (error) {
            console.error("❌ Error Deploying Commands:", error);
        }
    }
};


