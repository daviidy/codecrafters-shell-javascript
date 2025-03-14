const fs = require('fs');
const path = require('path');

class OutputHandler {
    constructor(outputFile = null) {
        this.outputFile = outputFile;
        if (outputFile) {
            // Create directory if it doesn't exist
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Clear the file when first creating the handler
            fs.writeFileSync(outputFile, '');
        }
    }

    write(message, newLine = true) {
        if (this.outputFile) {
            const content = newLine ? message + '\n' : message;
            fs.appendFileSync(this.outputFile, content);
        } else {
            if (newLine) {
                console.log(message);
            } else {
                process.stdout.write(message);
            }
        }
    }

    writeError(message, newLine = true) {
        // Error output should always go to stderr, not to the redirected file
        if (newLine) {
            console.error(message);
        } else {
            process.stderr.write(message);
        }
    }
}

module.exports = { OutputHandler };