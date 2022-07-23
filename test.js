const hash = require('crypto')
  .createHash('sha256')
  .update('hello')
  .digest('hex');

console.log(hash);
