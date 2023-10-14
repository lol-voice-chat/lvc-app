import webpack from 'webpack';
import path from 'path';
import webpackPaths from './webpack.paths';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const configuration: webpack.Configuration = {
  externals: {
    //ws 외부 종속성 번들링 제외
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },

  devtool: 'source-map',

  mode: 'production',

  target: 'electron-main',

  entry: path.join(webpackPaths.srcMainPath, 'main.ts'),

  output: {
    path: webpackPaths.disMainPath,
    filename: 'main.js',
    library: {
      type: 'umd',
    },
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      analyzerPort: 8888,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
