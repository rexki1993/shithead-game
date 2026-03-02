# 💩 Shithead / Zweeds Pesten

Multiplayer card game — 2 to 4 players, each on their own phone.

## How to deploy on Railway (free)

### Step 1 — Upload to GitHub
1. Go to https://github.com and click the **+** button → **New repository**
2. Name it `shithead-game`, keep it **Public**, click **Create repository**
3. On the next page, click **uploading an existing file**
4. Drag and drop ALL the files from this folder (keep the folder structure!)
5. Click **Commit changes**

### Step 2 — Deploy on Railway
1. Go to https://railway.app and log in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `shithead-game` repository
4. Railway will auto-detect and deploy it (takes ~2 minutes)
5. Click **Settings** → **Networking** → **Generate Domain**
6. Copy the URL (looks like `shithead-game.up.railway.app`)

### Step 3 — Play!
1. **One person** opens the URL and taps **Create Game**
2. They share the **4-letter room code** with friends
3. **Friends** open the same URL and tap **Join Game**, enter the code
4. Swap your cards, tap **Ready**, and play!

## Game Rules (Shithead / Zweeds Pesten)

- Each player gets 3 face-down cards, 3 face-up cards, and 3 hand cards
- **Before the game**: swap hand cards with face-up cards to get the best face-up cards
- **During the game**: play cards equal to or higher than the top card
- **Special cards**:
  - **2** — resets the pile (any card can be played next)
  - **7** — next player must play 7 or lower
  - **10** — burns the entire pile (play again!)
  - **Four of a kind** — also burns the pile
- When your hand is empty, play from your face-up cards, then face-down (blind!)
- If you can't play, pick up the whole pile
- Last player with cards is the **Shithead** 💩
