const fs = require("fs");
const colors = require('colors');
if (process.argv.length <= 2) {
    console.error("Config parameter missing.".red);
    console.log("Usage:\r\n\tnode ./demo-runner.js {INSTANCEID}");
    process.exit(1);
} else if (!fs.existsSync("./config/" + process.argv[2] + ".js")) {
    console.error(colors.red("File: ./config/" + process.argv[2] + ".js does not exist!"));
    console.log("Please copy file config/example.js to config/" + process.argv[2] + ".js and replace the properties with appropriate values specific to your encompass instance.");
    process.exit(1);
}

const inquirer = require("inquirer");
const config = require("./config/" + process.argv[2]);
const ApiClient = require("./api-client/api-client").ApiClient;
const choices = fs.readdirSync("./demos")
    .filter(file => file.endsWith('.js'));

const waitForKeyPress = function () {
    console.log();
    require('child_process').spawnSync("pause _ ", {shell: true, stdio: [0, 1, 2]});
    console.clear();
}

const run = async function() {
    console.clear();
    console.log("Creating ApiClient instance");
    var apiClient = await new ApiClient(config).AsPromise();
    waitForKeyPress();
    
    while(true)
    {
        var answers = await inquirer.prompt([
            {
                name: "script",
                type: "list",
                message: "Choose script to run or Ctrl+C to exit",
                choices: choices
            }
        ]);
        console.clear();
        console.log(("============= Running: ".green + (answers.script.bold.green) + " =============\r\n".green));
        await require("./demos/" + answers.script)(apiClient, config);
        waitForKeyPress();
    }
};

run();
