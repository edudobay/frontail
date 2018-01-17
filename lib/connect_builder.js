'use strict';

const connect = require('connect');
const fs = require('fs');

function ConnectBuilder() {
  this.app = connect();
}

ConnectBuilder.prototype.authorize = function authorize(user, pass) {
  this.app.use(
    connect.basicAuth(
      (incomingUser, incomingPass) => user === incomingUser && pass === incomingPass));

  return this;
};

ConnectBuilder.prototype.build = function build() {
  return this.app;
};

ConnectBuilder.prototype.index = function index(url, path, files, filesNamespace, themeOpt) {
  const theme = themeOpt || 'default';

  this.app.use(url, (req, res) => {
    fs.readFile(path, (err, data) => {
      res.writeHead(200, {
        'Content-Type': 'text/html',
      });
      res.end(
        data
          .toString('utf-8')
          .replace(/__ROOT__/g, url)
          .replace(/__TITLE__/g, files)
          .replace(/__THEME__/g, theme)
          .replace(/__NAMESPACE__/g, filesNamespace),
        'utf-8'
      );
    });
  });

  return this;
};

ConnectBuilder.prototype.session = function session(secret, key) {
  this.app.use(connect.cookieParser());
  this.app.use(
    connect.session({
      secret,
      key,
    })
  );
  return this;
};

ConnectBuilder.prototype.static = function staticf(url, path) {
  if (path === undefined) {
    path = url
    url = '/'
  }
  this.app.use(url, connect.static(path));
  return this;
};

module.exports = () => new ConnectBuilder();
