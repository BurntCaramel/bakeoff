const Path = require('path')
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const { Union } = require('unionfs')
const FS = require('fs')

const inputFS = new MemoryFS()
inputFS.writeFileSync('/package.json', JSON.stringify({
  "name": "backoff-target",
  "version": "1.0.0",
  "description": "",
  "main": "src/entry.js"
}))

inputFS.mkdirSync('/src')
inputFS.writeFileSync('/src/entry.js', (
`
// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
// import './index.css';

console.log('HELLO!')

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );
`
))

inputFS.writeFileSync('/src/App.js', (
`import React from 'react';

function App(props) {
  return (
    <div>APP!</div>
  )
}

export default App;
`
))

inputFS.writeFileSync('/src/index.css', (
`
html {
  font-size: 20px;
}
`
))

const unionInputFS = new Union()
unionInputFS.use(inputFS, FS)

const outputFS = new MemoryFS()
outputFS.mkdirSync('/dist')

const compiler = webpack({
  // context: '/',
  entry: '/src/entry',
  // resolve: {
  //   modules: ['/', 'node_modules'],
  //   extensions: ['.js', '.jsx']
  // },
  output: {
    path: '/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          './src'
        ],
        loader: 'babel-loader',
        options: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
        options: {
        }
      }
    ]
  }
})

compiler.inputFileSystem = unionInputFS
compiler.outputFileSystem = outputFS
compiler.resolvers.normal.fileSystem = unionInputFS
compiler.resolvers.context.fileSystem = unionInputFS
// compiler.resolvers.loader.fileSystem = unionInputFS

function run() {
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      console.log('run error', error, stats && stats.compilation.errors)
      if (error) {
        reject(error)
      }
      else {
        resolve({ stats, fs: outputFS })
      }
    })
  })
}

module.exports = {
  run
}