const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Public Key:\n', vapidKeys.publicKey);
console.log('\n🔐 Private Key:\n', vapidKeys.privateKey);
