const https = require('https');
const ids = ['lffSRN', 'tsXBzS', 'MdXSWn', 'tsScRK', '4ttSWf', 'XsXXDn', 'Ms2SD1', 'Ml2XRD', 'wtcSzN', '3l23Rh', 'XlfGRj', 'mtyGWy', '4dcGW2'];
const key = 'rtcfbQ';
Promise.all(ids.map(id => new Promise(resolve => {
    https.get('https://www.shadertoy.com/api/v1/shaders/' + id + '?key=' + key, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.Shader && json.Shader.info) {
                    resolve({ id: id, name: json.Shader.info.name, author: json.Shader.info.username });
                } else {
                    resolve({ id: id, error: 'Not found or private' });
                }
            } catch (e) { resolve({ id: id, error: 'Parse error' }); }
        });
    }).on('error', () => resolve({ id: id, error: 'Network error' }));
}))).then(res => console.log(JSON.stringify(res, null, 2)));
