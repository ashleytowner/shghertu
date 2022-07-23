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
    app.get(path.split('.')[0] === 'index' ? '/' : `/${path}`, (req, res) => {
      res.sendFile(path, { root: public });
    })
  })
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
})
