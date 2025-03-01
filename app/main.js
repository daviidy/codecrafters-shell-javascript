const readline = require("readline");
const path = require('path');
const fs = require('fs');
const {spawn} = require('child_process');
const { stdout, stderr } = require("process");
let currentCommandPath

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const isCommandExecutable = (command, envPath) => {
  const dirs = envPath.split(":")
  for (const dir of dirs) {
    const currentPath = path.join(dir, command)
    try {
      const stats = fs.statSync(currentPath);
      if (stats.isFile() && isExecutable(stats)) {
        currentCommandPath = currentPath;
        return true;
      }
    } catch (error) {
      continue;
    }
  }
  return false
}

const isExecutable = (stats) => {
  return (stats.mode & 0o111) !== 0;
}

const executeCommand = (commandPath, args) => {
  return new Promise((resolve, reject) => {
    // get the name of the command
    const commandDir = path.dirname(commandPath);

    // Make sure this directory is at the front of the PATH
    // so that if commandDir is not found, it looks for the command
    // in the second part of the colon :
    process.env.PATH = `${commandDir}:${process.env.PATH}`;
    const child = spawn(commandPath, args, {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = 'Output: ';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    child.on('error', (err) => {
      reject(err);
    });
  })
}

const handleInput = () => {
  rl.question("$ ", async (answer) => {
    const envPath = process.env.PATH

    const mapOfCommandType = new Map()
    const UNRECOGNIZED_COMMAND = 0
    const SHELL_TYPE = 1
    mapOfCommandType.set('echo', SHELL_TYPE)
    mapOfCommandType.set('exit', SHELL_TYPE)
    mapOfCommandType.set('type', SHELL_TYPE)
    const arr = answer.split(" ")
    if(arr[0] === 'exit') {
      rl.close()
      return 0
    } else if(arr[0] === 'echo') {
      arr.shift()
      console.log(arr.join(" "))
    } else if(arr[0] === 'type') {
      if (mapOfCommandType.get(arr[1]) && mapOfCommandType.get(arr[1]) === 1) {
        console.log(`${arr[1]} is a shell builtin`)
      } else if(isCommandExecutable(arr[1], envPath)) {
        console.log(`${arr[1]} is ${currentCommandPath}`)
      }
      else {
        console.log(`${arr[1]}: not found`)
      }
      
    } else if (isCommandExecutable(arr[0], envPath)) {
      const commandToExecute = arr.shift()
      try {
        await executeCommand(commandToExecute, arr)
      } catch (error) {
        console.error(`Error executing command: ${error.message}`);
      }
    } else {
      console.log(`${answer}: command not found`)
    }
    
    handleInput()
  });
}

handleInput()

