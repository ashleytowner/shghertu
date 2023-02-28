const express = require('express');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { config } = require('dotenv');
const fs = require('fs');
const { execSync } = require('child_process');
const directories = require('./directories');

let isHttps = true;

config();

const app = express();

app.use(express.json({
  verify: (req, _, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
}));

app.use((req, res, next) => {
  if (req.protocol !== 'https' && isHttps) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  return next();
});

function verifyPostData(req, res, next) {
  if (!process.env.SECRET) {
    res.status(500);
    return next('Internal Error');
  }
  if (!req.rawBody) {
    res.status(400);
    return next('Request body empty');
  }

  const sig = Buffer.from(req.get(process.env.SIG_HEADER_NAME) || '', 'utf8');
  const hmac = crypto.createHmac(process.env.SIG_HASH_ALG, process.env.SECRET);
  const digest = Buffer.from(
    `${process.env.SIG_HASH_ALG}=${hmac.update(req.rawBody).digest('hex')}`,
    'utf8'
  );
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    res.status(401);
    return next(`Request body digest did not match ${process.env.SIG_HASH_ALG} (${sig})`);
  }

  return next();
}

const rootDir = `${__dirname}/public`;
const httpPort = process.env.HTTP_PORT;
const httpsPort = process.env.HTTPS_PORT;

directories.recurseDirectory(rootDir).then((dirs) => {
  const paths = dirs.map((dir) => {
    const partial = dir.match(/\/public\/.+/)[0]
      .split('/').filter(Boolean);
    partial.shift();
    return partial.join('/');
  });
  paths.forEach((path) => {
    app.get(path.split('.')[0] === 'index' ? '/' : `/${path}`, (_, res) => {
      res.sendFile(path, { root: rootDir });
    });
  });
});

app.post('/update', verifyPostData, (_, res) => {
  try {
    execSync('git pull', { encoding: 'utf-8' });
    execSync('npm i --omit=dev');
    res.sendStatus(200);
    // NOTE: This will cause the server to shut down, run it with pm2 or
    // something similar to ensure it starts back up again.
    process.exit();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
});

try {
  const privateKeyPath = process.env.SSL_KEY;
  const publicKeyPath = process.env.SSL_CERT;
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const certificate = fs.readFileSync(publicKeyPath, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(httpsPort, () => {
    isHttps = true;
    console.log(`HTTPS Server listening on port ${httpsPort}`);
  });
} catch (ex) {
  isHttps = false;
  console.error('Certificates not found. Not using HTTPS');
}

const httpServer = http.createServer(app);

httpServer.listen(httpPort, () => {
  console.log(`HTTP Server listening on port ${httpPort}`);
});
