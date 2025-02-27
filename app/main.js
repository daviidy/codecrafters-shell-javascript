const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleInput = () => {
  rl.question("$ ", (answer) => {
    const arr = answer.split(" ")
    if(arr[0] === 'exit') {
      rl.close()
      return 0
    } else if(arr[0] === 'echo') {
      arr.shift()
      console.log(arr.join(" "))
    } else {
      console.log(`${answer}: command not found`)
    }
    
    handleInput()
  });
}

handleInput()

