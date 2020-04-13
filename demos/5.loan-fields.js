const colors = require('colors');
const indentString = require('indent-string');

module.exports = async function (apiClient, config) {

    // Create loan with fields 
    try {
        var fields = {
            "4000": "Albert", 
            "4002": "Einstein", 
            "182#2": "CashOnHand-1",
            "183#2": 30000 
        }
        console.log("Creating loan with fields:");
        console.log(indentString(JSON.stringify(fields, null, 4), 4).gray);
        loanId = await apiClient.createNewLoanWithFields(fields, config.loanFolder);
        console.log("Loan created with id: " + loanId);
        console.log();
    } catch (err) {
        console.log("Error while creating new loan:");
        console.log(err);
        return;
    }

    // get loan fields
    try {
        var fieldIds = ["4000", "4002", "1868", "182#2", "183#2"];
        console.log("Getting loan fields: " + fieldIds.join(", ") + " . . .");
        var fields = await apiClient.getLoanFields(loanId, fieldIds);
        console.log("Fields fetched from loan " + loanId + ": ");
        console.log(indentString(JSON.stringify(fields, null, 4), 4).gray);
        console.log();
    } catch (err) {
        console.log("There was an error while getting fields for loan: ", err);
    }

    // gte loan fields using field reader
    try {
        var fieldIds = ["4000", "4002", "1868", "182#2", "183#2"];
        console.log("Getting loan fields using field reader: " + fieldIds.join(", ") + " . . .");
        var fields = await apiClient.getLoanFieldsWithFieldReader(loanId, fieldIds);
        console.log("Fields fetched from loan " + loanId + ": ");
        console.log(indentString(JSON.stringify(fields, null, 4), 4).gray);
        console.log();
    } catch (err) {
        console.log("There was an error while getting fields for loan: ", err);
    }

    // Delete loan
    try {
        console.log("Deleting loan: " + loanId + " . . .");
        await apiClient.deleteLoan(loanId);
        console.log("Loan: " + loanId + " deleted");
        console.log();
    } catch (err) {
        console.log("Error while deleting loan " + loanId + ":");
        console.log(err);
        return;
    }

}