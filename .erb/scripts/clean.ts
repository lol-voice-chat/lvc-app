import { rimrafSync } from 'rimraf';
import fs from 'fs';
import webpackPahts from '../configs/webpack.paths';

const foldersToRemove = [webpackPahts.distPath, webpackPahts.buildPath];

foldersToRemove.forEach((folder) => {
  if (fs.existsSync(folder)) rimrafSync(folder);
});
