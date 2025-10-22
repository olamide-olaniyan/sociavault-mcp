# SociaVault MCP Server

Query social media data directly in Claude Desktop, Cline, or any MCP-compatible AI client.

**Powered by [SociaVault](https://sociavault.com)** - The most reliable social media data API for developers.

## Features

✅ **Instagram** - Profiles, posts  
✅ **TikTok** - Profiles, videos  
✅ **Twitter/X** - Profiles, tweets  
✅ **Threads** - Profiles, posts  
✅ **YouTube** - Channels  
✅ **Facebook** - Profiles, pages  
✅ **Reddit** - Subreddits, posts  

All accessible directly in your AI assistant with simple natural language commands.

## Installation

### Prerequisites

1. **Get your SociaVault API key**  
   Sign up at [sociavault.com/signup](https://sociavault.com) (free tier available)

2. **Install the package**
   ```bash
   npm install -g sociavault-mcp
   ```

### Claude Desktop Setup

1. Open your Claude Desktop config:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the SociaVault MCP server:
   ```json
   {
     "mcpServers": {
       "sociavault": {
         "command": "sociavault-mcp",
         "env": {
           "SOCIAVAULT_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop

### Other MCP Clients

For Cline, Zed, or other MCP clients, refer to their documentation for adding MCP servers.

## Usage Examples

Once configured, you can ask Claude natural language questions like:

### Instagram
- "Get the Instagram profile for @nike"
- "Show me the last 20 posts from @cristiano"
- "What's Nike's follower count on Instagram?"

### TikTok
- "Get TikTok profile data for @charlidamelio"
- "Show me the latest videos from @mrbeast"
- "What's the engagement on Charli D'Amelio's TikTok?"

### Twitter/X
- "Get Twitter profile for @elonmusk"
- "Show me recent tweets from @OpenAI"
- "What's the follower count for @OpenAI?"

### Threads
- "Get Threads profile for @zuck"
- "Show me posts from @Meta on Threads"

### YouTube
- "Get YouTube channel data for @MrBeast"
- "What's the subscriber count for MrBeast?"

### Facebook
- "Get Facebook profile for https://facebook.com/nike"
- "Show me data from the Nike Facebook page"

### Reddit
- "Get posts from r/programming"
- "Show me trending posts from r/technology"

## Available Tools

The MCP server exposes these tools to AI clients:

| Tool | Description |
|------|-------------|
| `get_instagram_profile` | Get Instagram profile data (followers, bio, posts count, verification) |
| `get_instagram_posts` | Get recent Instagram posts with likes, comments, media |
| `get_tiktok_profile` | Get TikTok profile data (followers, likes, bio, videos count) |
| `get_tiktok_videos` | Get recent TikTok videos with views, likes, shares |
| `get_twitter_profile` | Get Twitter/X profile data (followers, bio, tweets count) |
| `get_twitter_tweets` | Get recent tweets with engagement metrics |
| `get_threads_profile` | Get Threads profile data (followers, bio, posts count) |
| `get_threads_posts` | Get recent Threads posts with likes, replies |
| `get_youtube_channel` | Get YouTube channel data (subscribers, videos, description) |
| `get_facebook_profile` | Get Facebook profile/page data (followers, likes, about) |
| `get_reddit_subreddit` | Get Reddit subreddit posts with upvotes, comments |

## API Limits

Depends on your SociaVault plan:

- **Free tier**: 1,000 requests/month
- **Pro**: Unlimited requests
- **Enterprise**: Custom limits + priority support

Check your usage at [sociavault.com/dashboard](https://sociavault.com/dashboard)

## Pricing

This MCP server is **free and open source**.

You only pay for SociaVault API usage:
- **Free**: $0/month (1,000 requests)
- **Pro**: $29/month (unlimited)
- **Enterprise**: Custom pricing

See full pricing at [sociavault.com/pricing](https://sociavault.com/pricing)

## Troubleshooting

### "SOCIAVAULT_API_KEY environment variable is required"

Make sure you've added your API key to the MCP config file. Get your key at [sociavault.com/signup](https://sociavault.com)

### "Authentication error: Invalid API key"

Your API key is invalid or expired. Generate a new one at [sociavault.com/dashboard](https://sociavault.com/dashboard)

### "Profile not found"

The username doesn't exist or the account is private. Try a different username.

### Server not appearing in Claude Desktop

1. Check the config file syntax is valid JSON
2. Restart Claude Desktop completely
3. Check the logs in `~/Library/Logs/Claude/mcp*.log` (macOS)

## Development

Want to contribute or run locally?

```bash
# Clone the repo
git clone https://github.com/olamide-olaniyan/sociavault-mcp.git
cd sociavault-mcp

# Install dependencies
npm install

# Build
npm run build

# Run locally (requires SOCIAVAULT_API_KEY in environment)
export SOCIAVAULT_API_KEY=your-key-here
node dist/index.js
```

## Use Cases

**For Marketers:**
- Research competitor social media strategies
- Find influencer profiles and engagement rates
- Track content performance across platforms

**For Developers:**
- Build social media analytics tools
- Integrate social data into your apps
- Prototype social listening tools

**For Researchers:**
- Analyze social media trends
- Study creator content patterns
- Track brand presence across platforms

**For Sales Teams:**
- Research prospects on social media
- Verify company social presence
- Find decision makers and influencers

## Why SociaVault?

- **99.9% uptime** - More reliable than scraping yourself
- **No rate limits** - Unlimited requests on Pro plan
- **All platforms** - Instagram, TikTok, Twitter, LinkedIn in one API
- **Always working** - We handle platform changes, you don't
- **Great docs** - Clear examples, fast support

Learn more at [sociavault.com](https://sociavault.com)

## Support

- **Documentation**: [sociavault.com/docs](https://docs.sociavault.com)
- **Email**: support@sociavault.com

## License

MIT License - see [LICENSE](LICENSE) file

---

**Built with ❤️ by the [SociaVault](https://sociavault.com) team**

Get your API key → [sociavault.com/signup](https://sociavault.com/signup)
