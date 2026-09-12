const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

class FileManagerError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'FileManagerError';
    this.code = code;
    this.originalError = originalError;
  }
}

class FileManagerHybrid {
  constructor(baseDir = './data-hybrid') {
    this.baseDir = baseDir;
    this.initDir();
  }

  initDir() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
      console.log(`Создана директория: ${this.baseDir}`);
    }
  }

  _validateFilename(filename) {
    if (!filename || typeof filename !== 'string') {
      throw new FileManagerError(
        'Имя файла должно быть непустой строкой',
        'INVALID_FILENAME'
      );
    }
  }

  _wrapError(err) {
    if (err instanceof FileManagerError) return err;

    if (err.code === 'ENOENT') {
      return new FileManagerError('Файл не найден', 'NOT_FOUND', err);
    }
    if (err.code === 'EACCES') {
      return new FileManagerError('Нет доступа к файлу', 'ACCESS_DENIED', err);
    }
    if (err.code === 'EEXIST') {
      return new FileManagerError('Файл уже существует', 'ALREADY_EXISTS', err);
    }
    return new FileManagerError(
      err.message || 'Неизвестная ошибка',
      'UNKNOWN',
      err
    );
  }

  _resolve(promise, callback) {
    const wrapped = promise.catch((err) => {
      throw this._wrapError(err);
    });

    if (typeof callback === 'function') {
      wrapped
        .then((result) => callback(null, result))
        .catch((err) => callback(err, null));
      return undefined;
    }

    return wrapped;
  }

  createFile(filename, content, callback) {
    try {
      this._validateFilename(filename);
    } catch (err) {
      if (typeof callback === 'function') return callback(err, null);
      return Promise.reject(err);
    }

    const filePath = path.join(this.baseDir, filename);
    const promise = writeFile(filePath, content, 'utf8').then(() => filePath);

    return this._resolve(promise, callback);
  }

  readFile(filename, callback) {
    try {
      this._validateFilename(filename);
    } catch (err) {
      if (typeof callback === 'function') return callback(err, null);
      return Promise.reject(err);
    }

    const filePath = path.join(this.baseDir, filename);
    const promise = readFile(filePath, 'utf8');

    return this._resolve(promise, callback);
  }

  getFileStats(filename, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = stat(filePath).then((stats) => ({
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    }));

    return this._resolve(promise, callback);
  }

  deleteFile(filename, callback) {
    const filePath = path.join(this.baseDir, filename);
    const promise = unlink(filePath);

    return this._resolve(promise, callback);
  }

  listFiles(callback) {
    const promise = readdir(this.baseDir).then(async (files) => {
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.baseDir, file);
          const stats = await stat(filePath);
          return { name: file, isFile: stats.isFile() };
        })
      );
      return fileStats.filter((f) => f.isFile).map((f) => f.name);
    });

    return this._resolve(promise, callback);
  }
}

module.exports = FileManagerHybrid;
module.exports.FileManagerError = FileManagerError;
