const http = require('http');
//использовал ряд Лейбница. Посмотрел как вычисляется алгоритм на python.
const nomer = 14;
let sum = 0;
let znak = 1;

for (let k = 0; k < nomer; k++) {
  const den = 2 * k + 1; //1/1 1/3 1/5 1/7 ... 1/27 не учитывая знаки
  sum += znak / den;
  znak = -znak;
}
// после цикла сумма ряда p/4 

let pi = 4 * sum;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write('<h1>Мишкевич Максим</h1>');
  res.write('478<br>')
  res.write(`Число PI: ${pi}`);
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
