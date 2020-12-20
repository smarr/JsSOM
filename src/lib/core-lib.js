//@ts-check
"use strict";
import { existsSync, readFileSync } from 'fs';

export function getFile(path, file) {
    const name = path + '/' + file;
    if (!existsSync(name)) {
        return null;
    }
    return readFileSync(name, {encoding: 'utf-8'});
}
