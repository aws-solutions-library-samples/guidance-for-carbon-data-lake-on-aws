import { commandInput } from "./command.js"
import chalk from "chalk";

export async function createConfiguration(modules) {
    let configuration = {};
    modules.forEach(element => {
        configuration[element] = true;
    });

    return configuration;
    };
