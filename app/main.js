const readline = require("readline");
const path = require('path');
const fs = require('fs');
const {execFile} = require('child_process');
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

const handleInput = () => {
  rl.question("$ ", (answer) => {
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
      
    } else if (isCommandExecutable(arr[1], envPath)) {
      execFile(path.join(envPath, arr[1]), arr.shift(), (error, stdout, stderr) => {
        if(error) {
          console.error(stderr)
        }
        if(stderr) {
          console.log('Errors:', stderr)
        }

        console.log('Output', stdout)
      })
    } else {
      console.log(`${answer}: command not found`)
    }
    
    handleInput()
  });
}

handleInput()

