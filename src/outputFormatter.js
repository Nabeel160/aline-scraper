const formatItems = (rawItems) => {
    return rawItems.map(item => ({
      title: item.title,
      content: item.markdown,
      content_type: detectType(item.source_url),
      source_url: item.source_url || '',
      author: item.author || '',
      user_id: ''
    }));
  }
  
  function detectType(url) {
    if (!url) return 'book';
    if (url.includes('blog') || url.match(/\/blog/)) return 'blog';
    return 'other';
  }
  
  module.exports = { formatItems };