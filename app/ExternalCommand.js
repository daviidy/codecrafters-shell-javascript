const { Command } = require("./Command");
const path = require('path');
const { spawn } = require('child_process');

class ExternalCommand extends Command {
  constructor(commandPath, outputHandler) {
    super();
    this.commandPath = commandPath;
    this.outputHandler = outputHandler;
  }
  
  async execute(args) {
    try {
      await this.executeCommand(this.commandPath, args);
    } catch (error) {
    }
    return { shouldContinue: true };
  }
  
  executeCommand(commandPath, args) {
    return new Promise((resolve, reject) => {
      const commandDir = path.dirname(commandPath);
      process.env.PATH = `${commandDir}:${process.env.PATH}`;
      
      // Get just the basename for argv[0]
      const commandName = path.basename(commandPath);
      
      const child = spawn(commandPath, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        argv0: commandName // Set argv[0] to just the command name
      });
  
      let stdout = '';
      let stderr = '';
  
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        if (!this.outputHandler.outputFile || this.outputHandler.isStderr) {
          process.stdout.write(output);
        } else {
          this.outputHandler.write(output, false);
        }
      });
  
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        this.outputHandler.writeError(output, false);
      });
  
      child.on('error', (err) => {
        reject(err);
      });
  
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });
    });
  }
}

module.exports = { ExternalCommand }