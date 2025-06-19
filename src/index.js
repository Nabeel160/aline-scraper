const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { scrapeUrl } = require('./scraper');
const { parsePdf } = require('./pdfParser')
const { formatItems } = require('./outputFormatter');

(async () => {
  const program = new Command();
  program
    .option('-u, --url <url>', 'Blog or guide URL to scrape')
    .option('-p, --pdf <path>', 'Path to PDF to parse')
    .requiredOption('-t, --teamId <id>', 'Team ID for JSON output');

  program.parse(process.argv);
  const opts = program.opts();
  let items = [];

  if (opts.url) {
    items = await scrapeUrl(opts.url);
  }
  if (opts.pdf) {
    const pdfBuffer = fs.readFileSync(path.resolve(opts.pdf));
    items = await parsePdf(pdfBuffer);
  }

  const output = {
    team_id: opts.teamId,
    items: formatItems(items)
  };

  const outPath = path.resolve(process.cwd(), './data/output.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Results written to ${outPath}`);
})();