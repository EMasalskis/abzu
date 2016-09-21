var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var convict = require('./config/convict.js')

var ENDPOINTBASE = "/"

var app = new (require('express'))()
var port = process.env.port || 8988

var config = require('./webpack.config')
var compiler = webpack(config)

app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))

if (process.env.NODE_ENV !== 'production') {
  app.use(webpackHotMiddleware(compiler))
}

app.get(ENDPOINTBASE, function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get(ENDPOINTBASE + 'edit/:id', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get(ENDPOINTBASE + '_health', function(req, res) {
  res.sendStatus(200)
})

app.get(ENDPOINTBASE + "config/keycloak.json", function(req, res) {
  res.sendFile(__dirname + '/config/keycloak.json')
})

app.get(ENDPOINTBASE + "config.json", function(req, res) {
  var cfg = {
    nabuBaseUrl: convict.get('nabuBaseUrl'),
    mardukBaseUrl: convict.get('mardukBaseUrl')
  }
  res.send(cfg)
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> Listening on port %s. Open up http://localhost:%s in your browser.", port, port)
  }
})
