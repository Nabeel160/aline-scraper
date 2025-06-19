const fetch = require('node-fetch').default;

const fetchHtml = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

module.exports = { fetchHtml };