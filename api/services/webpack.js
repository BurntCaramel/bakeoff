const Path = require('path')
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const { Union } = require('unionfs')
const createMergedFileSystem = require('merged-fs')
const FS = require('fs')

const inputFS = new MemoryFS()
inputFS.mkdirSync('/app')
inputFS.writeFileSync('/app/package.json', JSON.stringify({
  "name": "backoff-target",
  "version": "1.0.0",
  "description": "",
  "main": "src/entry.js"
}))

inputFS.mkdirSync('/app/src')
inputFS.writeFileSync('/app/src/entry.js', (
`
// import React from 'react';
// import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

console.log('HELLO! TWO!')

function Main({
  Component,
  cProps
}) {
  return (
    <Component {...cProps} />
  )
}

ReactDOM.render(
  <Main Component={ App } cProps={{}} />,
  document.getElementById('root')
);
`
))

inputFS.writeFileSync('/app/src/App.js', (
`import React from 'react';

function App(props) {
  return (
    <div>DYNAMIC! APP!</div>
  )
}

export default App;
`
))

inputFS.writeFileSync('/app/src/index.css', (
`
html {
  font-size: 20px;
  line-height: 2;
}
`
))

const unionInputFS = new Union()
unionInputFS.use(inputFS, FS)

const mergedInputFS = createMergedFileSystem({
  [Path.resolve(__dirname, '..', 'app')]: {
    alias: '/app',
    filesystem: inputFS
  },
  '/': '/'
})

const outputFS = new MemoryFS()
outputFS.mkdirSync('/dist')

// global.System = {
//   import(path) {
//     const path2 = path.replace(/^\/node_modules\//, '')
//     console.log('System.import', path, path2)
//     const resolvedPath = require.resolve(path2, {
//       options: {
//         path: Path.resolve(__dirname, '..')
//       }
//     })
//     const a = require(resolvedPath)
//     return Promise.resolve(a)
//   }
// }

const webPath = (suffix) => (
  Path.join(Path.resolve(__dirname, '..'), suffix)
)

const compiler = webpack({
  // context: '/',
  context: webPath('/'),
  entry: webPath('/app/src/entry.js'),
  resolve: {
    modules: ['node_modules'],
    // modules: [Path.resolve(__dirname, '..', 'node_modules')],
    // extensions: ['.js', '.jsx']
  },
  output: {
    // path: webPath('/app/dist'),
    path: '/app/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          webPath('/app/src')
          // './app/src',
          // '/app/src'
        ],
        loader: 'babel-loader',
        options: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.css$/,
        // include: [
        //   // () => true,
        //   // './src',
        //   // Path.resolve(__dirname, 'src')
        //   //'/'
        // ],
        loader: 'css-loader',
        options: {
        }
      }
    ]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
})

compiler.outputFileSystem = outputFS
compiler.inputFileSystem = mergedInputFS
// compiler.resolvers.normal.fileSystem = mergedInputFS
// compiler.resolvers.context.fileSystem = mergedInputFS
// compiler.resolvers.loader.fileSystem = mergedInputFS

function run({
  componentJS,
  props
} = {}) {
  return new Promise((resolve, reject) => {

    if (componentJS) {
      inputFS.writeFileSync('/app/src/App.js', componentJS)
    }

    if (props) {
      inputFS.writeFileSync('/app/src/entry.js', (
        `
        import React from 'react';
        import ReactDOM from 'react-dom';
        import App from './App';
        import './index.css';
        
        console.log('HELLO! TWO!')
        
        class Main extends React.Component {
          render() {
            const {
              Component,
              cProps
            } = this.props

            return (
              <Component {...cProps} />
            )
          }

          componentDidCatch(error) {
            console.error(error)
          }
        }
        
        ReactDOM.render(
          <Main Component={ App } cProps={ ${JSON.stringify(props)} } />,
          document.getElementById('root')
        );
        `
        ))
    }

    compiler.run((error, stats) => {
      console.log('run error', error, stats && stats.compilation.errors)
      if (error) {
        reject(error)
      }
      else {
        resolve({
          stats,
          // bundleJS: FS.readFileSync
          bundleJS: outputFS.readFileSync('/app/dist/bundle.js')
        })
      }
    })
  })
}

module.exports = {
  run
}