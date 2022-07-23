const express = require('express');
const dirs = require('./dirs');
const { config } = require('dotenv');

config();

const app = express();

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

app.post('/update', () => {
  const execSync = require('child_process').execSync;
  execSync('./update.sh', { encoding: 'utf-8' });
})

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
