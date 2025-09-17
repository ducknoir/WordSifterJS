import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/rest';

async function scrapeViaApify(sourceUrl) {
    const token = process.env.APIFY_TOKEN;
    const actorId = 'apify/cheerio-scraper'
    const runRes = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: sourceUrl }],
        maxRequestsPerCrawl: 1,
        proxyConfiguration: { useApifyProxy: true },
        pageFunction: `async function pageFunction(context) {
          const { $, request } = context;
          return { url: request.url, chronlist: $('#chronlist').text() || '' };
        }`,
      }),
    });
    if (!runRes.ok) throw new Error(`Apify run start failed: ${runRes.status}`);
    const run = await runRes.json();
  
    const waitRes = await fetch(`https://api.apify.com/v2/actor-runs/${run.data.id}?token=${token}&waitForFinish=120`);
    const waited = await waitRes.json();
    if (waited.data.status !== 'SUCCEEDED') throw new Error(`Apify run did not succeed: ${waited.data.status}`);
  
    const dsId = waited.data.defaultDatasetId;
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${dsId}/items?token=${token}&clean=true&format=json`);
    if (!itemsRes.ok) throw new Error('Failed to fetch Apify dataset items');
    const items = await itemsRes.json();
    return items[0]?.chronlist || '';
}
  
async function scrapeWebsite(sourceUrl) {
    if (process.env.APIFY_TOKEN) {
      const chronText = await scrapeViaApify(sourceUrl);
      return `<div id="chronlist">${chronText}</div>`;
    }
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.text();
}

  function parseHtml(html) {
    const $ = cheerio.load(html);
    const clist = $('#chronlist');
    const lines = clist.text().split('\n').slice(1);
    const json = lines.map((line) => {
        const parts = line.split(' ');
        const [month, day, year] = parts[2].split('/');

        return {
            n: parseInt(parts[1]),
            w: parts[0],
            d: `20${year}-${month}-${day}`,
        };
    });
    return json;
}

async function getGistContentRaw(gistId, filename) {
    const owner = process.env.GIST_OWNER; // optional
    const candidates = owner
      ? [
          `https://gist.githubusercontent.com/${owner}/${gistId}/raw/${filename}`,
          `https://gist.github.com/${owner}/${gistId}/raw/${filename}`,
        ]
      : [
          `https://gist.githubusercontent.com/${gistId}/raw/${filename}`,
          `https://gist.github.com/${gistId}/raw/${filename}`,
        ];
  
    for (const url of candidates) {
      try {
        const res = await fetch(url, { redirect: 'follow' });
        if (res.ok) {
          const text = await res.text();
          return JSON.parse(text);
        }
      } catch (_) {}
    }
    return null;
}

  async function updateGist(octokit, gistId, filename, jsonContent) {
    try {
        const response = await octokit.gists.update({
            gist_id: gistId,
            files: {
                [filename]: {
                    content: jsonContent,
                },
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error updating gist:', error);
        throw error;
    }
}

async function main() {
    const usedWordsUrl = process.env.USED_WORDS_SOURCE_URL;
    if (!usedWordsUrl) {
        throw new Error('USED_WORDS_SOURCE_URL is not set');
    }

    console.log(`Scraping website from ${usedWordsUrl}...`);
    const html = await scrapeWebsite(usedWordsUrl);
    console.log('Website scraped successfully. Parsing HTML...');
    const newWordsList = parseHtml(html);
    console.log(`HTML parsed successfully, got ${newWordsList.length} words`);

    const githubToken = process.env.GIST_UPDATE_TOKEN;
    if (!githubToken) {
        throw new Error('GIST_UPDATE_TOKEN is not set');
    }

    const gistId = process.env.GIST_ID;
    if (!gistId) {
        throw new Error('GIST_ID is not set');
    }

    const gistFilename = 'used_words.json';

    const octokit = new Octokit({
        auth: githubToken,
    });

    const me = await octokit.rest.users.getAuthenticated();
    console.log('Updating as:', me.data.login);

    const gistMeta = await (await fetch(`https://api.github.com/gists/${gistId}`, { headers: { 'X-GitHub-Api-Version': '2022-11-28' } })).json();
    console.log('Gist owner is:', gistMeta?.owner?.login);

    // Get the current content of the gist
    console.log('Fetching current gist content (raw)…');
    let currentWordsList = await getGistContentRaw(gistId, gistFilename);
    if (!currentWordsList) {
        console.log('Raw fetch failed; falling back to API…');
        currentWordsList = await getGistContent(octokit, gistId, gistFilename);
    }

    if (!currentWordsList) {
        console.log('No existing data found in gist, proceeding with update.');
    } else {
        // Parse the current content of the gist to compare the first element
        if (currentWordsList.length > 0 
            && newWordsList.length === currentWordsList.length
            && JSON.stringify(currentWordsList[0]) === JSON.stringify(newWordsList[0])
        ) {
                console.log('No new data detected (first record matches). Exiting...');
                process.exit(1); // No update needed, exit with non-zero to continue polling
        }
    }

    // Convert the new list of words to a JSON string
    const jsonStr = '[\n'
                    + newWordsList.map(item => JSON.stringify(item)).join(",\n")
                    + '\n]';

    // Update the gist since new data was detected
    console.log('New data detected, updating gist...');
    await updateGist(octokit, gistId, gistFilename, jsonStr);

    console.log('Gist updated successfully.');
    process.exit(0); // Success, exit to stop further polling
}

main().catch((error) => {
    console.error('Error in execution:', error);
    process.exit(1); // Exit with non-zero to retry
});
