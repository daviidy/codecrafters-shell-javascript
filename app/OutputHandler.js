class OutputHandler {
    write(message, newLine = true) {
        if (newLine) {
            console.log(message);
        } else {
            process.stdout.write(message);
        }
    }

    writeError(message, newLine = true) {
        if (newLine) {
            console.error(message);
        } else {
            process.stderr.write(message);
        }
    }
}

module.exports = { OutputHandler };