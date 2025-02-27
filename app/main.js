const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleInput = () => {
  rl.question("$ ", (answer) => {
    const mapOfCommandType = new Map()
    const UNRECOGNIZED_COMMAND = 0
    const SHELL_TYPE = 1
    mapOfCommandType.set('echo', SHELL_TYPE)
    mapOfCommandType.set('exit', SHELL_TYPE)
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
      } else {
        console.log(`${arr[1]}: not found`)
      }
      
    } else {
      console.log(`${answer}: command not found`)
    }
    
    handleInput()
  });
}

handleInput()

