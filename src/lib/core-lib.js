// @ts-check

import { existsSync, readFileSync } from 'fs';

export function getFile(path, file) {
  const name = `${path}/${file}`;
  if (!existsSync(name)) {
    return null;
  }
  return readFileSync(name, { encoding: 'utf-8' });
}

export function getFileByName(filename) {
  if (!existsSync(filename)) {
    return null;
  }
  return readFileSync(filename, { encoding: 'utf-8' });
}
