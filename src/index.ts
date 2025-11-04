#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_KEY = process.env.SOCIAVAULT_API_KEY;
const BASE_URL = "https://api.sociavault.com/v1/scrape";

if (!API_KEY) {
  console.error("Error: SOCIAVAULT_API_KEY required");
  process.exit(1);
}

// Helper functions to extract only essential data
function extractInstagramProfile(data: any) {
  const user = data?.data?.user || data?.user || {};
  return {
    username: user.username,
    full_name: user.full_name,
    biography: user.biography,
    followers: user.edge_followed_by?.count || 0,
    following: user.edge_follow?.count || 0,
    posts_count: user.edge_owner_to_timeline_media?.count || 0,
    is_verified: user.is_verified,
    is_private: user.is_private,
    is_business: user.is_business_account,
    external_url: user.external_url,
    profile_pic_url: user.profile_pic_url,
  };
}

function extractInstagramPosts(data: any, limit = 10) {
  const edges = data?.data?.edges || data?.edges || [];
  return edges.slice(0, limit).map((edge: any) => {
    const node = edge.node;
    return {
      shortcode: node.shortcode,
      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || "",
      likes:
        node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
      comments: node.edge_media_to_comment?.count || 0,
      timestamp: node.taken_at_timestamp,
      is_video: node.is_video,
      display_url: node.display_url,
    };
  });
}

function extractTikTokProfile(data: any) {
  const user = data?.data?.userInfo?.user || data?.user || {};
  const stats = data?.data?.userInfo?.stats || user.stats || {};
  return {
    username: user.uniqueId || user.username,
    nickname: user.nickname,
    signature: user.signature,
    followers: stats.followerCount || 0,
    following: stats.followingCount || 0,
    likes: stats.heartCount || stats.heart || 0,
    videos: stats.videoCount || 0,
    verified: user.verified,
    avatar: user.avatarLarger || user.avatarMedium,
  };
}

function extractTwitterProfile(data: any) {
  const user = data?.data?.user || data?.user || {};
  return {
    username: user.screen_name || user.username,
    name: user.name,
    description: user.description,
    followers: user.followers_count || 0,
    following: user.friends_count || 0,
    tweets: user.statuses_count || 0,
    verified: user.verified,
    profile_image: user.profile_image_url_https,
  };
}

function extractThreadsProfile(data: any) {
  const user = data?.data?.user || data?.user || {};
  return {
    username: user.username,
    name: user.full_name || user.name,
    biography: user.biography,
    followers: user.follower_count || 0,
    following: user.following_count || 0,
    threads: user.thread_count || 0,
    verified: user.is_verified,
    profile_pic_url: user.profile_pic_url,
  };
}

function extractTikTokVideos(data: any, limit = 10) {
  const videos =
    data?.data?.itemList ||
    data?.itemList ||
    data?.data?.videos ||
    data?.videos ||
    [];
  return videos.slice(0, limit).map((video: any) => {
    const stats = video.statistics || video.stats || {};
    return {
      id: video.id || video.aweme_id,
      description: video.desc || video.description || "",
      likes: stats.like_count || stats.digg_count || 0,
      comments: stats.comment_count || 0,
      shares: stats.share_count || 0,
      views: stats.play_count || stats.view_count || 0,
      timestamp: video.create_time || video.timestamp,
      duration: video.duration,
      cover: video.cover || video.video?.cover || video.cover_url,
    };
  });
}

function extractTwitterTweets(data: any, limit = 10) {
  const tweets = data?.data?.tweets || data?.tweets || data?.data || [];
  const tweetsArray = Array.isArray(tweets) ? tweets : tweets.timeline || [];
  return tweetsArray.slice(0, limit).map((tweet: any) => {
    return {
      id: tweet.id_str || tweet.id,
      text: tweet.full_text || tweet.text,
      created_at: tweet.created_at,
      retweets: tweet.retweet_count || 0,
      likes: tweet.favorite_count || tweet.like_count || 0,
      replies: tweet.reply_count || 0,
      is_retweet: tweet.retweeted || false,
    };
  });
}

function extractThreadsPosts(data: any, limit = 10) {
  const posts = data?.data?.threads || data?.threads || data?.data || [];
  const postsArray = Array.isArray(posts) ? posts : [];
  return postsArray.slice(0, limit).map((post: any) => {
    return {
      id: post.id || post.pk,
      text: post.caption?.text || post.text || "",
      likes: post.like_count || post.likes || 0,
      replies: post.replies_count || post.replies || 0,
      reposts: post.repost_count || 0,
      timestamp: post.taken_at || post.created_at,
    };
  });
}

function extractYouTubeChannel(data: any) {
  const channel = data?.data?.channel || data?.channel || data?.data || {};
  const snippet = channel.snippet || {};
  const statistics = channel.statistics || {};
  return {
    title: snippet.title || channel.title,
    description: snippet.description || channel.description || "",
    subscribers:
      parseInt(statistics.subscriberCount || statistics.subscribers || "0") ||
      0,
    videos: parseInt(statistics.videoCount || "0") || 0,
    views: parseInt(statistics.viewCount || "0") || 0,
    custom_url: channel.customUrl || snippet.customUrl,
    thumbnail:
      snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
    published_at: snippet.publishedAt || channel.publishedAt,
  };
}

function extractFacebookProfile(data: any) {
  const profile = data?.data?.profile || data?.profile || data?.data || {};
  return {
    name: profile.name,
    username: profile.username,
    about: profile.about || profile.bio || "",
    followers: profile.followers || profile.follower_count || 0,
    likes: profile.likes || profile.like_count || 0,
    is_verified: profile.is_verified || false,
    profile_picture: profile.profile_picture || profile.picture?.data?.url,
    category: profile.category,
    website: profile.website,
  };
}

function extractRedditSubreddit(data: any, limit = 10) {
  const posts =
    data?.data?.children ||
    data?.children ||
    data?.data?.posts ||
    data?.posts ||
    [];
  return posts.slice(0, limit).map((item: any) => {
    const post = item.data || item;
    return {
      title: post.title,
      author: post.author,
      score: post.score || 0,
      upvote_ratio: post.upvote_ratio || 0,
      num_comments: post.num_comments || 0,
      created_utc: post.created_utc,
      url: post.url,
      permalink: post.permalink,
      selftext: (post.selftext || "").substring(0, 200), // Limit text length
      is_video: post.is_video || false,
    };
  });
}

const tools: Tool[] = [
  {
    name: "get_instagram_profile",
    description: "Get Instagram profile data",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Instagram username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_tiktok_profile",
    description: "Get TikTok profile data",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "TikTok username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_twitter_profile",
    description: "Get Twitter/X profile data",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Twitter username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_threads_profile",
    description: "Get Threads profile data",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Threads username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_instagram_posts",
    description: "Get Instagram posts from a user",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Instagram username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_tiktok_videos",
    description: "Get TikTok videos from a user",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "TikTok username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_twitter_tweets",
    description: "Get tweets from a Twitter/X user",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Twitter username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_threads_posts",
    description: "Get posts from a Threads user",
    inputSchema: {
      type: "object",
      properties: {
        handle: { type: "string", description: "Threads username" },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_youtube_channel",
    description: "Get YouTube channel data",
    inputSchema: {
      type: "object",
      properties: {
        handle: {
          type: "string",
          description: "YouTube channel handle or @username",
        },
      },
      required: ["handle"],
    },
  },
  {
    name: "get_facebook_profile",
    description: "Get Facebook profile/page data",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Facebook profile or page URL",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_reddit_subreddit",
    description: "Get Reddit subreddit posts",
    inputSchema: {
      type: "object",
      properties: {
        subreddit: {
          type: "string",
          description: "Subreddit name (without r/)",
        },
      },
      required: ["subreddit"],
    },
  },
];

const server = new Server(
  { name: "sociavault-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_instagram_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/instagram/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractInstagramProfile(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_tiktok_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/tiktok/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractTikTokProfile(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_twitter_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/twitter/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractTwitterProfile(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_threads_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/threads/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractThreadsProfile(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_instagram_posts") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/instagram/posts`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractInstagramPosts(response.data, 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { handle, posts: extracted, total_returned: extracted.length },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_tiktok_videos") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/tiktok/videos`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractTikTokVideos(response.data, 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { handle, videos: extracted, total_returned: extracted.length },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_twitter_tweets") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/twitter/user-tweets`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractTwitterTweets(response.data, 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { handle, tweets: extracted, total_returned: extracted.length },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_threads_posts") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/threads/user/posts`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractThreadsPosts(response.data, 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { handle, posts: extracted, total_returned: extracted.length },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "get_youtube_channel") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/youtube/channel`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      const extracted = extractYouTubeChannel(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_facebook_profile") {
      const { url } = args as { url: string };
      const response = await axios.get(`${BASE_URL}/facebook/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { url },
      });
      const extracted = extractFacebookProfile(response.data);
      return {
        content: [{ type: "text", text: JSON.stringify(extracted, null, 2) }],
      };
    }

    if (name === "get_reddit_subreddit") {
      const { subreddit } = args as { subreddit: string };
      const response = await axios.get(`${BASE_URL}/reddit/subreddit`, {
        headers: { "X-API-Key": API_KEY },
        params: { subreddit },
      });
      const extracted = extractRedditSubreddit(response.data, 10);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { subreddit, posts: extracted, total_returned: extracted.length },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error: any) {
    const msg = error.response?.data?.error || error.message;
    return {
      content: [{ type: "text", text: `Error: ${msg}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
