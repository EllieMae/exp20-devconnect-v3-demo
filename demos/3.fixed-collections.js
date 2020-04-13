const path = require('path');

module.exports = async function (apiClient, config) {
    // Create new loan
    var loanId = null;
    try {
        var payload = {
            applications: [
                {
                    assets: [
                        {
                            assetType: "CashOnHand",
                            assetTypeIndex: 1,

                            // FieldId: 182
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'CashOnHand' && @.assetTypeIndex == 1)].accountIdentifier
                            accountIdentifier: "CashOnHand-1",

                            // FieldId: 183
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'CashOnHand' && @.assetTypeIndex == 1)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 30000   
                        },
                        {
                            assetType: "CashOnHand",
                            assetTypeIndex: 2,

                            // FieldId: 1715
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'CashOnHand' && @.assetTypeIndex == 2)].accountIdentifier
                            accountIdentifier: "CashOnHand-2",

                            // FieldId: 1716
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'CashOnHand' && @.assetTypeIndex == 2)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 50000 
                        },
                        {
                            assetType: "OtherNonLiquidAssets",
                            assetTypeIndex: 2,

                            // FieldId: 224
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'OtherNonLiquidAssets' && @.assetTypeIndex == 2)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 3000 
                        },
                        {
                            assetType: "OtherNonLiquidAssets",
                            assetTypeIndex: 5,

                            // FieldId: 212
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'OtherNonLiquidAssets' && @.assetTypeIndex == 5)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 5000 
                        }
                    ]
                }
            ]
        }
        console.log("Creating new loan with assets . . .");
        loanId = await apiClient.createNewLoan(payload, config.loanFolder);
        console.log("Loan created with id: " + loanId);
        console.log();
    } catch (err) {
        console.log("Error while creating new loan:");
        console.log(err);
        return;
    }

    // Get assets in the loan and save it to file
    var loanFilePath = null;
    try {
        loanFilePath = path.resolve("./data/3-fixed-collections/loans/" + loanId + ".assets.A.json");
        console.log("Downloading loan data for assets to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath, {entities: "assets"});
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
    }

    // Update loan
    var applicationId = require(loanFilePath).applications[0].id;
    try {
        var payload = {
            applications: [
                {
                    id: applicationId,
                    assets: [
                        {
                            assetType: "OtherNonLiquidAssets",
                            assetTypeIndex: 2,

                            // FieldId: 224
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'OtherNonLiquidAssets' && @.assetTypeIndex == 2)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 3500 
                        },
                        {
                            assetType: "OtherNonLiquidAssets",
                            assetTypeIndex: 1,

                            // FieldId: 222
                            // JsonPath: $.applications[0].assets[?(@.assetType == 'OtherNonLiquidAssets' && @.assetTypeIndex == 1)].cashOrMarketValueAmount
                            cashOrMarketValueAmount: 1000 
                        },
                    ]
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
    
    
    // Get assets in the loan and save it to file
    try {
        loanFilePath = path.resolve("./data/3-fixed-collections/loans/" + loanId + ".assets.B.json");
        console.log("Downloading loan data for assets to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath, {entities: "assets"});
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
    }
    
    // Get assets (including empty) in the loan and save it to file
    try {
        loanFilePath = path.resolve("./data/3-fixed-collections/loans/" + loanId + ".assets.C.json");
        console.log("Downloading loan data for assets to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath, {entities: "assets", includeEmpty: true});
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
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