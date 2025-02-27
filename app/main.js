const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleInput = () => {
  rl.question("$ ", (answer) => {
    const arr = answer.split(" ")
    if(arr[0] === 'exit') {
      console.log(0)
      rl.close()
      return
    }
    console.log(`${answer}: command not found`)
    handleInput()
  });
}

handleInput()

