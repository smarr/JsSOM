// @ts-check
// eslint-disable-next-line import/no-unresolved
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
