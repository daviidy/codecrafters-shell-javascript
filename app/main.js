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
    }
    console.log(`${answer}: command not found`)
    handleInput()
  });
}

handleInput()

