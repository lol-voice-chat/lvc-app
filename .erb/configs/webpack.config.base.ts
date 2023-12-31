import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            //번들링하기 전 타입체크 생략
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    plugins: [new TsconfigPathsPlugins()],
  },
};

export default configuration;
