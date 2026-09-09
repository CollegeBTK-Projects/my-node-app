const http = require('http');
const EventEmitter = require('events');
const fs = require('fs');
const { setupLogger } = require('./logger');
class AppServer extends EventEmitter {
  start(port) {
    this.server = http.createServer((req, res) => {
      setTimeout(() => {
        this.emit('z', req.url, req.method);
      }, 2000);


      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write('<h1>Мишкевич Максим</h1>');
      res.write('478<br>');
      res.end(`Число PI: ${pi.toFixed(nomer)}`);
    });

    this.server.listen(port, () => {
      this.emit('ServerWithPortCreated', port);
    });
  }
  stop() {
    setTimeout(() => {
      this.server.close(() => {
        this.emit('serverclosed');
      });
    }, 20000);
  }
}
const nomer = 14;
let sum = 0;
let znak = 1;
for (let k = 0; k < 1000000; k++) {
  const den = 2 * k + 1;
  sum += znak / den;
  znak = -znak;
}
let pi = 4 * sum;

const server = new AppServer();
setupLogger(server);
server.once('ServerWithPortCreated', (port) => {
  console.log(`Сервер запущен на порту: ${port}`)
});
server.once('serverclosed', () => {
  console.log("сервер остановлен");
  process.exit(0);
});
server.on('z', (url, method) => {
  console.log(`${url} ${method}`);
  console.log("Hello from Event-Driven Server")
});
server.start(8080)
server.stop()
