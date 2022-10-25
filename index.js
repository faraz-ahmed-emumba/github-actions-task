const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end("This webserver is serving app version "+process.env.APP_VERSION+"\nAuthor: "+process.env.NAME);
});

server.listen(port, hostname, () => {
  console.log(`The server is running on http://${hostname}:${port}/`);
});