const FileManagerHybrid = require('./fileOperationsHybrid');

const manager = new FileManagerHybrid('./test-data-hybrid');

console.log('=== ЧАСТЬ 1: РАБОТА В СТИЛЕ КОЛБЭКОВ ===\n');

console.log('1. Создание файла...');
manager.createFile('hybrid1.txt', 'Файл создан колбэком', (err, filePath) => {
  if (err) {
    console.error('Ошибка:', err.message, `(${err.code})`);
    return;
  }
  console.log(`  ✅ Файл создан: ${filePath}`);

  console.log('\n2. Чтение файла...');
  manager.readFile('hybrid1.txt', (err, content) => {
    if (err) {
      console.error('Ошибка чтения:', err.message);
      return;
    }
    console.log(`  ✅ Содержимое: "${content}"`);

    console.log('\n3. Попытка прочитать несуществующий файл (проверка ошибок)...');
    manager.readFile('no-such-file.txt', (err) => {
      if (err) {
        console.log(`Ожидаемая ошибка: ${err.message} (код: ${err.code})`);
      }

      runPromiseStyleDemo();
    });
  });
});

async function runPromiseStyleDemo() {
  console.log('\n=== ЧАСТЬ 2: РАБОТА В СТИЛЕ ПРОМИСОВ (тот же объект!) ===\n');

  try {
    console.log('1. Создание файла...');
    const filePath = await manager.createFile('hybrid2.txt', 'Файл создан промисом');
    console.log(`  ✅ Файл создан: ${filePath}`);

    console.log('\n2. Чтение файла...');
    const content = await manager.readFile('hybrid2.txt');
    console.log(`  ✅ Содержимое: "${content}"`);

    console.log('\n3. Получение статистики...');
    const stats = await manager.getFileStats('hybrid2.txt');
    console.log(`  ✅ Размер: ${stats.size} байт`);

    console.log('\n4. Список файлов...');
    const files = await manager.listFiles();
    console.log(`  ✅ Файлы в директории: ${files.join(', ')}`);

    console.log('\n5. Попытка прочитать несуществующий файл (проверка ошибок)...');
    try {
      await manager.readFile('another-missing-file.txt');
    } catch (err) {
      console.log(`Ожидаемая ошибка: ${err.message} (код: ${err.code})`);
    }

    console.log('\n6. Попытка передать некорректное имя файла...');
    try {
      await manager.createFile('', 'что-то');
    } catch (err) {
      console.log(`Ожидаемая ошибка: ${err.message} (код: ${err.code})`);
    }

    console.log('\n7. Очистка...');
    for (const file of files) {
      await manager.deleteFile(file);
      console.log(`  ✅ ${file} удалён`);
    }

    console.log('\n✅ Все операции завершены успешно!');
    console.log('Один и тот же класс отработал и как колбэк, и как промис.');
  } catch (error) {
    console.error('\nНеожиданная ошибка:', error.message);
  }
}
