const path = require('path');
const colors = require('colors');
const indentString = require('indent-string');

module.exports = async function (apiClient, config) {

    const validatePayload = (payload) => {
        console.log("Validating payload: ".bold);
        console.log(indentString(JSON.stringify(payload, null, 4), 4).gray);
        var errors = apiClient.validateLoanPayloadWithSchema(payload, schemaFilePath);
        if (errors.length > 0) {
            console.log("Validation Errors:".bold.red);
            errors.forEach((err, index) => console.log((" " + (index + 1) + ") " + err.property + " " + err.message).bold.red));
        } else {
            console.log("Validation Successful!".bold.green);
        }   
        console.log();
    }
    
    // Download v3 loan schema
    var schemaFilePath = path.resolve("./data/1-loan-schema/v3-loan-schema.json");
    console.log(colors.bold("Downloading loan schema to " + schemaFilePath));
    await apiClient.downloadLoanSchema(schemaFilePath);
    console.log();
    
    // Validate invalid payload with schema
    var payload = { 
        "applications": [
            {
                "borrower": {
                    "firstName": 1,
                    "lastName": 2
                }
            }
        ] 
    };
    validatePayload(payload);

    // Correct the payload
    payload.applications[0].borrower.firstName = "Albert"
    payload.applications[0].borrower.lastName = "Einstein"

    // Validate valid payload with schema
    validatePayload(payload);
}