const fs = require('fs');

function readFile(path) {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) rej(err);
      res(data.toString());
    })
  })
}

function readDir(directory) {
  return new Promise((res, rej) => {
    fs.readdir(directory, (err, files) => {
      if (err) rej(err);
      res(files);
    })
  });
}

function statFile(path) {
  return new Promise((res, rej) => {
    fs.stat(path, (err, stats) => {
      if (err) rej(err);
      res(stats);
    })
  })
}

async function recurseDirectory(directory) {
  const paths = (await readDir(directory)).map(file => `${directory}/${file}`);
  const dirs = [];
  const files = [];
  for (const path of paths) {
    const stats = await statFile(path);
    if (stats.isDirectory()) {
      dirs.push(path);
    } else {
      files.push(path);
    }
  }
  if (dirs.length > 0) {
    for (const path of dirs) {
      const subpath = await recurseDirectory(path);
      files.push(...subpath);
    }
  }
  return files;
}

function parsePath(path, extensionExemptions) {
  const paths = path.split('/');
  paths.shift();
  paths.shift();
  const file = paths.pop();
  if (!file) throw new Error('Something went wrong with path splitting');
  const [fileName, extension] = file.split('.');
  paths.push(fileName === 'index' ? '' : fileName);
  const filename = extensionExemptions.indexOf(extension) !== -1 ? `/${paths.join('/')}` : `/${paths.join('/')}.${extension}`
  return [filename, extension];
}

module.exports = { recurseDirectory };
