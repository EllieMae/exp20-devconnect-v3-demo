const path = require('path');

module.exports = async function (apiClient, config) {

    // Create new loan
    var loanId = null;
    try {
        console.log("Creating new loan with empty paylod . . .");
        loanId = await apiClient.createNewLoan({}, config.loanFolder);
        console.log("Loan created with id: " + loanId);
        console.log();
    } catch (err) {
        console.log("Error while creating new loan:");
        console.log(err);
        return;
    }

    // Get loan with includeEmpty=true and save it to file
    var loanFilePath = path.resolve("./data/2-loan-crud/loans/" + loanId + ".includeEmpty.json");
    try {
        console.log("Downloading loan data with option includeEmpty=true to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath, {includeEmpty: true});
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
    }

    // Update loan
    try {
        var applicationId = require(loanFilePath).applications[0].id;
        var payload = {
            applications: [
                {
                    id: applicationId,
                    assets: [
                        {
                            assetType: "OtherNonLiquidAssets",
                            assetTypeIndex: 2,
                            cashOrMarketValueAmount: 20000 //224
                        }
                    ],
                    borrower: {
                        firstName: "Nikhil" //4000
                    }
                }
            ]
        }

        console.log("Updating loan . . .");
        await apiClient.updateLoan(loanId, payload);
        console.log("Loan: " + loanId + " updated");
        console.log();
    } catch (err) {
        console.log("Error while updating loan " + loanId + ":");
        console.log(err);
    }

    
    // Get loan again
    try {
        var loanFilePath = path.resolve("./data/2-loan-crud/loans/" + loanId + ".json");
        console.log("Downloading loan data with default options to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath);
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
        return;
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