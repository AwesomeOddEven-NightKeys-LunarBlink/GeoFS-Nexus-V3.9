const fs = require('fs');
const https = require('https');

const content = fs.readFileSync('main.js', 'utf8');
const urls = content.match(/https:\/\/(?:raw\.githack\.com|cdn\.jsdelivr\.net|raw\.githubusercontent\.com)[^\s"']+/g);
const uniqueUrls = [...new Set(urls)];

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                console.log(`OK: ${url}`);
            } else {
                console.log(`FAIL (${res.statusCode}): ${url}`);
            }
            resolve();
        }).on('error', (err) => {
            console.log(`ERROR: ${url} - ${err.message}`);
            resolve();
        });
    });
}

(async () => {
    for (const url of uniqueUrls) {
        await checkUrl(url);
    }
})();
