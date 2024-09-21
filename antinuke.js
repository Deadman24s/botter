const { PermissionsBitField } = require('discord.js');

// Anti-nuke configuration (tweak these based on your preferences)
const ANTI_NUKE_THRESHOLD = 3;  // Number of kicks/bans allowed before action is taken
const TIME_WINDOW = 60000;  // Time window in milliseconds (e.g., 1 minute)
const ACTION = 'ban';  // What to do to the offender (ban/kick)

let userActions = {};  // To store the number of actions taken by each user

/**
 * Anti-nuke system to prevent mass-kicking or banning.
 * @param {Client} client - The Discord.js client.
 */
function setupAntiNuke(client) {
    client.on('guildMemberRemove', async (member) => {
        try {
            const auditLogs = await member.guild.fetchAuditLogs({
                type: 'MEMBER_KICK',
                limit: 1
            });
            const kickLog = auditLogs.entries.first();
            if (!kickLog) return;
            const { executor } = kickLog;

            // Check for mass kicks
            handleAction(member.guild, executor.id, 'kick', client);
        } catch (err) {
            console.error('Error fetching audit logs for kicks:', err);
        }
    });

    client.on('guildBanAdd', async (ban) => {
        try {
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: 'MEMBER_BAN_ADD',
                limit: 1
            });
            const banLog = auditLogs.entries.first();
            if (!banLog) return;
            const { executor } = banLog;

            // Check for mass bans
            handleAction(ban.guild, executor.id, 'ban', client);
        } catch (err) {
            console.error('Error fetching audit logs for bans:', err);
        }
    });
}

/**
 * Handle a user's actions (kick or ban) and check if they exceed the threshold.
 * @param {Guild} guild - The Discord guild (server).
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} actionType - The type of action (kick/ban).
 * @param {Client} client - The Discord.js client.
 */
async function handleAction(guild, userId, actionType, client) {
    const currentTime = Date.now();

    if (!userActions[userId]) {
        userActions[userId] = [];
    }

    userActions[userId].push(currentTime);

    // Remove any actions that happened outside the time window
    userActions[userId] = userActions[userId].filter(timestamp => currentTime - timestamp < TIME_WINDOW);

    // If the user exceeds the threshold, take action
    if (userActions[userId].length >= ANTI_NUKE_THRESHOLD) {
        const offender = await guild.members.fetch(userId);
        if (offender) {
            if (ACTION === 'ban') {
                await offender.ban({ reason: 'Anti-Nuke: Mass kicks/bans detected.' });
                console.log(`Banned ${offender.user.tag} for mass ${actionType}.`);
            } else if (ACTION === 'kick') {
                await offender.kick('Anti-Nuke: Mass kicks/bans detected.');
                console.log(`Kicked ${offender.user.tag} for mass ${actionType}.`);
            }
        }

        // Reset the action log for that user
        userActions[userId] = [];
    }
}

module.exports = { setupAntiNuke };
