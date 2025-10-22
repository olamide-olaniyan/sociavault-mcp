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
const BASE_URL = "https://sociavault-backend.webscrapingwithola.com/api/scrape";

if (!API_KEY) {
  console.error("Error: SOCIAVAULT_API_KEY required");
  process.exit(1);
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
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_tiktok_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/tiktok/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_twitter_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/twitter/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_threads_profile") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/threads/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_instagram_posts") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/instagram/posts`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_tiktok_videos") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/tiktok/videos`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_twitter_tweets") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/twitter/user-tweets`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_threads_posts") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/threads/user/posts`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_youtube_channel") {
      const { handle } = args as { handle: string };
      const response = await axios.get(`${BASE_URL}/youtube/channel`, {
        headers: { "X-API-Key": API_KEY },
        params: { handle },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_facebook_profile") {
      const { url } = args as { url: string };
      const response = await axios.get(`${BASE_URL}/facebook/profile`, {
        headers: { "X-API-Key": API_KEY },
        params: { url },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
        ],
      };
    }

    if (name === "get_reddit_subreddit") {
      const { subreddit } = args as { subreddit: string };
      const response = await axios.get(`${BASE_URL}/reddit/subreddit`, {
        headers: { "X-API-Key": API_KEY },
        params: { subreddit },
      });
      return {
        content: [
          { type: "text", text: JSON.stringify(response.data, null, 2) },
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
