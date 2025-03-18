const fs = require('fs');
const path = require('path');
const { stderr } = require('process');

class OutputHandler {
    constructor(outputFile = null, isStderr = false, append = false) {
        this.outputFile = outputFile;
        this.isStderr = isStderr;
        this.append = append;
        
        // Only initialize file immediately if we're not appending
        // For append mode, we'll create the file on first write
        if (outputFile && !append) {
            this._ensureDirectoryExists();
            fs.writeFileSync(outputFile, '');
        }
    }
    
    _ensureDirectoryExists() {
        if (this.outputFile) {
            const dir = path.dirname(this.outputFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    write(message, newLine = true) {
        if (this.outputFile) {
            try {
                // For append mode, ensure directory exists on first write
                if (this.append) {
                    this._ensureDirectoryExists();
                }
                const content = newLine ? message + '\n' : message;
                fs.appendFileSync(this.outputFile, content);
            } catch (error) {
                // If write fails, output to console instead
                process.stderr.write(`Error writing to ${this.outputFile}: ${error.message}\n`);
                process.stdout.write(newLine ? message + '\n' : message);
            }
        } else {
            const stream = this.isStderr ? process.stderr : process.stdout;
            if (newLine) {
                stream.write(message + '\n');
            } else {
                stream.write(message);
            }
        }
    }

    writeError(message, newLine = true) {
        // If this is a stderr handler with redirection, write to file
        if (this.isStderr && this.outputFile) {
            try {
                // For append mode, ensure directory exists on first write
                if (this.append) {
                    this._ensureDirectoryExists();
                }
                const content = newLine ? message + '\n' : message;
                fs.appendFileSync(this.outputFile, content);
            } catch (error) {
                // If write fails, output to stderr instead
                process.stderr.write(`Error writing to ${this.outputFile}: ${error.message}\n`);
                process.stderr.write(newLine ? message + '\n' : message);
            }
        } else {
            if (newLine) {
                process.stderr.write(message + '\n');
            } else {
                process.stderr.write(message);
            }
        }
    }
}

module.exports = { OutputHandler };