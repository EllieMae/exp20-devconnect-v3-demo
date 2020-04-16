const path = require('path');

module.exports = async function (apiClient, config) {
    // Create new loan
    var loanId = null;
    try {
        var payload = {
            applications: [
                {
                    vods: [
                        {
                            owner: "Both",
                            holderName: "Bank of America",
                            items: [
                                {
                                    itemNumber: 1,
                                    type: "CheckingAccount",
                                    accountIdentifier: "BOA-CHECKING",
                                    cashOrMarketValueAmount: 11000
                                },
                                {
                                    itemNumber: 2,
                                    type: "SavingsAccount",
                                    accountIdentifier: "BOA-SAVINGS",
                                    cashOrMarketValueAmount: 12000
                                },
                                {
                                    itemNumber: 3,
                                },
                                {
                                    itemNumber: 4,
                                }
                            ]
                        },
                        {
                            owner: "Borrower",
                            holderName: "Citibank",
                            items: [
                                {
                                    itemNumber: 1,
                                    type: "CheckingAccount",
                                    accountIdentifier: "CITI-CHECKING",
                                    cashOrMarketValueAmount: 21000
                                },
                                {
                                    itemNumber: 2,
                                },
                                {
                                    itemNumber: 3,
                                },
                                {
                                    itemNumber: 4,
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        console.log("Creating new loan with vods . . .");
        loanId = await apiClient.createNewLoan(payload, config.loanFolder);
        console.log("Loan created with id: " + loanId);
        console.log();
    } catch (err) {
        console.log("Error while creating new loan:");
        console.log(err);
        return;
    }

    // Get vods in the loan and save it to file
    var loanFilePath = null;
    try {
        loanFilePath = path.resolve("./data/4-verif-collections/loans/" + loanId + ".vods.json");
        console.log("Downloading loan data for vods to: " + loanFilePath);
        await apiClient.downloadLoanToFile(loanId, loanFilePath, {entities: "vods"});
        console.log("Loan data downloaded successfully");
        console.log();
    } catch (err) {
        console.log("There was an error while downloading the loan: ", err);
    }

    // Read required ids form loan
    var applicationId = require(loanFilePath).applications[0].id;
    var vodIds = require(loanFilePath).applications[0].vods.map(vod => vod.id);

    // Update loan
    try {
        var payload = {
            applications: [
                {
                    id: applicationId,
                    vods: [
                        {
                            id: vodIds[0],
                            holderAddressStreetLine1: "123 A street",
                            holderAddressCity: "Spokane",
                            holderAddressState: "WA",
                            holderAddressPostalCode: "99210"
                        }
                    ]
                }
            ]
        }

        console.log("Updating existing vods using loan api . . .");
        await apiClient.updateLoan(loanId, payload);
        console.log("Loan: " + loanId + " updated");
        console.log();
    } catch (err) {
        console.log("Error while updating loan " + loanId + ":");
        console.log(err);
    }
    
    // Update vods
    try {
        var payload = [
            {
                id: vodIds[1],
                holderAddressStreetLine1: "6754 Sam Street",
                holderAddressCity: "Hollywood",
                holderAddressState: "FL",
                holderAddressPostalCode: "33020"
            }
        ]

        console.log("Updating existing vods using vods collection api . . .");
        await apiClient.updateLoanSubCollection(
            loanId, 
            {
                args:["applications", applicationId, "vods"], 
                action:"update"
            }, 
            payload);
        console.log("Vods in loan: " + loanId + " updated");
        console.log();
    } catch (err) {
        console.log("Error while updating loan " + loanId + ":");
        console.log(err);
    }
    
    // Add new vod
    try {
        var payload = [
            {
                holderName: "ETrade",
                items: [
                    {
                        itemNumber: 1,
                        type: "Stock",
                        accountIdentifier: "ETRADE-STOCK",
                        cashOrMarketValueAmount: 31000
                    },
                    {
                        itemNumber: 2,
                    },
                    {
                        itemNumber: 3,
                    },
                    {
                        itemNumber: 4,
                    }
    ]
            }
        ]

        console.log("Updating existing vods using vods collection api . . .");
        await apiClient.updateLoanSubCollection(
            loanId, 
            {
                args:["applications", applicationId, "vods"], 
                action:"add"
            }, 
            payload);
        console.log("Vods in loan: " + loanId + " updated");
        console.log();
    } catch (err) {
        console.log("Error while updating loan " + loanId + ":");
        console.log(err);
    }

    // Get vods in the loan and save it to file
    var loanFilePath = null;
    try {
        loanFilePath = path.resolve("./data/4-verif-collections/loans/" + loanId + ".vods.collection.json");
        console.log("Downloading vods collection in loan to: " + loanFilePath);
        await apiClient.downloadLoanSubCollectionToFile(
            loanId, 
            { args:["applications", applicationId, "vods"] }, 
            loanFilePath);
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