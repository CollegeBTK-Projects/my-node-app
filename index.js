const http = require('http');
const EventEmitter = require('events');
const fs = require('fs');
const express = require('express')
const { setupLogger } = require('./logger');
class AppServer extends EventEmitter {
  start(port) {
    const app = express()

    app.use((req, res, next) => {
      setTimeout(() => {
        this.emit('z', req.url, req.method);
        next();
      }, 2000);
    });


    app.get("/order/:id", (req, res) => {
      const id = parseInt(req.params.id);

      handler.processOrder(id);
      res.end();
    });

    this.server = http.createServer(app);

    this.server.listen(port, () => {
      this.emit('ServerWithPortCreated', port);
    });
  }
  stop() {
    this.server.close(() => {
      this.emit('serverclosed');
    });
  }
}

class OrderHandler extends EventEmitter {
  processOrder(orderId) {
    this.emit('order:start', orderId);
    setTimeout(() => {
      this.emit('order:processing', orderId);
    }, 2000);
    setTimeout(() => {
      let sum = Math.random() * (1000 - 100) + 100;
      this.emit('order:complete', orderId, sum);
    }, 2000);
  }
}

class UserTracker extends EventEmitter {
  trackAction(userId, action, metadata) {
    const struct1 = {
      "userId": userId,
      "action": action,
      "timestamp": new Date().toISOString(),
      "metadata": metadata,
      "id": Math.random().toString(36).substr(2, 9)
    }

    this.emit('user:action', struct1);
    return struct1;
  }
}


const custom = new UserTracker();
const server = new AppServer();
const handler = new OrderHandler();

setupLogger(server, handler, custom);

custom.on('user:action', (struct1) => {
  console.log(`👤 Пользователь ${struct1.userid} совершил действие "${struct1.action}"
  Время: ${struct1.timestamp}
  Id события: ${struct1.id}

  Доп.данные: ${JSON.stringify(struct1.metadata)}\n`);
});

custom.trackAction(1, "Учу Node.js/Express.js", { "level": "beginner" });
custom.trackAction(2, "Выполнил 5 заданий", { "status": "await" });

handler.on('order:complete', (orderId, sum) => {
  const nomer = 7;
  let sum_pi = 0;
  let znak = 1;
  for (let k = 0; k < 1000000; k++) {
    const den = 2 * k + 1;
    sum_pi += znak / den;
    znak = -znak;
  }
  let pi = 4 * sum_pi;

  console.log(`💰 Заказ ${orderId} завершён на сумму ${sum.toFixed(0)} руб. PI = ${pi}`)
});

handler.on('order:start', (orderId) => {
  console.log(`Заказ #${orderId} начат.`)
})

handler.on('order:processing', (orderId) => {
  console.log(`Заказ #${orderId}. Идёт обработка...`);
})

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
setTimeout(() => {
  server.stop();
}, 30000); 
