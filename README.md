# SociaVault MCP Server

Give your AI assistant live access to social media data. This [Model Context Protocol](https://modelcontextprotocol.io) server lets Claude, Cursor, Cline, VS Code, and any MCP-compatible client pull real-time data from 11 platforms — profiles, posts, comments, transcripts, search, trends, and ad libraries — through natural language.

**Powered by [SociaVault](https://sociavault.com)** — a reliable social media data API for developers.

[![npm version](https://img.shields.io/npm/v/sociavault-mcp.svg)](https://www.npmjs.com/package/sociavault-mcp)

<a href="https://glama.ai/mcp/servers/@olamide-olaniyan/sociavault-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@olamide-olaniyan/sociavault-mcp/badge" alt="SociaVault Server MCP server" />
</a>

## Highlights

- **107 tools** across TikTok, Instagram, YouTube, Twitter/X, LinkedIn, Facebook, Reddit, Threads, Pinterest, Twitch, and Google.
- **Ad library coverage** — TikTok, Meta (Facebook/Instagram), Google, and LinkedIn ad libraries for competitor research.
- **Zero install** — runs via `npx`, no global install needed.
- **Token-efficient** — responses are trimmed by default to keep your context window lean.
- **Built on the modern MCP SDK** (1.x) with typed inputs, structured output, and clear error messages.

## Quick start

### 1. Get an API key

Sign up at [sociavault.com](https://sociavault.com/signup) — new accounts get free credits to start. Copy your key (format `sk_live_…`) from the [dashboard](https://sociavault.com/dashboard).

### 2. Add the server to your client

The server runs with `npx`, so there's nothing to install. Just add the config below and set your API key.

#### Claude Desktop

Edit your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sociavault": {
      "command": "npx",
      "args": ["-y", "sociavault-mcp"],
      "env": {
        "SOCIAVAULT_API_KEY": "sk_live_your_key_here"
      }
    }
  }
}
```

Restart Claude Desktop.

#### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per-project):

```json
{
  "mcpServers": {
    "sociavault": {
      "command": "npx",
      "args": ["-y", "sociavault-mcp"],
      "env": { "SOCIAVAULT_API_KEY": "sk_live_your_key_here" }
    }
  }
}
```

#### VS Code (Copilot)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sociavault": {
      "command": "npx",
      "args": ["-y", "sociavault-mcp"],
      "env": { "SOCIAVAULT_API_KEY": "sk_live_your_key_here" }
    }
  }
}
```

#### Cline / other clients

Any client that supports stdio MCP servers works — point it at the command `npx -y sociavault-mcp` with `SOCIAVAULT_API_KEY` in the environment.

## Configuration

| Environment variable | Required | Description |
|----------------------|----------|-------------|
| `SOCIAVAULT_API_KEY` | Yes | Your SociaVault API key (`sk_live_…`). |
| `SOCIAVAULT_BASE_URL` | No | Override the API base URL. Defaults to `https://api.sociavault.com`. |

## Usage examples

Once configured, ask your assistant things like:

- "Get the TikTok profile and last 20 videos for @charlidamelio."
- "Search the Meta Ad Library for active ads from Nike in the US."
- "Pull the transcript of this YouTube video: <url>."
- "What's trending on TikTok in the US right now?"
- "Find Instagram reels using this audio id and summarize the top performers."
- "Search Reddit for mentions of my product in the last week."
- "Get the comments on this tweet and summarize the sentiment."

## Tools

All tools are read-only. Most accept a `trim` flag (default `true`) that returns a smaller, AI-friendly payload; set `trim: false` for the full raw response. List endpoints accept a pagination cursor returned in the previous response.

### TikTok
`tiktok_profile`, `tiktok_demographics`, `tiktok_videos`, `tiktok_video_info`, `tiktok_transcript`, `tiktok_live`, `tiktok_comments`, `tiktok_comment_replies`, `tiktok_following`, `tiktok_followers`, `tiktok_search_users`, `tiktok_search_hashtag`, `tiktok_search_keyword`, `tiktok_search_music`, `tiktok_search_top`, `tiktok_music_popular`, `tiktok_music_details`, `tiktok_music_videos`, `tiktok_trending`, `tiktok_creators_popular`, `tiktok_videos_popular`, `tiktok_hashtags_popular`

### TikTok Shop
`tiktok_shop_products`, `tiktok_shop_product_details`, `tiktok_shop_search`, `tiktok_shop_product_reviews`

### TikTok Ad Library
`tiktok_ad_library_search`, `tiktok_ad_library_ad`

### Instagram
`instagram_profile`, `instagram_posts`, `instagram_post_info`, `instagram_transcript`, `instagram_comments`, `instagram_reels`, `instagram_highlights`, `instagram_highlight_detail`, `instagram_reels_by_song`

### YouTube
`youtube_channel`, `youtube_channel_videos`, `youtube_channel_shorts`, `youtube_video`, `youtube_video_transcript`, `youtube_search`, `youtube_search_hashtag`, `youtube_video_comments`, `youtube_video_comment_replies`, `youtube_shorts_trending`, `youtube_channel_playlists`, `youtube_channel_lives`, `youtube_channel_community_posts`

### Twitter / X
`twitter_profile`, `twitter_user_tweets`, `twitter_user_tweets_all`, `twitter_tweet`, `twitter_tweet_transcript`, `twitter_comments`, `twitter_quotes`, `twitter_retweets`, `twitter_search`, `twitter_followers`, `twitter_followings`, `twitter_community`, `twitter_community_tweets`

### LinkedIn
`linkedin_profile`, `linkedin_company`, `linkedin_post`

### LinkedIn Ad Library
`linkedin_ad_library_search`, `linkedin_ad_library_ad_details`

### Facebook
`facebook_profile`, `facebook_profile_posts`, `facebook_comment_replies`, `facebook_profile_reels`, `facebook_group_posts`, `facebook_post`, `facebook_post_transcript`, `facebook_post_comments`

### Facebook Ad Library
`facebook_ad_library_ad_details`, `facebook_ad_library_search`, `facebook_ad_library_company_ads`, `facebook_ad_library_search_companies`

### Facebook Marketplace
`facebook_marketplace_location_search`, `facebook_marketplace_search`, `facebook_marketplace_item`

### Google
`google_search`, `google_ad_library_company_ads`, `google_ad_library_ad_details`, `google_ad_library_search_advertisers`

### Reddit
`reddit_subreddit_details`, `reddit_subreddit`, `reddit_subreddit_search`, `reddit_post_comments`, `reddit_post_transcript`, `reddit_search`

### Threads
`threads_profile`, `threads_user_posts`, `threads_post`, `threads_search`, `threads_search_users`

### Pinterest
`pinterest_search`, `pinterest_pin`, `pinterest_user_boards`, `pinterest_board`

### Twitch
`twitch_profile`, `twitch_user_videos`, `twitch_user_schedule`, `twitch_clip`

### Account
`check_credits` — check your remaining credit balance.

## Pricing

The MCP server is free and open source. You only pay for the SociaVault API usage it makes, billed as **credits** (each API call costs credits depending on the endpoint).

- **Free** — credits included on signup, no card required.
- **Credit packs** — Starter ($29), Growth ($79), Pro ($199), and Enterprise ($399), each granting a larger bundle of credits.

Credits don't expire on a monthly cycle — you buy a pack and draw it down. See the current packs and credit amounts at [sociavault.com/pricing](https://sociavault.com/pricing), and check your balance any time with the `check_credits` tool.

## Troubleshooting

**"Missing SOCIAVAULT_API_KEY"** — Add your key to the `env` block of the MCP config and restart the client.

**"Authentication failed (401)"** — Your key is wrong or expired, or it's not in the `sk_live_…` format. Generate a fresh one in the [dashboard](https://sociavault.com/dashboard).

**"Out of credits (402)"** — Top up at [sociavault.com/pricing](https://sociavault.com/pricing).

**"Not found (404)"** — The handle/URL is wrong, or the account/content is private or deleted.

**Server not showing up** — Make sure Node.js 18+ is installed and on your PATH, confirm the JSON config is valid, and fully restart the client. Most clients have an MCP log panel that shows startup errors.

## Development

```bash
git clone https://github.com/olamide-olaniyan/sociavault-mcp.git
cd sociavault-mcp
npm install
npm run build

# Run locally
SOCIAVAULT_API_KEY=sk_live_your_key node dist/index.js
```

Adding a new endpoint is a single entry in `src/endpoints.ts` — the server registers every entry automatically.

## Links

- **Website**: [sociavault.com](https://sociavault.com)
- **API docs**: [docs.sociavault.com](https://docs.sociavault.com)
- **Support**: support@sociavault.com

## License

MIT — see [LICENSE](LICENSE).
