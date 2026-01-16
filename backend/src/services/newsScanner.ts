import Parser from 'rss-parser';
import axios from 'axios';
import cron from 'node-cron';
import { query } from '../utils/database';
import { filterAndExtractFacts } from './factExtractor';

interface RSSFeed {
  url: string;
  region: 'norway' | 'usa' | 'world';
  source: string;
}

const rssParser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// Define news sources
const NEWS_SOURCES: RSSFeed[] = [
  // Norwegian sources
  { url: 'https://www.nrk.no/toppsaker.rss', region: 'norway', source: 'NRK' },
  { url: 'https://www.vg.no/rss/feed/', region: 'norway', source: 'VG' },
  { url: 'https://www.aftenposten.no/rss', region: 'norway', source: 'Aftenposten' },
  { url: 'https://www.dagbladet.no/rss', region: 'norway', source: 'Dagbladet' },

  // US sources
  { url: 'https://feeds.npr.org/1001/rss.xml', region: 'usa', source: 'NPR' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', region: 'usa', source: 'New York Times' },
  { url: 'https://feeds.washingtonpost.com/rss/world', region: 'usa', source: 'Washington Post' },

  // World sources
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', region: 'world', source: 'BBC World' },
  { url: 'https://www.theguardian.com/world/rss', region: 'world', source: 'The Guardian' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'world', source: 'Al Jazeera' },
];

async function fetchAndParseFeed(feed: RSSFeed): Promise<void> {
  try {
    console.log(`Fetching feed: ${feed.source} (${feed.region})`);

    const rssFeed = await rssParser.parseURL(feed.url);

    if (!rssFeed.items || rssFeed.items.length === 0) {
      console.log(`No items found in feed: ${feed.source}`);
      return;
    }

    for (const item of rssFeed.items) {
      try {
        // Skip if article already exists
        const existing = await query(
          'SELECT id FROM articles WHERE url = $1',
          [item.link]
        );

        if (existing.rows.length > 0) {
          continue;
        }

        // Extract article content
        const rawContent = item.contentSnippet || item.content || item.summary || '';
        const title = item.title || '';
        const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

        // Filter and extract facts
        const { filteredContent, summary, category } = await filterAndExtractFacts(
          title,
          rawContent
        );

        // Insert article into database
        await query(
          `INSERT INTO articles
           (title, url, source, region, published_at, raw_content, filtered_content, summary, category, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            title,
            item.link,
            feed.source,
            feed.region,
            publishedAt,
            rawContent,
            filteredContent,
            summary,
            category,
            true,
          ]
        );

        console.log(`Stored article: ${title.substring(0, 50)}...`);
      } catch (itemError) {
        console.error(`Error processing item from ${feed.source}:`, itemError);
      }
    }
  } catch (error) {
    console.error(`Error fetching feed ${feed.source}:`, error);
  }
}

async function scanAllFeeds(): Promise<void> {
  console.log(`Starting news scan at ${new Date().toISOString()}`);

  const scanPromises = NEWS_SOURCES.map((feed) => fetchAndParseFeed(feed));

  try {
    await Promise.allSettled(scanPromises);
    console.log('News scan completed');
  } catch (error) {
    console.error('Error during news scan:', error);
  }
}

export function startNewsScanner(): void {
  // Run immediately on startup
  scanAllFeeds();

  // Schedule to run every 30 minutes
  const interval = process.env.SCAN_INTERVAL_MINUTES || '30';
  cron.schedule(`*/${interval} * * * *`, () => {
    scanAllFeeds();
  });

  console.log(`News scanner started. Scanning every ${interval} minutes.`);
}

// Allow manual execution
if (require.main === module) {
  scanAllFeeds()
    .then(() => {
      console.log('Manual scan completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Manual scan failed:', error);
      process.exit(1);
    });
}
