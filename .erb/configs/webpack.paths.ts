import path from 'path';

const rootPath = path.join(__dirname, '../..');

const publicPath = path.join(rootPath, 'public');

const srcPath = path.join(rootPath, 'src');
const srcMainPath = path.join(srcPath, 'main');
const srcRendererPath = path.join(srcPath, 'renderer');

const releasePath = path.join(rootPath, 'release');
const appPath = path.join(releasePath, 'app');

const distPath = path.join(appPath, 'dist');
const disMainPath = path.join(distPath, 'main');
const distRendererPath = path.join(distPath, 'renderer');

const buildPath = path.join(releasePath, 'build');

export default {
  publicPath,
  srcPath,
  srcMainPath,
  srcRendererPath,
  distPath,
  disMainPath,
  distRendererPath,
  buildPath,
};
