const express = require('express');
const proxy = require('http-proxy-middleware');


function get_express_server(certs, host="localhost", port=8443) {
  let app = require('express')();
  set_api_server(app, certs, host, port)
  app.use(express.static(__dirname+'/dist'));
  app.use((req, res) => res.sendFile(`${__dirname}/dist/index.html`));
  return app;
}


function set_api_server(app, certs, host="localhost", port=8443) {
    let options = {
        logLevel: 'error',
        target: {
          host:  'TASKALIVE',
          hostname: host,
          port: port,
          protocol: 'https:',
          key: certs.key,
          cert: certs.cert,
          ca: certs.ca
        },
        changeOrigin: true,               // needed for virtual hosted sites
        ws: true                         // proxy websockets
    };
    let exampleProxy = proxy(options);
    app.use('/api', exampleProxy);
    return app
}
