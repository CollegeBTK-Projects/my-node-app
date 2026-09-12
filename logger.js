// [ВРЕМЯ] СОБЫТИЕ: ДАННЫЕ
const path = require('path');
const fs = require('fs');
const filepath = path.join(__dirname, 'logs.txt');
const timenow = new Date().toLocaleTimeString();
const stream = fs.createWriteStream(filepath, { flags: 'a', encoding: 'utf8' });
function setupLogger(server, handler, custom) {

  server.once('ServerWithPortCreated', (port) => {
    stream.write(`[${timenow}] ServerWithPortCreated: localhost: ${port}\n`)
  });

  server.once('serverclosed', () => {
    stream.write(`[${timenow}] serverclosed: Сервер отключен\n`)
    stream.end();
  });

  server.on('z', (url, method) => {
    stream.write(`[${timenow}] z : ${url} ${method}\n`)
  });


  custom.on('user:action', (struct1) => {
    stream.write(`[${timenow}] user:action: Пользователь ${struct1.userId} совершил действие "${struct1.action}"\n`);
  });

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
    stream.write(`[${timenow}] order:complete: 💰 Заказ ${orderId} завершён на сумму ${sum.toFixed(0)} руб. PI = ${pi} \n`)
  });

  handler.on('order:start', (orderId) => {
    stream.write(`[${timenow}] order:start: Заказ #${orderId} начат.\n`)
  })

  handler.on('order:processing', (orderId) => {
    stream.write(`[${timenow}] order:processing: Заказ #${orderId}. Идёт обработка...\n`)
  })
}
module.exports = { setupLogger }; 
