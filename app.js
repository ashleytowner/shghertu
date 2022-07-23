const express = require('express');
const crypto = require('crypto');
const dirs = require('./dirs');
const { config } = require('dotenv');

config();

const app = express();


app.use(express.json({
  verify: (req, _, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
}))

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
    app.get(path.split('.')[0] === 'index' ? '/' : `/${path}`, (req, res) => {
      res.sendFile(path, { root: public });
    })
  })
});

app.post('/update', verifyPostData, (req, res) => {
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

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
