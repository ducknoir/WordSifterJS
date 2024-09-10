import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/rest';

async function scrapeWebsite(sourceUrl) {
    let html;
    try {
        const sourceResponse = await fetch(sourceUrl);
        if (!sourceResponse.ok) {
            throw new Error(`HTTP error! status: ${sourceResponse.status}`);
        }
        html = await sourceResponse.text();
    } catch (error) {
        console.error('Failed to fetch the website:', error);
        throw error;
    }
    return html;
}

function parseHtml(html) {
    const $ = cheerio.load(html);
    const clist = $('#clist');
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
    const wordsList = parseHtml(html);
    console.log(`HTML parsed successfully, got ${wordsList.length} words`);

    const githubToken = process.env.GIST_UPDATE_TOKEN;
    if (!githubToken) {
        throw new Error('GIST_UPDATE_TOKEN is not set');
    }

    const gistId = process.env.GIST_ID;
    if (!gistId) {
        throw new Error('GIST_ID is not set');
    }

    // Convert the list of words to a JSON string, with one word record per line
    const jsonStr = '[\n'
                    + wordsList.map(item => JSON.stringify(item)).join(",\n")
                    + '\n]';

    // Now send the JSON string to the gist

    const octokit = new Octokit({
        auth: githubToken,
    });

    const gistFilename = 'used_words.json';
    console.log('Updating gist...');
    await updateGist(
        octokit,
        gistId,
        gistFilename,
        jsonStr
    );

    console.log('Gist updated successfully');
}

main().catch((error) => {
    console.error('Error in execution:', error);
    process.exit(1);
});
