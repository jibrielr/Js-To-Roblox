# JS to Roblox

Sending commands from **JavaScript** to be executed inside a **Roblox game**. 
It can be used in any method that can make HTTP requests to a Node.js backend, but in this example, it is used with a **Discord bot** (discord.js + @sapphire/framework).

---

## ✨ Features

- Send commands from JavaScript to Roblox (Kick, Ban, Temp-Ban, Unban)
- Roblox server receives commands in real-time via polling
- Secure shared-secret authentication to prevent abuse
- RoVer account linking support (Discord → Roblox username)
- Automatic timeout with result feedback to Discord

---

## 📁 Project Structure

```
js-to-roblox/
├── server/                # Node.js backend / API
│   ├── functions.js       # Backend logic
│   └── package.json       # Node.js dependencies
│
├── roblox/                # Roblox scripts (ServerScriptService)
│   └── RequestHandler.lua # Handles requests from Roblox
│
└── README.md              # Project overview / documentation
```

---

## ⚙️ Setup Instructions

1. Clone the repository:
```sh
git clone https://github.com/YOUR-USERNAME/js-to-roblox.git
cd js-to-roblox/server
```

2. Install dependencies:
```sh
npm install
```

3. Start the server:
```sh
node functions.js
```

---

## 💬 Example Usage

You can use `SendRequest` in any JS code. Here’s an example:

```js
const { SendRequest } = require('./server/functions');

async function runExample() {
  const username = 'RobloxPlayer123';
  const args = { type: 'kick', reason: 'Breaking rules' };

  // Mock interaction object
  const interaction = {
    user: { id: 'discordUserId', username: 'DiscordUser' },
    member: { nickname: 'ModNick' },
    guild: { id: 'guildId' },
    deferReply: async () => console.log('Deferred reply'),
    followUp: async (msg) => console.log('FollowUp:', msg),
    editReply: async (msg) => console.log('EditReply:', msg),
  };

  await SendRequest(username, args, interaction);
}

runExample();
```

---

## 🛡 Security Tips

- Use a strong `SHARED_SECRET` (32+ chars)
- Never commit `.env` to GitHub
- Prefer HTTPS if deploying publicly

---

## 🤝 Contributing

Pull requests and issues are welcome.
Forking is encouraged.

---

## 📜 License
MIT
