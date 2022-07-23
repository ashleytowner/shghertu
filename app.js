const express = require('express');

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

app.post('/update', (req, res) => {
  console.log(JSON.stringify(req.headers));
  const execSync = require('child_process').execSync;
  execSync('git pull', { encoding: 'utf-8' });
  res.send(200);
  process.exit;
});

app.post('/test', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.send('yep');
})

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
