# SociaVault MCP Server

**Social media data for AI agents.** This [Model Context Protocol](https://modelcontextprotocol.io) server gives Claude, Cursor, VS Code, Windsurf, Kiro and any other MCP client live, read-only access to public data from TikTok, Instagram, YouTube, X (Twitter), LinkedIn, Facebook, Reddit, Threads, Pinterest, Twitch and Google, plus the TikTok, Meta, Google and LinkedIn ad libraries.

Ask in plain language, for example "pull the last 20 TikTok videos from @nasa and rank them by views", and your agent calls the right endpoint and gets structured JSON back. It runs on the [SociaVault social media scraping API](https://sociavault.com), so there's no scraper to host, no browser to run and no login involved. Public data only.

[![npm version](https://img.shields.io/npm/v/sociavault-mcp.svg)](https://www.npmjs.com/package/sociavault-mcp)
[![npm downloads](https://img.shields.io/npm/dm/sociavault-mcp.svg)](https://www.npmjs.com/package/sociavault-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<a href="https://glama.ai/mcp/servers/@olamide-olaniyan/sociavault-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@olamide-olaniyan/sociavault-mcp/badge" alt="SociaVault Server MCP server" />
</a>

## Highlights

- **107 tools**, one per endpoint, so the agent asks for exactly what it needs (`tiktok_profile`, `instagram_comments`, `youtube_video_transcript`) instead of scraping a page and guessing.
- **Ad library coverage** for competitor research: TikTok, Meta (Facebook and Instagram), Google and LinkedIn.
- **Zero install.** Runs through `npx`, nothing to install globally.
- **Token-efficient.** Responses are trimmed by default to keep your context window lean.
- **Listed in the official [MCP Registry](https://registry.modelcontextprotocol.io)** as `io.github.olamide-olaniyan/sociavault-mcp`.
- **Built on the modern MCP SDK** (1.x) with typed inputs, structured output and clear error messages.

## What you can build

- **Influencer research agents** that pull profile stats, recent posts and comments across TikTok, Instagram and YouTube, then flag accounts worth a closer look.
- **Competitor and ad monitoring**: what a brand is running in the Meta, TikTok, Google and LinkedIn ad libraries, and how its organic posts perform.
- **Content research and RAG**: transcripts of TikTok, Instagram, YouTube, X and Facebook videos for summaries, notes or a knowledge base.
- **Brand monitoring**: search Reddit, Threads and X for mentions and summarize the sentiment.
- **Trend tracking**: the TikTok trending feed, popular sounds and hashtags, and trending YouTube Shorts.

## Quick start

### 1. Get an API key

Sign up at [sociavault.com](https://sociavault.com/signup). New accounts get 50 free credits, no card required. Copy your key (format `sk_live_...`) from the [dashboard](https://sociavault.com/dashboard).

### 2. Add the server to your client

The server runs with `npx`, so there's nothing to install. Add the config for your client and set your API key.

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

Then restart Claude Desktop.

#### Claude Code

```bash
claude mcp add sociavault -e SOCIAVAULT_API_KEY=sk_live_your_key_here -- npx -y sociavault-mcp
```

#### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

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

#### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

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

#### Kiro

Add to `.kiro/settings/mcp.json` in your workspace, or `~/.kiro/settings/mcp.json` for all workspaces:

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

#### Cline and other clients

Any client that supports stdio MCP servers works. Point it at the command `npx -y sociavault-mcp` with `SOCIAVAULT_API_KEY` set in the environment.

## Configuration

| Environment variable | Required | Description |
|----------------------|----------|-------------|
| `SOCIAVAULT_API_KEY` | Yes | Your SociaVault API key (`sk_live_...`). |
| `SOCIAVAULT_BASE_URL` | No | Override the API base URL. Defaults to `https://api.sociavault.com`. |

## Usage examples

Once it's configured, ask your assistant things like:

- "Get the TikTok profile and last 20 videos for @charlidamelio."
- "Search the Meta Ad Library for active ads from Nike in the US."
- "Pull the transcript of https://www.youtube.com/watch?v=dQw4w9WgXcQ and summarize it."
- "What's trending on TikTok in the US right now?"
- "Find Instagram reels using this audio and summarize the top performers."
- "Search Reddit for mentions of my product in the last week."
- "Get the comments on this tweet and tell me what people are complaining about."

## Tools

All tools are read-only. Most accept a `trim` flag (default `true`) that returns a smaller, AI-friendly payload; set `trim: false` for the full raw response. List endpoints accept the pagination cursor returned in the previous response.

| Platform | Tools |
|----------|-------|
| TikTok | 22 |
| TikTok Shop | 4 |
| TikTok Ad Library | 2 |
| Instagram | 9 |
| YouTube | 13 |
| Twitter / X | 13 |
| LinkedIn | 3 |
| LinkedIn Ad Library | 2 |
| Facebook | 8 |
| Facebook Ad Library | 4 |
| Facebook Marketplace | 3 |
| Google (search and ad library) | 4 |
| Reddit | 6 |
| Threads | 5 |
| Pinterest | 4 |
| Twitch | 4 |
| Account | 1 |

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
`check_credits` checks your remaining credit balance.

## Pricing

The MCP server is free and open source. You only pay for the SociaVault API calls it makes, billed in **credits**. Most calls cost 1 credit.

- **Free**: 50 credits on signup, no card required.
- **Starter**: $29 for 6,000 credits.
- **Growth**: $79 for 20,000 credits.
- **Pro**: $199 for 75,000 credits.
- **Enterprise**: $399 for 200,000 credits.

Credits never expire, so you buy a pack and draw it down at your own pace. See the current packs at [sociavault.com/pricing](https://sociavault.com/pricing), and check your balance any time with the `check_credits` tool.

## Troubleshooting

**"Missing SOCIAVAULT_API_KEY"**: add your key to the `env` block of the MCP config and restart the client.

**"Authentication failed (401)"**: the key is wrong, expired or not in the `sk_live_...` format. Generate a fresh one in the [dashboard](https://sociavault.com/dashboard).

**"Out of credits (402)"**: top up at [sociavault.com/pricing](https://sociavault.com/pricing).

**"Not found (404)"**: the handle or URL is wrong, or the account or content is private or deleted.

**Server not showing up**: make sure Node.js 18+ is installed and on your PATH, check that the JSON config is valid, and fully restart the client. Most clients have an MCP log panel that shows startup errors.

## Development

```bash
git clone https://github.com/olamide-olaniyan/sociavault-mcp.git
cd sociavault-mcp
npm install
npm run build

# Run locally
SOCIAVAULT_API_KEY=sk_live_your_key node dist/index.js
```

Adding a new endpoint is a single entry in `src/endpoints.ts`. The server registers every entry automatically.

## Links

- **Website**: [sociavault.com](https://sociavault.com)
- **API docs**: [docs.sociavault.com](https://docs.sociavault.com)
- **MCP setup guide**: [Social media MCP server guide](https://sociavault.com/blog/social-media-mcp-server)
- **Compare scraping APIs**: [The best social media scraping APIs in 2026](https://sociavault.com/blog/best-social-media-scraping-apis-2026)
- **Support**: support@sociavault.com

## License

MIT. See [LICENSE](LICENSE).
