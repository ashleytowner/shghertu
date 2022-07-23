const express = require('express');
const crypto = require('crypto');
const dirs = require('./dirs');
const { config } = require('dotenv');

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

function hash(secret) {
  return `sha256=${crypto
    .createHash('sha256')
    .update(secret)
    .digest('hex')}`;
}

app.post('/update', (req, res) => {
  const reqHash = req.headers['x-hub-signature-256'];
  const secret = hash(process.env.SECRET);
  if (reqHash !== secret) {
    res.sendStatus(403);
    return;
  }
  const execSync = require('child_process').execSync;
  try {
    execSync('git pull', { encoding: 'utf-8' });
    res.sendStatus(200);
    process.exit;
  } catch (err) {
    res.sendStatus(500);
    console.error(err);
  }
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
