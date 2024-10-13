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

async function getGistContent(octokit, gistId, filename) {
    try {
        const gist = await octokit.gists.get({ gist_id: gistId });
        const fileContent = gist.data.files[filename]?.content || null;
        if (!fileContent) {
            console.log(`No content found for ${filename} in gist ${gistId}`);
            return null;
        }
        const currentWordsList = JSON.parse(fileContent);
        return currentWordsList;
    } catch (error) {
        console.error('Error fetching gist content:', error);
        throw error;
    }
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

    // Get the current content of the gist
    console.log('Fetching current gist content...');
    const currentWordsList = await getGistContent(octokit, gistId, gistFilename);

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
