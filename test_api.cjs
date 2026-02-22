const https = require('https');
https.get('https://www.shadertoy.com/api/v1/shaders/lffSRN?key=rtcfbQ', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("STATUS:", res.statusCode);
        console.log("HEADERS:", res.headers);
        console.log("BODY_PREFIX:", data.substring(0, 200));
    });
});
