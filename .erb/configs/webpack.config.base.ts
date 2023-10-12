import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin';

const configuration: webpack.Configuration = {
  externals: {
    //ws 외부 종속성 번들링 제외
    bufferutil: 'bufferutil',
    'utf-8-validate': 'utf-8-validate',
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
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

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    plugins: [new TsconfigPathsPlugins()],
  },
};

export default configuration;
