const https = require('https');
const ids = ['lffSRN', 'tsXBzS', 'MdXSWn', 'tsScRK', '4ttSWf', 'XsXXDn', 'Ms2SD1', 'Ml2XRD', 'wtcSzN', '3l23Rh', 'XlfGRj', 'mtyGWy', '4dcGW2'];

Promise.all(ids.map(id => new Promise(resolve => {
    https.get('https://www.shadertoy.com/view/' + id, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const titleMatch = data.match(/<title>(.*?)<\/title>/);
            const titleStr = titleMatch ? titleMatch[1].replace(' - Shadertoy', '') : 'Unknown';
            resolve({ id, title: titleStr });
        });
    }).on('error', () => resolve({ id, title: 'Error' }));
}))).then(res => console.log(JSON.stringify(res, null, 2)));
