const fs = require('fs');
const path = require('path');

class OutputHandler {
    constructor(outputFile = null, isStderr = false, append = false) {
        this.outputFile = outputFile;
        this.isStderr = isStderr;
        this.append = append;
        this.fileInitialized = false;
    }

    _initializeFile() {
        // Only initialize the file once
        if (!this.fileInitialized && this.outputFile) {
            try {
                const dir = path.dirname(this.outputFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                // If not appending, clear the file
                if (!this.append) {
                    fs.writeFileSync(this.outputFile, '');
                } else if (!fs.existsSync(this.outputFile)) {
                    // For append mode, just touch the file if it doesn't exist
                    fs.writeFileSync(this.outputFile, '');
                }
                
                this.fileInitialized = true;
            } catch (error) {
                // If we can't initialize the file, just log to console instead
                process.stderr.write(`Cannot initialize file ${this.outputFile}: ${error.message}\n`);
            }
        }
    }
    
    write(message, newLine = true) {
        if (this.outputFile) {
            try {
                // Ensure file is initialized first
                this._initializeFile();
                
                // Only write if initialization succeeded
                if (this.fileInitialized) {
                    const content = newLine ? message + '\n' : message;
                    fs.appendFileSync(this.outputFile, content);
                } else {
                    // Fall back to console
                    process.stdout.write(newLine ? message + '\n' : message);
                }
            } catch (error) {
                // Fall back to console
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
                // Ensure file is initialized first
                this._initializeFile();
                
                // Only write if initialization succeeded
                if (this.fileInitialized) {
                    const content = newLine ? message + '\n' : message;
                    fs.appendFileSync(this.outputFile, content);
                } else {
                    // Fall back to stderr console
                    process.stderr.write(newLine ? message + '\n' : message);
                }
            } catch (error) {
                // Fall back to stderr console
                process.stderr.write(newLine ? message + '\n' : message);
            }
        } else {
            if(this.outputFile) {
                this._initializeFile();
            }
            try {
                if (newLine) {
                    process.stderr.write(`${message} \n + $ `);
                } else {
                    process.stderr.write(message);
                }

                process.stdout.write('$ ');
            } catch (error) {
                console.error('Error writing to streams:', error);
            }
        }
    }
}

module.exports = { OutputHandler };