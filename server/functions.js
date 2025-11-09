const express = require('express');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

const app = express();
const event = new EventEmitter();
const requests = new Map(); 

const API_KEY = 'ROVER_KEY'; 

app.use(express.json());
app.listen(2000, () => console.log('API server running on port 2000'));

app.get('/requests', (req, res) => {
  const obj = Object.fromEntries(requests.entries());
  res.json(obj);
});

app.post('/requests', (req, res) => {
  res.sendStatus(200);
  event.emit('REQUEST', req.body);
});

app.post('/requests/taken', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing request id" });
  }
  
  // Find the request by id in the map
  let foundKey = null;
  for (const [username, request] of requests.entries()) {
    if (request.id === id) {
      foundKey = username;
      break;
    }
  }
  
  if (foundKey === null) {
    // Request not found or already taken
    return res.status(409).json({ error: "Request not found or already taken" });
  }
  
  // Remove the request to mark it taken
  requests.delete(foundKey);
  
  // Return success
  res.json({ success: true });
});


function removeRequest(username) {
  requests.delete(username);
}

async function getRobloxUsernameFromDiscordId(discordId, guildId) {
  try {
    const res = await fetch(`https://registry.rover.link/api/guilds/${guildId}/discord-to-roblox/${discordId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    if (!res.ok) {
      const error = await res.json();
      console.error("RoVer API Error:", error.message || res.statusText);
      return null;
    }
    const data = await res.json();
    return data.cachedUsername || null;
  } catch (err) {
    console.error("Failed to fetch Roblox username:", err);
    return null;
  }
}

async function getDiscordIdFromRobloxUsername(robloxId, guildId) {
  try {
    console.log(`https://registry.rover.link/api/guilds/${guildId}/roblox-to-discord/${robloxId}`)
    const res = await fetch(`https://registry.rover.link/api/guilds/${guildId}/roblox-to-discord/${robloxId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("RoVer API Error:", error.message || res.statusText);
      return null;
    }

    const data = await res.json();
    return data.discordUsers[0].user.id || null;

  } catch (err) {
    console.error("Failed to fetch Discord ID:", err);
    return null;
  }
}

async function SendRequest(username, args, interaction) {
  await interaction.deferReply();

  args.moderator = await getRobloxUsernameFromDiscordId(interaction.user.id, interaction.guild.id)
    || interaction.member.nickname
    || interaction.user.username;

  args.id = uuidv4();
  
  requests.set(username, args);

  await interaction.followUp('Got it! Your command is on its way and will be executed in the Roblox game shortly.');

  // Timeout fallback (e.g., 30 seconds)
  const timeoutMs = 30000;
  let timeout;

  return new Promise((resolve) => {
    const listener = (table) => {
      if (table.username === username) {
        clearTimeout(timeout);
        removeRequest(username);
        try {
          interaction.editReply(`Mashallah 3layk! Your command was executed successfully on game \`${table.guild}\``);
        } catch (err) {
          console.error('Failed to edit interaction reply:', err);
        }
        event.removeListener('REQUEST', listener);
        resolve();
      }
    };

    // If no event is received in timeoutMs, send timeout message
    timeout = setTimeout(() => {
      event.removeListener('REQUEST', listener);
      removeRequest(username);
      try {
        interaction.editReply('Sorry, the command timed out. Please try again later.');
      } catch (err) {
        console.error('Failed to edit interaction reply after timeout:', err);
      }
      resolve();
    }, timeoutMs);

    event.once('REQUEST', listener);
  });
}

module.exports = {
  SendRequest,
  requests,
  event,
  getDiscordIdFromRobloxUsername
};
