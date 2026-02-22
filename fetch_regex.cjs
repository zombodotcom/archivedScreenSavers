const https = require('https');
const ids = ['lffSRN', 'tsXBzS', 'MdXSWn', 'tsScRK', '4ttSWf', 'XsXXDn', 'Ms2SD1', 'Ml2XRD', 'wtcSzN', '3l23Rh', 'XlfGRj', 'mtyGWy', '4dcGW2'];

Promise.all(ids.map(id => new Promise(resolve => {
    https.get('https://www.shadertoy.com/view/' + id, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const nameMatch = data.match(/"name"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"/);
            const userMatch = data.match(/"username"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"/);
            resolve({
                id: id,
                name: nameMatch ? nameMatch[1] : 'Unknown',
                author: userMatch ? userMatch[1] : 'Unknown'
            });
        });
    }).on('error', () => resolve({ id, error: 'Network error' }));
}))).then(res => console.log(JSON.stringify(res, null, 2)));
