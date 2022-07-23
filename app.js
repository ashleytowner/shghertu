const express = require('express');
const dirs = require('./dirs');

const app = express();

const public = `${__dirname}/public`;
const port = 80;

dirs.recurseDirectory(public).then(dirs => {
  const paths = dirs.map(dir => {
    const partial = dir.match(/\/public\/.+/)[0]
      .split('/').filter(Boolean);
    partial.shift();
    return partial.join('/');
  })
  paths.forEach(path => {
    app.get(`/${path}`, (req, res) => {
      res.sendFile(path, { root: public });
    })
  })
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: public });
})

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
