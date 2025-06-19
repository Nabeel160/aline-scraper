const { PdfReader } = require('pdfreader');

const parsePdf = (buffer) => {
  return new Promise((resolve, reject) => {
    const pages = [];
    let currentPage = 0;

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) return reject(err);
      if (!item) {
        const results = pages.map((lines = [], idx) => ({
          title: `Page ${idx+1}`,
          markdown: lines.join(' '),
          source_url: null
        }));
        return resolve(results);
      }
      if (item.page) {
        currentPage = item.page;
        if (!pages[currentPage-1]) pages[currentPage-1] = [];
      }
      if (item.text && currentPage > 0) {
        pages[currentPage-1].push(item.text);
      }
    });
  });
}

module.exports = { parsePdf };
