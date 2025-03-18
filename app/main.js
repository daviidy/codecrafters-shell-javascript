const readline = require("readline");
const { OutputHandler } = require("./OutputHandler");
const { InputHandler } = require("./InputHandler");
const { CommandRegistry } = require("./CommandRegistry");
const { ExitCommand } = require("./ExitCommand");
const { EchoCommand } = require("./EchoCommand");
const { TypeCommand } = require("./TypeCommand");
const { PwdCommand } = require("./PwdCommand");
const { CdCommand } = require("./CdCommand");
class Shell {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    this.outputHandler = new OutputHandler();
    this.inputHandler = new InputHandler(this.rl);
    this.commandRegistry = new CommandRegistry();
    
    // Register builtin commands
    this.commandRegistry.registerBuiltin('exit', new ExitCommand(this.rl));
    this.commandRegistry.registerBuiltin('echo', new EchoCommand(this.outputHandler));
    this.commandRegistry.registerBuiltin('pwd', new PwdCommand(this.outputHandler));
    this.commandRegistry.registerBuiltin('cd', new CdCommand(this.outputHandler));
    this.commandRegistry.registerBuiltin('type', new TypeCommand(this.commandRegistry, this.outputHandler));
  }

  getCommandNameAndArgs(input) {
    const args = [];
    let currentArg = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escapeNextChar = false;
    let redirectionOperator = null;
    let redirectionFile = null;
  
    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      // if we encounter an escape character, skip the next character
      if(escapeNextChar) {
        currentArg += char;
        escapeNextChar = false;
        continue;
      }

      if ((char === '>' || char === '1' || char === '2') && !inSingleQuote && !inDoubleQuote) {
        if (char === '>' && input[i + 1] === '>') {
          redirectionOperator = '>>'; // Append operator
          i += 1; // Skip the second '>'
        } else if (char === '1' && input[i + 1] === '>') {
          if (input[i + 2] === '>') {
            redirectionOperator = '1>>'; // Explicit append for stdout
            i += 2; // Skip '>>'
          } else {
            redirectionOperator = '1>'; // Overwrite stdout
            i += 1; // Skip '>'
          }
        } else if (char === '2' && input[i + 1] === '>') {
          if (input[i + 2] === '>') {
            redirectionOperator = '2>>'; // Explicit append for stderr
            i += 2; // Skip '>>'
          } else {
            redirectionOperator = '2>'; // Overwrite stderr
            i += 1; // Skip '>'
          }
        } else if (char === '>' && input[i + 1] !== '>') {
          redirectionOperator = '1>'; // Default to stdout overwrite
        }

        if (currentArg.length > 0) {
          args.push(currentArg);
          currentArg = '';
        }
        continue;
      }

      if (redirectionOperator && char !== ' ') {
        if (!redirectionFile) {
          redirectionFile = '';
        }
        while (i < input.length && input[i] !== ' ') {
          redirectionFile += input[i];
          i++;
        }
        i--;
        redirectionOperator = null; // Reset redirection operator after capturing the file
        continue;
      }

      // if we encounter a backslash and we're not inside a quote
      if(char === '\\' && !inSingleQuote && !inDoubleQuote) {
        escapeNextChar = true;
        continue;
      }

      // if we encounter a backslash and we're inside a quote
      if(char === '\\' && inDoubleQuote && (input[i + 1] === '"' || input[i + 1] === '\\' || input[i + 1] === '$')) {
        escapeNextChar = true;
        continue;
      }        
  
      // if we encounter a single quote and we're not inside a double quote
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }
  
      // if we encounter a double quote and we're not inside a single quote
      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }
  
      // push the current argument if we encounter a space and we're not inside a quote
      if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
        if (currentArg.length > 0) {
          args.push(currentArg);
          currentArg = '';
        }
        continue;
      }
  
      currentArg += char;
    }
  
    // push the last argument
    if (currentArg.length > 0) {
      args.push(currentArg);
    }

    console.log('redirectionOperator:', redirectionOperator);
  
    // extract the command name and remove quotes from arguments
    const commandName = args.shift();
    return { 
      commandName, 
      args,
      redirection: redirectionFile ? { operator: redirectionOperator, file: redirectionFile } : null 
    };
  }
  
  async parseCommand(input) {
    const { commandName, args, redirection } = this.getCommandNameAndArgs(input);

    // Check if it's a builtin command
    const command = this.commandRegistry.getCommand(commandName);
    if (command) {
      if (redirection) {
        const append = redirection?.operator === '2>>' || redirection?.operator === '1>>' || redirection?.operator === '>>';
        const isStderr = redirection?.operator.startsWith('2');
        const outputHandler = redirection
          ? new OutputHandler(redirection.file, isStderr, append)
          : this.outputHandler;
        command.outputHandler = outputHandler; // Assign the output handler to the command
      }
      return { command, args };
    }
    
    // Check if it's an external command
    const commandType = this.commandRegistry.getCommandType(commandName);
    if (commandType === CommandRegistry.COMMAND_TYPE.EXTERNAL) {
      const append = redirection?.operator === '2>>' || redirection?.operator === '1>>' || redirection?.operator === '>>';
      const isStderr = redirection?.operator.startsWith('2');
      const outputHandler = redirection
        ? new OutputHandler(redirection.file, isStderr, append)
        : this.outputHandler;

      const externalCommand = this.commandRegistry.createExternalCommand(
        commandName,
        outputHandler
      );
      return { command: externalCommand, args };
    }
    
    // Command not found
    this.outputHandler.write(`${commandName}: command not found`);
    return { command: null, args };
  }
  
  async start() {
    let shouldContinue = true;
    
    while (shouldContinue) {
      const input = await this.inputHandler.getInput("$ ");
      
      if (input.trim() === '') {
        continue;
      }
      
      const { command, args } = await this.parseCommand(input);
      
      if (command) {
        const result = await command.execute(args);
        shouldContinue = result.shouldContinue;
      }
    }
  }
}

// Initialize and start the shell
const shell = new Shell();
shell.start();