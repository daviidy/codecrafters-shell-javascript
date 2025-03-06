const { Command } = require('./Command');
const { CommandRegistry } = require('./CommandRegistry'); 

class TypeCommand extends Command {
  constructor(commandRegistry, outputHandler) {
    super();
    this.commandRegistry = commandRegistry;
    this.outputHandler = outputHandler;
  }
  
  execute(args) {
    if (args.length === 0) {
      this.outputHandler.writeError("type: missing argument");
      return { shouldContinue: true };
    }
    
    const commandName = args[0];
    const commandType = this.commandRegistry.getCommandType(commandName);
    
    if (commandType === CommandRegistry.COMMAND_TYPE.BUILTIN) {
      this.outputHandler.write(`${commandName} is a shell builtin`);
    } else if (commandType === CommandRegistry.COMMAND_TYPE.EXTERNAL) {
      this.outputHandler.write(`${commandName} is ${this.commandRegistry.getCommandPath(commandName)}`);
    } else {
      this.outputHandler.write(`${commandName}: not found`);
    }
    
    return { shouldContinue: true };
  }
}

module.exports = { TypeCommand }