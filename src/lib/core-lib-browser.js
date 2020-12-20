//@ts-check
"use strict";
import { loadCoreLib } from '../core-lib-data.js';

const somCoreLibData = loadCoreLib();

export function getFile(path, file) {
    var current = somCoreLibData["core-lib"];

    path.split("/").forEach(function (e) {
        if (current == undefined) {
            return null;
        }
        current = current[e];
    });

    if (current == undefined || current[file] == undefined) {
        return null;
    } else {
        return current[file];
    }
}
