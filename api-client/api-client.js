/**
 * ApiClient class that contains methods to interact with EBS apis
 */
exports.ApiClient = function ApiClient(config) {
    const request = require('request');
    const jp = require('./jsonpath-extensions').addExtensions(require('jsonpath'));
    const fs = require("./fs-extensions").addExtensions(require('fs'));
    const merge = require('deepmerge');
    const logger = require('./logger').GetLogger(config);

    // Create oauth token.
    var _tokenPromise = require("./api-token").GetApiToken(config, logger);

    /**
     * Create options to be passed to request when making an api call.
     * 
     * @param {*} opts 
     * Must contain api path and method, may contain additional override 
     * options such as additonal headers
     * 
     * @param {string} token Oauth token
     */
    function getRequestOptions(opts, token) {
        var options = {
            uri: "https://" + config.hostname + opts.path,
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        };
        return merge(options, opts);
    }

    /**
     * Make an EBS api call for specified options and returns a promise for the api 
     * call response
     * 
     * @param {*} opts 
     * Must contain api path and method, may contain additional override 
     * options such as additonal headers
     * 
     * @param {number} successCode 
     * Expected success code. This will used to match with api response and the method 
     * will throw an exception for anything other than the status code
     */
    function apiRequest(opts, successCode) {
        logger.debug(">>> Start api call [" + opts.method + "] " + opts.path);
        return new Promise((resolve, reject) => {
            _tokenPromise
                .then((token) => {
                    opts = getRequestOptions(opts, token);
                    request(opts, function (error, response) {
                        if (error) {
                            logger.error("!!! Error in api call [" + opts.method + "] " + opts.path + ": " + error);
                            reject(error);
                        } else if (response.statusCode != successCode) {
                            if (response.body) {
                                logger.error("!!! Call [" + opts.method + "] " + opts.path + " failed with status code: " + response.statusCode 
                                    + " Response: ", response.body);
                                reject(response.body);
                            } else {
                                logger.error("!!! Call [" + opts.method + "] " + opts.path + " failed with status code: " + response.statusCode);
                                reject(response.statusCode);
                            }
                        } else {
                            logger.debug("<<< Call [" + opts.method + "] " + opts.path + " successful with status code: " + response.statusCode);
                            resolve(response.body);
                        }
                    });
                })
                .catch((err) => { 
                    logger.error("!!! Error in api call [" + opts.method + "] " + opts.path + ": " + err);
                    reject(err);
                });
        });
    }

    /**
     * Returns the api client as promise by awaiting on the response for generating OAuth token
     */
    this.AsPromise = async function () {
        await _tokenPromise;
        return this;
    }

    /**
     * Downloads loan contract json schema to specified file path
     * 
     * @param {string} downloadFilePath 
     */
    this.downloadLoanSchema = async function (downloadFilePath) {
        
        // Call schema api to get loan schema
        let response = await apiRequest({
            method: "GET",
            path: "/encompass/v3/schemas/loan"
        }, 200);
        
        // Save loan schema to file for future use
        fs.saveToFile(downloadFilePath, response);
        logger.debug("*** Loan schema saved to: " + downloadFilePath);
    };

    /**
     * Validate the loan payload with downloaded schema
     * 
     * @param {*} payload Loan payload
     * @param {string} schemaFilePath file path of downloaded schema
     */
    this.validateLoanPayloadWithSchema = function (payload, schemaFilePath) {
        var Validator = require('jsonschema').Validator;
        var validator = new Validator();

        return validator.validate(payload, require(schemaFilePath)).errors;
    };

    /**
     * Create new loan using supplied payload in the specified loan folder
     * 
     * @param {*} payload Loan payload
     * @param {string} loanFolder Loan folder
     */
    this.createNewLoan = async function(payload, loanFolder) {
        let response = await apiRequest({
            method: "POST",
            path: "/encompass/v3/loans?view=id&loanFolder=" + loanFolder,
            body: JSON.stringify(payload)
        }, 201);
        return JSON.parse(response).id;
    }

    /**
     * Get loan by loanId
     * 
     * @param {string} loanId loan id
     * @param {*} opts query parameters: view, entities, includeEmpty 
     */
    this.getLoan = async function(loanId, opts) {
        var path = "/encompass/v3/loans/" + loanId;
        if (opts) {
            path = path + "?" + Object.keys(opts).map((key) => key + "=" + encodeURIComponent(opts[key])).join("&");
        }

        return JSON.parse(await apiRequest({
            method: "GET",
            path: path
        }, 200));
    }

    /**
     * Download loan to specified file
     * 
     * @param {string} loanId loan id
     * @param {string} downloadFilePath file path to save loan data
     * @param {*} opts query parameters: view, entities, includeEmpty 
     */
    this.downloadLoanToFile = async function(loanId, downloadFilePath, opts) {
        var path = "/encompass/v3/loans/" + loanId;
        if (opts) {
            path = path + "?" + Object.keys(opts).map((key) => key + "=" + encodeURIComponent(opts[key])).join("&");
        }

        let response = await apiRequest({
            method: "GET",
            path: path
        }, 200);

        fs.saveToFile(downloadFilePath, response);
        logger.debug("*** Loan saved to: " + downloadFilePath);
    }

    /**
     * Get collection property within loan
     * 
     * @param {string} loanId loan id
     * @param {*} collectionOptions options to locate collection property within the loan
     * @param {*} opts query parameters: view, entities, includeEmpty 
     */
    this.getLoanSubCollection = async function(loanId, collectionOptions, opts) {
        var path = "/encompass/v3/loans/" + loanId + "/" + collectionOptions.args.join("/");
        if (opts) {
            path = path + "?" + Object.keys(opts).map((key) => key + "=" + encodeURIComponent(opts[key])).join("&");
        }

        return JSON.parse(await apiRequest({
            method: "GET",
            path: path
        }, 200));
    }

    /**
     * Download collection property within loan to specified file
     * 
     * @param {string} loanId loan id
     * @param {*} collectionOptions options to locate collection property within the loan
     * @param {string} downloadFilePath file path to save loan data
     * @param {*} opts query parameters: view, entities, includeEmpty 
     */
    this.downloadLoanSubCollectionToFile = async function(loanId, collectionOptions, downloadFilePath, opts) {
        var path = "/encompass/v3/loans/" + loanId + "/" + collectionOptions.args.join("/");
        if (opts) {
            path = path + "?" + Object.keys(opts).map((key) => key + "=" + encodeURIComponent(opts[key])).join("&");
        }

        let response = await apiRequest({
            method: "GET",
            path: path
        }, 200);

        fs.saveToFile(downloadFilePath, response);
        logger.debug("*** Loan saved to: " + downloadFilePath);
    }

    /**
     * Update loan identified by loanId with payload
     * 
     * @param {string} loanId loan id
     * @param {*} payload update loan payload
     */
    this.updateLoan = async function(loanId, payload) {
        let response = await apiRequest({
            method: "PATCH",
            path: "/encompass/v3/loans/" + loanId,
            body: JSON.stringify(payload)
        }, 204);
    }

    /**
     * Update collection property within a loan identified by loanId
     * 
     * @param {string} loanId loan id
     * @param {*} collectionOptions options to locate and modify collection property within the loan
     * @param {Array<*>} payload update loan payload
     */
    this.updateLoanSubCollection = async function(loanId, collectionOptions, payload) {
        collectionOptions.action = collectionOptions.action || "update";
        let response = await apiRequest({
            method: "PATCH",
            path: "/encompass/v3/loans/" + loanId + "/" + collectionOptions.args.join("/") + "?action=" + collectionOptions.action,
            body: JSON.stringify(payload)
        }, 204);
    }

    /**
     * Delete loan identified by loanId
     * 
     * @param {string} loanId loan id
     */
    this.deleteLoan = async function(loanId) {
        let response = await apiRequest({
            method: "DELETE",
            path: "/encompass/v3/loans/" + loanId
        }, 204);
    }

    /**
     * Create new loan or field data
     * 
     * @param {*} fields field value map
     * @param {string} loanFolder Loan folder
     */
    this.createNewLoanWithFields = async function(fields, loanFolder) {
        
        // Get standard fields info for supplied fields
        let standardFieldsResponse = await apiRequest({
            method: "GET",
            path: "/encompass/v3/schemas/loan/standardFields?ids=" + encodeURIComponent(Object.keys(fields).join(","))
        }, 200);
        var standardFields = JSON.parse(standardFieldsResponse);
        var loanPayload = {};
        
        // Create loan payload using field value map and json paths corresponding to the fields
        standardFields.forEach(val => {
            jp.setValue(loanPayload, val.jsonPath, fields[val.id]);
        });

        return this.createNewLoan(loanPayload, loanFolder);
    }

    /**
     * Get loan fields from loan identified by loanId
     * 
     * @param {string} loanId loan id
     * @param {Array} fieldIds field ids
     */
    this.getLoanFields = async function(loanId, fieldIds) {

        // Get standard fields info for supplied fields
        let standardFieldsResponse = await apiRequest({
            method: "GET",
            path: "/encompass/v3/schemas/loan/standardFields?ids=" + encodeURIComponent(fieldIds.join(","))
        }, 200);
        var standardFields = JSON.parse(standardFieldsResponse);
        
        // Create comma separated entities filter to reduce the payload size
        var entities = standardFields.map(item => item.entitiesFilterKey).join(",");

        // Get loan data using get loan api
        var path = "/encompass/v3/loans/" + loanId + "?includeEmpty=true&entities=" + encodeURIComponent(entities);
        let loanResponse = await apiRequest({
            method: "GET",
            path: path
        }, 200);
        var loanData = JSON.parse(loanResponse);

        // find required fields in get loan api response
        var response = {};
        standardFields.forEach(val => {
            response[val.id] = jp.value(loanData, val.jsonPath);
        });

        return response;
    }

    /**
     * Get loan fields from loan identified by loanId using field reader api
     * 
     * @param {string} loanId loan id
     * @param {Array} fieldIds field ids
     */
    this.getLoanFieldsWithFieldReader = async function(loanId, fieldIds) {

        // Get loan data using get loan api
        var path = "/encompass/v1/loans/" + loanId + "/fieldReader";
        let fieldsResponse = await apiRequest({
            method: "POST",
            path: path,
            body: JSON.stringify(fieldIds)
        }, 200);
        
        return JSON.parse(fieldsResponse);
    }

};
