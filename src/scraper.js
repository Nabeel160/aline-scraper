const cheerio = require('cheerio');
const { fetchHtml } = require('./utils');
const TurndownService = require('turndown');

const turndown = new TurndownService();

const scrapeUrl = async (url) => {

  const parsed = new URL(url);

  if (parsed.hostname.endsWith('substack.com')) {
    return await scrapeSubstack(url);
  }

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  let posts = [];

  const items = $('article, .post, .blog-item');
  if (items.length > 0) {
    items.each((i, el) => {
      const title = $(el).find('h1,h2,h3').first().text().trim();
      const contentHtml = $(el).find('section, .content, .post-body').html();
      const markdown = turndown.turndown(contentHtml || $(el).html());
      posts.push({ title, markdown, source_url: url });
    });
    return posts;
  }

  const headings = $('h1');
  headings.each((i, el) => {
    const title = $(el).text().trim();
    let contentHtml = '';
    let sib = el.next;
    while (sib && sib.name !== 'h1') {
      if (sib.type === 'tag') contentHtml += $.html(sib);
      sib = sib.next;
    }
    const markdown = turndown.turndown(contentHtml);
    posts.push({ title, markdown, source_url: url });
  });

  return posts;
}
const scrapeSubstack = async (baseUrl) => {
  const feedUrl = baseUrl.replace(/\/?$/, '/') + 'feed';
  const feedXml = await fetchHtml(feedUrl);
  const $feed = cheerio.load(feedXml, { xmlMode: true });
  const posts = [];

  $feed('item').each((i, el) => {
    const title = $feed(el).find('title').text().trim();
    const link = $feed(el).find('link').text().trim();
    posts.push({ title, link });
  });

  const results = [];

  for (const post of posts) {
    try {
      const html = await fetchHtml(post.link);
      const $ = cheerio.load(html);
      const contentHtml = $('article').html() || $('.post-content').html() || $.html();
      const markdown = turndown.turndown(contentHtml);
      results.push({ title: post.title, markdown, source_url: post.link });
    } catch (err) {
      console.warn(`Failed to fetch Substack post ${post.link}: ${err.message}`);
    }
  }

  return results;
}

module.exports = { scrapeUrl };