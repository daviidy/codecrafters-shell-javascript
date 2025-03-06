const { ExternalCommand } = require('./ExternalCommand');
const path = require('path');
const fs = require('fs');

class CommandRegistry {
  static COMMAND_TYPE = {
    UNRECOGNIZED: 0,
    BUILTIN: 1,
    EXTERNAL: 2
  };
  
  constructor() {
    this.commands = new Map();
    this.commandPaths = new Map();
  }
  
  registerBuiltin(name, command) {
    this.commands.set(name, command);
  }
  
  getCommand(name) {
    return this.commands.get(name);
  }
  
  getCommandType(name) {
    if (this.commands.has(name)) {
      return CommandRegistry.COMMAND_TYPE.BUILTIN;
    } else if (this.isCommandExecutable(name, process.env.PATH)) {
      return CommandRegistry.COMMAND_TYPE.EXTERNAL;
    }
    return CommandRegistry.COMMAND_TYPE.UNRECOGNIZED;
  }
  
  getCommandPath(name) {
    return this.commandPaths.get(name);
  }
  
  isCommandExecutable(command, envPath) {
    const dirs = envPath.split(":");
    for (const dir of dirs) {
      const currentPath = path.join(dir, command);
      try {
        const stats = fs.statSync(currentPath);
        if (stats.isFile() && this.isExecutable(stats)) {
          this.commandPaths.set(command, currentPath);
          return true;
        }
      } catch (error) {
        continue;
      }
    }
    return false;
  }
  
  isExecutable(stats) {
    return (stats.mode & 0o111) !== 0;
  }
  
  createExternalCommand(name, outputHandler) {
    const commandPath = this.getCommandPath(name);
    return new ExternalCommand(commandPath, outputHandler);
  }
}

module.exports = { CommandRegistry }