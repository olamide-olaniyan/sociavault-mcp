/**
 * Declarative registry of every SociaVault API endpoint exposed as an MCP tool.
 * Derived from the official OpenAPI spec. Adding a tool = adding one entry here.
 */

export interface ParamDef {
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;
  default?: string | number | boolean;
}

export interface EndpointDef {
  /** MCP tool name, snake_case, `{platform}_{action}`. */
  name: string;
  /** Short human-readable title. */
  title: string;
  /** Rich description to help an AI agent pick the right tool. */
  description: string;
  /** Full API path including the version prefix. */
  path: string;
  /** Query parameters. */
  params: Record<string, ParamDef>;
}

// --- param builders ---------------------------------------------------------
const str = (description: string, required = false): ParamDef => ({ type: "string", description, required });
const num = (description: string, required = false): ParamDef => ({ type: "number", description, required });
const boolean = (description: string, def?: boolean): ParamDef => ({
  type: "boolean",
  description,
  ...(def !== undefined ? { default: def } : {}),
});

const trim = (): ParamDef =>
  boolean("Return a smaller, AI-friendly response by stripping verbose/raw fields. Recommended to save tokens.", true);
const cursor = (note = "Pagination cursor from a previous response's output. Omit for the first page."): ParamDef =>
  str(note);

export const endpoints: EndpointDef[] = [
  // ===================== TikTok =====================
  {
    name: "tiktok_profile",
    title: "TikTok profile",
    description: "Get a TikTok user's profile: nickname, bio/signature, follower/following counts, total likes, video count, verification status, and avatar.",
    path: "/v1/scrape/tiktok/profile",
    params: { handle: str("TikTok username without the @ (e.g. 'charlidamelio').", true) },
  },
  {
    name: "tiktok_demographics",
    title: "TikTok audience demographics",
    description: "Get audience demographic insights (where available) for a TikTok creator: country, gender, and age distribution.",
    path: "/v1/scrape/tiktok/demographics",
    params: { handle: str("TikTok username without the @.", true) },
  },
  {
    name: "tiktok_videos",
    title: "TikTok user videos",
    description: "List a TikTok user's videos with view/like/comment/share counts and metadata. Supports pagination via max_cursor.",
    path: "/v1/scrape/tiktok/videos",
    params: {
      handle: str("TikTok username without the @.", true),
      user_id: str("Optional TikTok numeric user id, if known (faster)."),
      sort_by: str("Sort order, e.g. 'latest' or 'popular'."),
      max_cursor: str("Pagination cursor from a previous response."),
      trim: trim(),
    },
  },
  {
    name: "tiktok_video_info",
    title: "TikTok video info",
    description: "Get full metadata for a single TikTok video by URL: stats, author, music, and optionally the transcript.",
    path: "/v1/scrape/tiktok/video-info",
    params: {
      url: str("Full TikTok video URL.", true),
      get_transcript: boolean("Also fetch the video transcript/captions."),
      region: str("Two-letter region code to resolve region-locked content (e.g. 'US')."),
      trim: trim(),
    },
  },
  {
    name: "tiktok_transcript",
    title: "TikTok video transcript",
    description: "Get the spoken transcript/captions of a TikTok video by URL.",
    path: "/v1/scrape/tiktok/transcript",
    params: {
      url: str("Full TikTok video URL.", true),
      language: str("Preferred transcript language code (e.g. 'en')."),
      use_ai_as_fallback: boolean("If no captions exist, generate the transcript with AI."),
    },
  },
  {
    name: "tiktok_live",
    title: "TikTok live status",
    description: "Check whether a TikTok user is currently live and get live room details.",
    path: "/v1/scrape/tiktok/live",
    params: { handle: str("TikTok username without the @.", true) },
  },
  {
    name: "tiktok_comments",
    title: "TikTok video comments",
    description: "Get comments on a TikTok video by URL, with like counts and authors. Paginate with cursor.",
    path: "/v1/scrape/tiktok/comments",
    params: { url: str("Full TikTok video URL.", true), cursor: cursor(), trim: trim() },
  },
  {
    name: "tiktok_comment_replies",
    title: "TikTok comment replies",
    description: "Get replies to a specific TikTok comment.",
    path: "/v1/scrape/tiktok/comment-replies",
    params: {
      comment_id: str("The id of the parent comment.", true),
      url: str("Full TikTok video URL the comment belongs to.", true),
      cursor: cursor(),
    },
  },
  {
    name: "tiktok_following",
    title: "TikTok following list",
    description: "List the accounts a TikTok user follows.",
    path: "/v1/scrape/tiktok/following",
    params: {
      handle: str("TikTok username without the @.", true),
      min_time: str("Pagination timestamp from a previous response."),
      trim: trim(),
    },
  },
  {
    name: "tiktok_followers",
    title: "TikTok followers list",
    description: "List a TikTok user's followers. Provide handle or user_id.",
    path: "/v1/scrape/tiktok/followers",
    params: {
      handle: str("TikTok username without the @ (or use user_id)."),
      user_id: str("TikTok numeric user id (or use handle)."),
      min_time: str("Pagination timestamp from a previous response."),
      trim: trim(),
    },
  },
  {
    name: "tiktok_search_users",
    title: "TikTok user search",
    description: "Search TikTok for users/creators matching a query.",
    path: "/v1/scrape/tiktok/search/users",
    params: { query: str("Search text.", true), cursor: cursor(), trim: trim() },
  },
  {
    name: "tiktok_search_hashtag",
    title: "TikTok hashtag search",
    description: "Get videos for a TikTok hashtag/challenge.",
    path: "/v1/scrape/tiktok/search/hashtag",
    params: {
      hashtag: str("Hashtag without the # (e.g. 'fyp').", true),
      region: str("Two-letter region code (e.g. 'US')."),
      cursor: cursor(),
      trim: trim(),
    },
  },
  {
    name: "tiktok_search_keyword",
    title: "TikTok keyword video search",
    description: "Search TikTok videos by keyword with date/sort/region filters.",
    path: "/v1/scrape/tiktok/search/keyword",
    params: {
      query: str("Search text.", true),
      date_posted: str("Recency filter, e.g. '0' (all), '1' (24h), '7' (week), '30', '90', '180'."),
      sort_by: str("Sort order, e.g. '0' relevance or '1' most liked."),
      region: str("Two-letter region code (e.g. 'US')."),
      cursor: cursor(),
      trim: trim(),
    },
  },
  {
    name: "tiktok_search_music",
    title: "TikTok music search",
    description: "Search TikTok sounds/music by keyword.",
    path: "/v1/scrape/tiktok/search/music",
    params: {
      keyword: str("Music/sound search text.", true),
      region: str("Two-letter region code."),
      filter_by: str("Result filter (e.g. by title or creator)."),
      sort_type: str("Sort type for results."),
      offset: num("Pagination offset (number of results to skip)."),
    },
  },
  {
    name: "tiktok_search_top",
    title: "TikTok top/general search",
    description: "Run TikTok's general 'top' search across content types for a query.",
    path: "/v1/scrape/tiktok/search/top",
    params: {
      query: str("Search text.", true),
      publish_time: str("Recency filter for results."),
      sort_by: str("Sort order."),
      region: str("Two-letter region code."),
      cursor: cursor(),
    },
  },
  {
    name: "tiktok_music_popular",
    title: "TikTok popular music chart",
    description: "Get trending/popular TikTok sounds from the Creative Center charts.",
    path: "/v1/scrape/tiktok/music/popular",
    params: {
      page: num("Page number (starts at 1)."),
      timePeriod: str("Time window, e.g. '7' or '30' days."),
      rankType: str("Ranking type, e.g. 'popular' or 'surging'."),
      newOnBoard: boolean("Only return newly charting sounds."),
      commercialMusic: boolean("Only return commercially licensed music."),
      countryCode: str("Two-letter country code (e.g. 'US')."),
    },
  },
  {
    name: "tiktok_music_details",
    title: "TikTok music details",
    description: "Get details for a specific TikTok sound by its clip id.",
    path: "/v1/scrape/tiktok/music/details",
    params: { clipId: str("TikTok music/clip id.", true) },
  },
  {
    name: "tiktok_music_videos",
    title: "TikTok videos using a sound",
    description: "List videos that use a specific TikTok sound.",
    path: "/v1/scrape/tiktok/music/videos",
    params: { clipId: str("TikTok music/clip id."), cursor: cursor() },
  },
  {
    name: "tiktok_trending",
    title: "TikTok trending videos",
    description: "Get currently trending TikTok videos for a region.",
    path: "/v1/scrape/tiktok/trending",
    params: { region: str("Two-letter region code (e.g. 'US').", true), trim: trim() },
  },
  {
    name: "tiktok_creators_popular",
    title: "TikTok popular creators chart",
    description: "Get popular TikTok creators from the Creative Center, filterable by follower count and country.",
    path: "/v1/scrape/tiktok/creators/popular",
    params: {
      page: num("Page number (starts at 1)."),
      sortBy: str("Sort metric, e.g. 'follower' or 'engagement'."),
      followerCount: str("Follower bucket filter."),
      creatorCountry: str("Creator country code."),
      audienceCountry: str("Audience country code."),
    },
  },
  {
    name: "tiktok_videos_popular",
    title: "TikTok popular videos chart",
    description: "Get top-performing TikTok videos from the Creative Center by period and country.",
    path: "/v1/scrape/tiktok/videos/popular",
    params: {
      period: str("Time window in days, e.g. '7' or '30'."),
      page: num("Page number (starts at 1)."),
      orderBy: str("Order metric, e.g. 'vv' (views)."),
      countryCode: str("Two-letter country code."),
    },
  },
  {
    name: "tiktok_hashtags_popular",
    title: "TikTok popular hashtags chart",
    description: "Get trending TikTok hashtags from the Creative Center by period and country.",
    path: "/v1/scrape/tiktok/hashtags/popular",
    params: {
      period: str("Time window in days, e.g. '7' or '30'."),
      page: num("Page number (starts at 1)."),
      countryCode: str("Two-letter country code."),
      newOnBoard: boolean("Only return newly trending hashtags."),
    },
  },

  // ===================== TikTok Shop =====================
  {
    name: "tiktok_shop_products",
    title: "TikTok Shop seller products",
    description: "List products from a TikTok Shop seller/store URL.",
    path: "/v1/scrape/tiktok-shop/products",
    params: { url: str("TikTok Shop store/seller URL.", true), cursor: cursor(), region: str("Two-letter region code.") },
  },
  {
    name: "tiktok_shop_product_details",
    title: "TikTok Shop product details",
    description: "Get full details for a single TikTok Shop product, optionally with related videos.",
    path: "/v1/scrape/tiktok-shop/product-details",
    params: {
      url: str("TikTok Shop product URL.", true),
      get_related_videos: boolean("Also fetch videos featuring this product."),
      region: str("Two-letter region code."),
    },
  },
  {
    name: "tiktok_shop_search",
    title: "TikTok Shop product search",
    description: "Search products on TikTok Shop by keyword.",
    path: "/v1/scrape/tiktok-shop/search",
    params: { query: str("Product search text.", true), page: num("Page number (starts at 1)."), region: str("Two-letter region code.") },
  },
  {
    name: "tiktok_shop_product_reviews",
    title: "TikTok Shop product reviews",
    description: "Get reviews for a TikTok Shop product. Provide the product url or product_id.",
    path: "/v1/scrape/tiktok-shop/product-reviews",
    params: {
      url: str("TikTok Shop product URL (or use product_id)."),
      product_id: str("TikTok Shop product id (or use url)."),
      page: num("Page number (starts at 1)."),
    },
  },

  // ===================== Instagram =====================
  {
    name: "instagram_profile",
    title: "Instagram profile",
    description: "Get an Instagram profile: full name, bio, follower/following counts, post count, verification, business status, and profile picture.",
    path: "/v1/scrape/instagram/profile",
    params: { handle: str("Instagram username without the @.", true), trim: trim() },
  },
  {
    name: "instagram_posts",
    title: "Instagram user posts",
    description: "List an Instagram user's recent posts with captions, like/comment counts, and media. Paginate with next_max_id.",
    path: "/v1/scrape/instagram/posts",
    params: { handle: str("Instagram username without the @.", true), next_max_id: str("Pagination id from a previous response."), trim: trim() },
  },
  {
    name: "instagram_post_info",
    title: "Instagram post details",
    description: "Get full details of a single Instagram post/reel by URL.",
    path: "/v1/scrape/instagram/post-info",
    params: { url: str("Full Instagram post/reel URL.", true), trim: trim() },
  },
  {
    name: "instagram_transcript",
    title: "Instagram reel transcript",
    description: "Get the transcript of an Instagram video/reel by URL.",
    path: "/v1/scrape/instagram/transcript",
    params: { url: str("Full Instagram reel/video URL.", true) },
  },
  {
    name: "instagram_comments",
    title: "Instagram post comments",
    description: "Get comments on an Instagram post by URL. Paginate with cursor.",
    path: "/v1/scrape/instagram/comments",
    params: { url: str("Full Instagram post URL.", true), cursor: cursor() },
  },
  {
    name: "instagram_reels",
    title: "Instagram user reels",
    description: "List an Instagram user's reels with play/like counts. Provide handle or user_id.",
    path: "/v1/scrape/instagram/reels",
    params: {
      user_id: str("Instagram numeric user id (or use handle)."),
      handle: str("Instagram username without the @ (or use user_id)."),
      max_id: str("Pagination id from a previous response."),
      trim: trim(),
    },
  },
  {
    name: "instagram_highlights",
    title: "Instagram highlights",
    description: "Get an Instagram account's story highlight trays. Provide handle or user_id.",
    path: "/v1/scrape/instagram/highlights",
    params: { user_id: str("Instagram numeric user id (or use handle)."), handle: str("Instagram username without the @ (or use user_id).") },
  },
  {
    name: "instagram_highlight_detail",
    title: "Instagram highlight detail",
    description: "Get the items inside a specific Instagram highlight tray by its id.",
    path: "/v1/scrape/instagram/highlight-detail",
    params: { id: str("Highlight tray id (e.g. 'highlight:123...').", true) },
  },
  {
    name: "instagram_reels_by_song",
    title: "Instagram reels by audio",
    description: "Find Instagram reels that use a specific audio/song id.",
    path: "/v1/scrape/instagram/reels-by-song",
    params: { audio_id: str("Instagram audio/song id.", true), max_id: str("Pagination id from a previous response.") },
  },

  // ===================== YouTube =====================
  {
    name: "youtube_channel",
    title: "YouTube channel info",
    description: "Get a YouTube channel's stats: subscribers, video count, total views, description, and thumbnails. Provide channelId, handle, or url.",
    path: "/v1/scrape/youtube/channel",
    params: {
      channelId: str("YouTube channel id (starts with 'UC...')."),
      handle: str("YouTube @handle or username."),
      url: str("Full YouTube channel URL."),
    },
  },
  {
    name: "youtube_channel_videos",
    title: "YouTube channel videos",
    description: "List a channel's uploaded videos. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/channel-videos",
    params: {
      channelId: str("YouTube channel id (or use handle)."),
      handle: str("YouTube @handle (or use channelId)."),
      sort: str("Sort order, e.g. 'newest', 'oldest', 'popular'."),
      continuationToken: str("Pagination token from a previous response."),
    },
  },
  {
    name: "youtube_channel_shorts",
    title: "YouTube channel shorts",
    description: "List a channel's Shorts. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/channel/shorts",
    params: {
      handle: str("YouTube @handle (or use channelId)."),
      channelId: str("YouTube channel id (or use handle)."),
      sort: str("Sort order."),
      continuationToken: str("Pagination token from a previous response."),
    },
  },
  {
    name: "youtube_video",
    title: "YouTube video info",
    description: "Get metadata for a single YouTube video by URL: title, views, likes, channel, and description.",
    path: "/v1/scrape/youtube/video",
    params: { url: str("Full YouTube video URL.", true), language: str("Preferred metadata language code (e.g. 'en').") },
  },
  {
    name: "youtube_video_transcript",
    title: "YouTube video transcript",
    description: "Get the transcript/captions of a YouTube video by URL.",
    path: "/v1/scrape/youtube/video/transcript",
    params: { url: str("Full YouTube video URL.", true) },
  },
  {
    name: "youtube_search",
    title: "YouTube search",
    description: "Search YouTube for videos with upload-date, sort, and type filters.",
    path: "/v1/scrape/youtube/search",
    params: {
      query: str("Search text.", true),
      uploadDate: str("Upload-date filter, e.g. 'hour', 'today', 'week', 'month', 'year'."),
      sortBy: str("Sort order, e.g. 'relevance', 'date', 'viewCount', 'rating'."),
      filter: str("Result type filter, e.g. 'video', 'channel', 'playlist'."),
      continuationToken: str("Pagination token from a previous response."),
      region: str("Two-letter region code."),
    },
  },
  {
    name: "youtube_search_hashtag",
    title: "YouTube hashtag search",
    description: "Get videos/shorts for a YouTube hashtag.",
    path: "/v1/scrape/youtube/search/hashtag",
    params: {
      hashtag: str("Hashtag without the # symbol.", true),
      continuationToken: str("Pagination token from a previous response."),
      type: str("Content type, e.g. 'videos' or 'shorts'."),
    },
  },
  {
    name: "youtube_video_comments",
    title: "YouTube video comments",
    description: "Get comments on a YouTube video by URL. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/video/comments",
    params: {
      url: str("Full YouTube video URL.", true),
      continuationToken: str("Pagination token from a previous response."),
      order: str("Comment order, e.g. 'top' or 'newest'."),
    },
  },
  {
    name: "youtube_video_comment_replies",
    title: "YouTube comment replies",
    description: "Get replies to a YouTube comment using the continuation token from a comments response.",
    path: "/v1/scrape/youtube/video/comment-replies",
    params: { continuationToken: str("Continuation token identifying the comment thread.", true) },
  },
  {
    name: "youtube_shorts_trending",
    title: "YouTube trending shorts",
    description: "Get currently trending YouTube Shorts.",
    path: "/v1/scrape/youtube/shorts/trending",
    params: {},
  },
  {
    name: "youtube_channel_playlists",
    title: "YouTube channel playlists",
    description: "List a channel's playlists. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/channel/playlists",
    params: {
      channelId: str("YouTube channel id (or use handle)."),
      handle: str("YouTube @handle (or use channelId)."),
      continuationToken: str("Pagination token from a previous response."),
    },
  },
  {
    name: "youtube_channel_lives",
    title: "YouTube channel live streams",
    description: "List a channel's live/streamed videos. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/channel/lives",
    params: {
      channelId: str("YouTube channel id (or use handle)."),
      handle: str("YouTube @handle (or use channelId)."),
      continuationToken: str("Pagination token from a previous response."),
    },
  },
  {
    name: "youtube_channel_community_posts",
    title: "YouTube community posts",
    description: "List a channel's community tab posts. Paginate with continuationToken.",
    path: "/v1/scrape/youtube/channel/community-posts",
    params: {
      channelId: str("YouTube channel id (or use handle)."),
      handle: str("YouTube @handle (or use channelId)."),
      continuationToken: str("Pagination token from a previous response."),
    },
  },

  // ===================== Twitch =====================
  {
    name: "twitch_profile",
    title: "Twitch profile",
    description: "Get a Twitch user's profile/channel info.",
    path: "/v1/scrape/twitch/profile",
    params: { handle: str("Twitch username/login.", true) },
  },
  {
    name: "twitch_user_videos",
    title: "Twitch user videos",
    description: "List a Twitch user's videos (VODs/highlights/clips). Paginate with cursor.",
    path: "/v1/scrape/twitch/user/videos",
    params: {
      handle: str("Twitch username/login.", true),
      cursor: cursor(),
      filter_by: str("Video type filter, e.g. 'archive', 'highlight', 'upload'."),
      sort_by: str("Sort order, e.g. 'time' or 'views'."),
    },
  },
  {
    name: "twitch_user_schedule",
    title: "Twitch stream schedule",
    description: "Get a Twitch channel's upcoming stream schedule.",
    path: "/v1/scrape/twitch/user/schedule",
    params: { handle: str("Twitch username/login.", true) },
  },
  {
    name: "twitch_clip",
    title: "Twitch clip details",
    description: "Get details for a single Twitch clip by URL.",
    path: "/v1/scrape/twitch/clip",
    params: { url: str("Full Twitch clip URL.", true) },
  },

  // ===================== TikTok Ad Library =====================
  {
    name: "tiktok_ad_library_search",
    title: "TikTok Ad Library search",
    description: "Search TikTok's Commercial Content / Ad Library with rich filters (industry, objective, format, language, region, engagement).",
    path: "/v1/scrape/tiktok-ad-library/search",
    params: {
      region: str("Two-letter region code."),
      period: str("Time window in days, e.g. '7', '30', '180'."),
      query: str("Keyword or advertiser to search for."),
      order_by: str("Sort metric."),
      industry: str("Industry filter."),
      objective: str("Ad objective filter."),
      duration: str("Ad duration filter."),
      likes: str("Likes/engagement bucket filter."),
      ad_format: str("Ad format filter."),
      ad_language: str("Ad language code."),
      cursor: cursor(),
      limit: num("Max results to return."),
    },
  },
  {
    name: "tiktok_ad_library_ad",
    title: "TikTok Ad Library ad details",
    description: "Get details for a single TikTok ad by its ad id.",
    path: "/v1/scrape/tiktok-ad-library/ad",
    params: { ad_id: str("TikTok ad id.", true) },
  },

  // ===================== LinkedIn =====================
  {
    name: "linkedin_profile",
    title: "LinkedIn profile",
    description: "Get a LinkedIn personal profile by URL: name, headline, experience, education, and more.",
    path: "/v1/scrape/linkedin/profile",
    params: { url: str("Full LinkedIn profile URL.", true) },
  },
  {
    name: "linkedin_company",
    title: "LinkedIn company",
    description: "Get a LinkedIn company page by URL: industry, size, about, and stats.",
    path: "/v1/scrape/linkedin/company",
    params: { url: str("Full LinkedIn company URL.", true) },
  },
  {
    name: "linkedin_post",
    title: "LinkedIn post",
    description: "Get a LinkedIn post by URL with engagement metrics.",
    path: "/v1/scrape/linkedin/post",
    params: { url: str("Full LinkedIn post URL.", true) },
  },

  // ===================== Facebook =====================
  {
    name: "facebook_profile",
    title: "Facebook profile/page",
    description: "Get a Facebook profile or page by URL: name, about, follower/like counts, category, and contact info.",
    path: "/v1/scrape/facebook/profile",
    params: { url: str("Full Facebook profile/page URL.", true), get_business_hours: boolean("Also fetch business hours if it's a page.") },
  },
  {
    name: "facebook_profile_posts",
    title: "Facebook page posts",
    description: "List posts from a Facebook page/profile. Provide url or pageId. Paginate with cursor.",
    path: "/v1/scrape/facebook/profile/posts",
    params: { url: str("Full Facebook page/profile URL (or use pageId)."), pageId: str("Facebook page id (or use url)."), cursor: cursor() },
  },
  {
    name: "facebook_comment_replies",
    title: "Facebook comment replies",
    description: "Get replies to a Facebook comment using its feedback_id and expansion_token (from a comments response).",
    path: "/v1/scrape/facebook/comment/replies",
    params: {
      feedback_id: str("Comment feedback id.", true),
      expansion_token: str("Expansion token from the comments response.", true),
      cursor: cursor(),
    },
  },
  {
    name: "facebook_profile_reels",
    title: "Facebook page reels",
    description: "List reels from a Facebook page/profile. Paginate with next_page_id/cursor.",
    path: "/v1/scrape/facebook/profile/reels",
    params: { url: str("Full Facebook page/profile URL.", true), next_page_id: str("Pagination id from a previous response."), cursor: cursor() },
  },
  {
    name: "facebook_group_posts",
    title: "Facebook group posts",
    description: "List posts from a public Facebook group. Provide url or group_id.",
    path: "/v1/scrape/facebook/group/posts",
    params: {
      url: str("Full Facebook group URL (or use group_id)."),
      group_id: str("Facebook group id (or use url)."),
      sort_by: str("Sort order, e.g. 'recent' or 'top'."),
      cursor: cursor(),
    },
  },
  {
    name: "facebook_post",
    title: "Facebook post details",
    description: "Get a single Facebook post by URL with engagement metrics.",
    path: "/v1/scrape/facebook/post",
    params: { url: str("Full Facebook post URL.", true) },
  },
  {
    name: "facebook_post_transcript",
    title: "Facebook video transcript",
    description: "Get the transcript of a Facebook video/reel by URL.",
    path: "/v1/scrape/facebook/post/transcript",
    params: { url: str("Full Facebook video/reel URL.", true) },
  },
  {
    name: "facebook_post_comments",
    title: "Facebook post comments",
    description: "Get comments on a Facebook post by URL. Paginate with cursor.",
    path: "/v1/scrape/facebook/post/comments",
    params: { url: str("Full Facebook post URL.", true), cursor: cursor() },
  },

  // ===================== Facebook Ad Library =====================
  {
    name: "facebook_ad_library_ad_details",
    title: "Facebook Ad Library ad details",
    description: "Get details for a single Facebook/Instagram ad. Provide the ad id or url; optionally fetch the video transcript.",
    path: "/v1/scrape/facebook-ad-library/ad-details",
    params: {
      id: str("Ad archive id (or use url)."),
      url: str("Ad Library ad URL (or use id)."),
      get_transcript: boolean("Also fetch the ad video transcript."),
      trim: trim(),
    },
  },
  {
    name: "facebook_ad_library_search",
    title: "Facebook Ad Library keyword search",
    description: "Search the Facebook/Meta Ad Library by keyword with country, media-type, status, and date filters.",
    path: "/v1/scrape/facebook-ad-library/search",
    params: {
      query: str("Keyword to search for.", true),
      sort_by: str("Sort order."),
      search_type: str("Search type, e.g. 'keyword_unordered'."),
      ad_type: str("Ad category, e.g. 'all', 'political_and_issue_ads'."),
      country: str("Two-letter country code (e.g. 'US')."),
      status: str("Ad status, e.g. 'active', 'inactive', 'all'."),
      media_type: str("Media type, e.g. 'all', 'image', 'video'."),
      start_date: str("Start date filter (YYYY-MM-DD)."),
      end_date: str("End date filter (YYYY-MM-DD)."),
      cursor: cursor(),
      trim: trim(),
    },
  },
  {
    name: "facebook_ad_library_company_ads",
    title: "Facebook Ad Library advertiser ads",
    description: "Get all ads run by a specific advertiser/page in the Meta Ad Library. Provide pageId or companyName.",
    path: "/v1/scrape/facebook-ad-library/company-ads",
    params: {
      pageId: str("Facebook page id of the advertiser (or use companyName)."),
      companyName: str("Advertiser/company name (or use pageId)."),
      country: str("Two-letter country code."),
      status: str("Ad status, e.g. 'active', 'inactive', 'all'."),
      media_type: str("Media type filter."),
      language: str("Ad language code."),
      start_date: str("Start date filter (YYYY-MM-DD)."),
      end_date: str("End date filter (YYYY-MM-DD)."),
      cursor: cursor(),
      trim: trim(),
    },
  },
  {
    name: "facebook_ad_library_search_companies",
    title: "Facebook Ad Library advertiser search",
    description: "Find advertisers/pages in the Meta Ad Library by name.",
    path: "/v1/scrape/facebook-ad-library/search-companies",
    params: { query: str("Advertiser/company name to search for.", true) },
  },

  // ===================== Facebook Marketplace =====================
  {
    name: "facebook_marketplace_location_search",
    title: "Marketplace location lookup",
    description: "Resolve a place name into Facebook Marketplace location ids/coordinates (use before a marketplace search).",
    path: "/v1/scrape/facebook-marketplace/location-search",
    params: { query: str("City/place name to resolve.", true) },
  },
  {
    name: "facebook_marketplace_search",
    title: "Facebook Marketplace search",
    description: "Search Facebook Marketplace listings near coordinates, with price/condition/delivery filters.",
    path: "/v1/scrape/facebook-marketplace/search",
    params: {
      query: str("Product search text.", true),
      lat: num("Latitude of the search center.", true),
      lng: num("Longitude of the search center.", true),
      radius_km: num("Search radius in kilometers."),
      min_price: num("Minimum price filter."),
      max_price: num("Maximum price filter."),
      count: num("Max number of listings to return."),
      sort_by: str("Sort order, e.g. 'best_match', 'price_ascend', 'distance_ascend'."),
      delivery_method: str("Delivery filter, e.g. 'local_pick_up' or 'shipping'."),
      condition: str("Item condition filter, e.g. 'new', 'used_good'."),
      date_listed: str("Recency filter, e.g. '1', '7', '30' days."),
      availability: str("Availability filter, e.g. 'in_stock'."),
      cursor: cursor(),
    },
  },
  {
    name: "facebook_marketplace_item",
    title: "Marketplace listing details",
    description: "Get details for a single Facebook Marketplace listing. Provide id or url.",
    path: "/v1/scrape/facebook-marketplace/item",
    params: { id: str("Marketplace listing id (or use url)."), url: str("Marketplace listing URL (or use id).") },
  },

  // ===================== Google Ad Library =====================
  {
    name: "google_ad_library_company_ads",
    title: "Google Ad Transparency advertiser ads",
    description: "Get ads from Google's Ad Transparency Center for an advertiser. Provide domain or advertiser_id.",
    path: "/v1/scrape/google-ad-library/company-ads",
    params: {
      domain: str("Advertiser domain (or use advertiser_id)."),
      advertiser_id: str("Google advertiser id (or use domain)."),
      topic: str("Topic filter."),
      region: str("Region code filter."),
      start_date: str("Start date filter (YYYY-MM-DD)."),
      end_date: str("End date filter (YYYY-MM-DD)."),
      cursor: cursor(),
    },
  },
  {
    name: "google_ad_library_ad_details",
    title: "Google Ad Transparency ad details",
    description: "Get details for a single Google ad by its Ad Transparency URL.",
    path: "/v1/scrape/google-ad-library/ad-details",
    params: { url: str("Google Ad Transparency ad URL.", true) },
  },
  {
    name: "google_ad_library_search_advertisers",
    title: "Google Ad Transparency advertiser search",
    description: "Find advertisers in Google's Ad Transparency Center by name.",
    path: "/v1/scrape/google-ad-library/search-advertisers",
    params: { query: str("Advertiser name to search for.", true) },
  },

  // ===================== LinkedIn Ad Library =====================
  {
    name: "linkedin_ad_library_search",
    title: "LinkedIn Ad Library search",
    description: "Search the LinkedIn Ad Library by company or keyword, with country and date filters.",
    path: "/v1/scrape/linkedin-ad-library/search",
    params: {
      company: str("Advertiser/company name (or use keyword)."),
      keyword: str("Keyword to search for (or use company)."),
      countries: str("Comma-separated country codes."),
      startDate: str("Start date filter (YYYY-MM-DD)."),
      endDate: str("End date filter (YYYY-MM-DD)."),
      paginationToken: str("Pagination token from a previous response."),
    },
  },
  {
    name: "linkedin_ad_library_ad_details",
    title: "LinkedIn Ad Library ad details",
    description: "Get details for a single LinkedIn ad by URL.",
    path: "/v1/scrape/linkedin-ad-library/ad-details",
    params: { url: str("LinkedIn Ad Library ad URL.", true) },
  },

  // ===================== Twitter / X =====================
  {
    name: "twitter_profile",
    title: "Twitter/X profile",
    description: "Get a Twitter/X profile: name, bio, follower/following counts, tweet count, and verification.",
    path: "/v1/scrape/twitter/profile",
    params: { handle: str("Twitter/X username without the @.", true) },
  },
  {
    name: "twitter_user_tweets",
    title: "Twitter/X user tweets",
    description: "Get a user's recent tweets by handle with engagement metrics.",
    path: "/v1/scrape/twitter/user-tweets",
    params: { handle: str("Twitter/X username without the @.", true), trim: trim() },
  },
  {
    name: "twitter_user_tweets_all",
    title: "Twitter/X user tweets (paginated)",
    description: "Get a user's tweets by numeric user_id with full cursor pagination for deep history.",
    path: "/v1/scrape/twitter/user-tweets-all",
    params: { user_id: str("Twitter/X numeric user id.", true), cursor: cursor() },
  },
  {
    name: "twitter_tweet",
    title: "Twitter/X tweet details",
    description: "Get a single tweet by URL with engagement metrics.",
    path: "/v1/scrape/twitter/tweet",
    params: { url: str("Full tweet URL.", true), trim: trim() },
  },
  {
    name: "twitter_tweet_transcript",
    title: "Twitter/X video transcript",
    description: "Get the transcript of a video attached to a tweet, by URL.",
    path: "/v1/scrape/twitter/tweet/transcript",
    params: { url: str("Full tweet URL containing a video.", true) },
  },
  {
    name: "twitter_comments",
    title: "Twitter/X tweet replies",
    description: "Get replies/comments on a tweet by its post id (pid). Paginate with cursor.",
    path: "/v1/scrape/twitter/comments",
    params: {
      pid: str("Tweet/post id.", true),
      rankingMode: str("Reply ranking, e.g. 'Relevance' or 'Recency'."),
      cursor: cursor(),
    },
  },
  {
    name: "twitter_quotes",
    title: "Twitter/X quote tweets",
    description: "Get quote tweets of a tweet by its post id (pid). Paginate with cursor.",
    path: "/v1/scrape/twitter/quotes",
    params: { pid: str("Tweet/post id.", true), cursor: cursor() },
  },
  {
    name: "twitter_retweets",
    title: "Twitter/X retweeters",
    description: "Get accounts that retweeted a tweet by its post id (pid). Paginate with cursor.",
    path: "/v1/scrape/twitter/retweets",
    params: { pid: str("Tweet/post id.", true), cursor: cursor() },
  },
  {
    name: "twitter_search",
    title: "Twitter/X search",
    description: "Search tweets/users on Twitter/X. Paginate with cursor.",
    path: "/v1/scrape/twitter/search",
    params: {
      query: str("Search text (supports X search operators).", true),
      type: str("Result type, e.g. 'Top', 'Latest', 'People', 'Media'."),
      cursor: cursor(),
    },
  },
  {
    name: "twitter_followers",
    title: "Twitter/X followers",
    description: "List a user's followers by numeric user_id. Paginate with cursor.",
    path: "/v1/scrape/twitter/followers",
    params: { user_id: str("Twitter/X numeric user id.", true), cursor: cursor() },
  },
  {
    name: "twitter_followings",
    title: "Twitter/X following",
    description: "List the accounts a user follows by numeric user_id. Paginate with cursor.",
    path: "/v1/scrape/twitter/followings",
    params: { user_id: str("Twitter/X numeric user id.", true), cursor: cursor() },
  },
  {
    name: "twitter_community",
    title: "Twitter/X community details",
    description: "Get details for a Twitter/X Community by URL.",
    path: "/v1/scrape/twitter/community",
    params: { url: str("Full Twitter/X community URL.", true) },
  },
  {
    name: "twitter_community_tweets",
    title: "Twitter/X community tweets",
    description: "Get tweets posted in a Twitter/X Community by URL.",
    path: "/v1/scrape/twitter/community/tweets",
    params: { url: str("Full Twitter/X community URL.", true) },
  },

  // ===================== Reddit =====================
  {
    name: "reddit_subreddit_details",
    title: "Subreddit details",
    description: "Get a subreddit's metadata: subscribers, active users, description, rules, and category. Provide subreddit or url.",
    path: "/v1/scrape/reddit/subreddit/details",
    params: { subreddit: str("Subreddit name without r/ (or use url)."), url: str("Full subreddit URL (or use subreddit).") },
  },
  {
    name: "reddit_subreddit",
    title: "Subreddit posts",
    description: "Get posts from a subreddit with timeframe and sort. Paginate with after.",
    path: "/v1/scrape/reddit/subreddit",
    params: {
      subreddit: str("Subreddit name without r/.", true),
      timeframe: str("Timeframe for 'top', e.g. 'day', 'week', 'month', 'year', 'all'."),
      sort: str("Sort order, e.g. 'hot', 'new', 'top', 'rising'."),
      after: str("Pagination token from a previous response."),
      trim: trim(),
    },
  },
  {
    name: "reddit_subreddit_search",
    title: "Search within a subreddit",
    description: "Search posts within a specific subreddit.",
    path: "/v1/scrape/reddit/subreddit/search",
    params: {
      subreddit: str("Subreddit name without r/.", true),
      query: str("Search text."),
      filter: str("Optional filter."),
      sort: str("Sort order, e.g. 'relevance', 'new', 'top'."),
      timeframe: str("Timeframe, e.g. 'day', 'week', 'month', 'year', 'all'."),
      cursor: cursor(),
    },
  },
  {
    name: "reddit_post_comments",
    title: "Reddit post comments",
    description: "Get comments on a Reddit post by URL. Paginate with cursor.",
    path: "/v1/scrape/reddit/post/comments",
    params: { url: str("Full Reddit post URL.", true), cursor: cursor(), trim: trim() },
  },
  {
    name: "reddit_post_transcript",
    title: "Reddit video transcript",
    description: "Get the transcript of a Reddit-hosted video by post URL.",
    path: "/v1/scrape/reddit/post/transcript",
    params: { url: str("Full Reddit post URL containing a video.", true), language: str("Preferred transcript language code.") },
  },
  {
    name: "reddit_search",
    title: "Reddit search (site-wide)",
    description: "Search Reddit across all subreddits by keyword.",
    path: "/v1/scrape/reddit/search",
    params: {
      query: str("Search text.", true),
      sort: str("Sort order, e.g. 'relevance', 'hot', 'top', 'new', 'comments'."),
      timeframe: str("Timeframe, e.g. 'day', 'week', 'month', 'year', 'all'."),
      after: str("Pagination token from a previous response."),
      trim: trim(),
    },
  },

  // ===================== Threads =====================
  {
    name: "threads_profile",
    title: "Threads profile",
    description: "Get a Threads profile: name, bio, follower count, and verification.",
    path: "/v1/scrape/threads/profile",
    params: { handle: str("Threads username without the @.", true) },
  },
  {
    name: "threads_user_posts",
    title: "Threads user posts",
    description: "Get a Threads user's recent posts with engagement metrics.",
    path: "/v1/scrape/threads/user-posts",
    params: { handle: str("Threads username without the @.", true), trim: trim() },
  },
  {
    name: "threads_post",
    title: "Threads post details",
    description: "Get a single Threads post by URL.",
    path: "/v1/scrape/threads/post",
    params: { url: str("Full Threads post URL.", true), trim: trim() },
  },
  {
    name: "threads_search",
    title: "Threads post search",
    description: "Search Threads posts by keyword.",
    path: "/v1/scrape/threads/search",
    params: { query: str("Search text.", true), trim: trim() },
  },
  {
    name: "threads_search_users",
    title: "Threads user search",
    description: "Search Threads for users matching a query.",
    path: "/v1/scrape/threads/search-users",
    params: { query: str("Search text.", true) },
  },

  // ===================== Google Search =====================
  {
    name: "google_search",
    title: "Google search results",
    description: "Get Google web search results (SERP) for a query in a region.",
    path: "/v1/scrape/google/search",
    params: { query: str("Search text.", true), region: str("Two-letter region code (e.g. 'US').") },
  },

  // ===================== Pinterest =====================
  {
    name: "pinterest_search",
    title: "Pinterest pin search",
    description: "Search Pinterest pins by keyword. Paginate with cursor.",
    path: "/v1/scrape/pinterest/search",
    params: { query: str("Search text.", true), cursor: cursor(), trim: trim() },
  },
  {
    name: "pinterest_pin",
    title: "Pinterest pin details",
    description: "Get details for a single Pinterest pin by URL.",
    path: "/v1/scrape/pinterest/pin",
    params: { url: str("Full Pinterest pin URL.", true), trim: trim() },
  },
  {
    name: "pinterest_user_boards",
    title: "Pinterest user boards",
    description: "List a Pinterest user's boards.",
    path: "/v1/scrape/pinterest/user/boards",
    params: { handle: str("Pinterest username.", true), trim: trim() },
  },
  {
    name: "pinterest_board",
    title: "Pinterest board pins",
    description: "Get the pins inside a Pinterest board by URL. Paginate with cursor.",
    path: "/v1/scrape/pinterest/board",
    params: { url: str("Full Pinterest board URL.", true), cursor: cursor(), trim: trim() },
  },

  // ===================== Account =====================
  {
    name: "check_credits",
    title: "Check credit balance",
    description: "Check the remaining SociaVault credit balance for the configured API key. Use this to confirm you have credits before running paid scrape calls.",
    path: "/v1/credits",
    params: {},
  },
];
