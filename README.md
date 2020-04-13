# exp20-devconnect-v3-demo
Building for the Future: The Next Generation of APIs (V3)

## Setup
1. Clone this repository and run `npm install` in the root directory
1. Copy file `config/example.js` to `config/{INSTANCEID}.js` and replace the properties with appropriate values specific to your encompass instance
1. Run `node ./demo-runner.js {INSTANCEID}`

## Repository Content
* api-client
    * api-client.js - Api client to call data connect v3 apis
    * api-token.js - Generates OAuth token for ApiClient
    * fs-extensions.js - Convenience methods for file system operations, not available out of box in `fs`
    * jsonpath-extensions.js - Convenience methods for json path operations, not available out of box in `jsonpath` package
    * logger.js - Logger implementation using `winston` package
* config
    * example.config.js - Template for creating config files
* demos
    * 1.loan-schema.js - example for loan data validation using loan schema api
    * 2.loan-crud.js - example for loan CRUD (Create Read Update Delete) operations
    * 3.fixed-collection.js - example for operations on fixed size collections in loan
    * 4.verif-collection.js - example for operations on variable size collections in loan
    * 5.loan-fields.js - example for using data obtained from standardFields api
* demo-runner.js - Runs the v3 apis demo
