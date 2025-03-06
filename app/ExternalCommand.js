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
      return { shouldContinue: true };
    } catch (error) {
      this.outputHandler.writeError(`Error executing command: ${error.message}`);
      return { shouldContinue: true };
    }
  }
  
  executeCommand(commandPath, args) {
    return new Promise((resolve, reject) => {
      const commandDir = path.dirname(commandPath);
      process.env.PATH = `${commandDir}:${process.env.PATH}`;
      
      const child = spawn(commandPath, args, {
        stdio: ['inherit', 'pipe', 'pipe']
      });
  
      let stdout = '';
      let stderr = '';
  
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        this.outputHandler.write(output, false);
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