// @ts-check
// @ts-expect-error - this file is generated during the build process
import { loadCoreLib } from '../core-lib-data.js';

const somCoreLibData = loadCoreLib();

export function getFile(path, file) {
  let current = somCoreLibData['core-lib'];

  for (const e of path.split('/')) {
    if (current === undefined) {
      break;
    }
    current = current[e];
  }

  if (current === undefined || current[file] === undefined) {
    return null;
  }
  return current[file];
}

export function getFileByName(filename) {
  let current = somCoreLibData['core-lib'];

  const path = filename.split('/');
  const file = path.pop();

  for (const e of path) {
    if (current === undefined) {
      break;
    }
    current = current[e];
  }

  if (current === undefined || current[file] === undefined) {
    return null;
  }
  return current[file];
}
