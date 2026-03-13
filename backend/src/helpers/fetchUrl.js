import axios from 'axios';
import * as cheerio from 'cheerio';

export const fetchUrlData = async (url) => {
  const response = await axios.get(url, {
    timeout: 5000, // 5 seconds — don't wait forever
    headers: {
      // pretend to be a browser — some sites block bot requests
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const $ = cheerio.load(response.data);

  // prefer og:title over title tag — usually cleaner
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    'Untitled';

  const type = detectType(url);
  const domain = new URL(url).hostname;

  return { title, type, domain };
};

const detectType = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('github.com')) return 'project';
  if (url.includes('/docs/') || url.includes('documentation')) return 'docs';
  return 'article';
};