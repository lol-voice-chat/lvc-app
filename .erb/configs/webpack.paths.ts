import path from 'path';

const rootPath = path.join(__dirname, '../..');

const srcPath = path.join(rootPath, 'src');
const srcMainPath = path.join(srcPath, 'main');
const srcRendererPath = path.join(srcPath, 'renderer');

const releasePath = path.join(rootPath, 'release');
const appPath = path.join(releasePath, 'app');
const appNodeModulesPath = path.join(appPath, 'node_modules');

const distPath = path.join(appPath, 'dist');
const disMainPath = path.join(distPath, 'main');
const distRendererPath = path.join(distPath, 'renderer');

const buildPath = path.join(releasePath, 'build');

export default {
  srcPath,
  srcMainPath,
  srcRendererPath,
  distPath,
  disMainPath,
  distRendererPath,
  appNodeModulesPath,
  buildPath,
};
