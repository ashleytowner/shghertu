const express = require('express');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const dirs = require('./dirs');
const { config } = require('dotenv');
const fs = require('fs');


config();

const app = express();

const usingHttps = false;

function getFullUrl(req) {
  return `${req.protocol}://${req.get('host')}${req.url}`;
}

function changeProtocol(req, protocol) {
  return `${protocol}://${req.get('host')}${req.url}`;
}

app.use(express.json({
  verify: (req, _, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
}))

app.use((req, _, next) => {
  console.log(req.method, getFullUrl(req), req.ip);
  next();
})

app.use((req, res, next) => {
  if (!req.secure && usingHttps) {
    return res.redirect(303, changeProtocol(req, 'https'));
  }
  next();
})

function verifyPostData(req, _, next) {
  if (!process.env.SECRET) {
    return next();
  }
  if (!req.rawBody) {
    return next('Request body empty')
  }

  const sig = Buffer.from(req.get(process.env.SIG_HEADER_NAME) || '', 'utf8')
  const hmac = crypto.createHmac(process.env.SIG_HASH_ALG, process.env.SECRET)
  const digest = Buffer.from(process.env.SIG_HASH_ALG + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    return next(`Request body digest (${digest}) did not match ${process.env.SIG_HASH_ALG} (${sig})`)
  }

  return next()
}

const public = `${__dirname}/public`;
const port = process.env.PORT;

dirs.recurseDirectory(public).then(dirs => {
  const paths = dirs.map(dir => {
    const partial = dir.match(/\/public\/.+/)[0]
      .split('/').filter(Boolean);
    partial.shift();
    return partial.join('/');
  })
  paths.forEach(path => {
    app.get(path.split('.')[0] === 'index' ? '/' : `/${path}`, (_, res) => {
      res.sendFile(path, { root: public });
    })
  })
});

app.post('/update', verifyPostData, (_, res) => {
  const execSync = require('child_process').execSync;
  try {
    execSync('git pull', { encoding: 'utf-8' });
    res.sendStatus(200);
    process.exit();
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
});

try {
  const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
  const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(443, () => {
    usingHttps = true;
    console.log('HTTPS Server listening on 443');
  });
} catch (ex) {
  console.error('Certificates not found. Not using HTTPS');
}

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  console.log(`HTTP Server listening on ${port}`);
});
