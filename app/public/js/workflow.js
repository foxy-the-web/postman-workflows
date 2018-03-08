/* 
counter [integer]:
The counter is need to track runner iterations and control the behavior
of the buildCurrentRequest method.
*/
let counter = 0;

/*
parameter [object]: 
Empty object to store relevant data of initial M2 request for further request 
in the test workflow. It is used as globel variable in the collection runner.
*/
let parameters = {};

/* 
configuration [object]: 
Configuration object to define necessary attributes for further requests.
*/
let configuration = {
  item: ["seasonId", "companyId", "id", "articleNumber"],
  itemEfforts: ["companyEffortCode", "effortCode", "workSection", "workPage", "effortVariant", "workPageKey"]
};

/*
getGlobalVariables [method]:
Get attributes, defined in configuration, form response and store it in parameters 
object for further usage in postman.
*/ 
const getGlobalVariables = (cfg, res) => {

    // console.log(`Iterations: ${itr}`);
    parameters = {};
    
    // console.log(res);

    // check size of response 
    res = res.length === 1 ? res[0] : () => { console.log('There are more items in the response than expected.') };
    // check sizte of itemEfforts
    let itemEffortsIds = Object.keys(res.itemEfforts);
    
    // DEBUG: console.log(par);

    // create keys to store relevant attributes of configuration
    for ( let key of Object.keys(cfg) ) {

        parameters[key] = {};
        
        // create logic for items 
        if ( key === 'item' ) {
            // loop through other configuration keys | could be refactored because ot DRY (1)
            for ( let element of cfg[key] ) {
                parameters[key][element] = res[element];
                // DEBUG: console.log(`Parameters: ${parameters[key][element]} | Response: ${res[element]}`);
            }
        }
        else if ( key === 'itemEfforts' ) {
            // create itemEfforts entities in parameters
            for ( let id of itemEffortsIds ) { 
                parameters[key][id] = {}; 
                // loop through itemEfforts configuration | could be refactored because ot DRY (1)
                for ( let element of cfg[key] ) {
                // store values form response to parameters
                parameters[key][id][element] = res[key][id][element];
                // DEBUG: console.log(`Parameters: ${parameters[key][id][element]} | Response: ${res[key][id][element]}`);
                }
            }
        }
    } 
    return parameters;
};

/* 
buildCurrentRequest [method]:
Execute global parameters object and build single parameters for current request. You need to use it as a
pre-request script.
*/ 
const buildCurrentRequest = (par, cfg, postman, counter) => {
  
    // DEBUG: console.log(`Counter before execution: ${counter}`);
  
    // get current request parameters
    let pathArray = postman.__execution.request.url.path;
      
    // relevant path parameteres / variables
    let pathVars = [];
     
    // DEBUG: console.log(par); console.log(pathArray);
  
    // loop through pathArray
    for ( let entry of pathArray ) {
        // characters {{ }} from entries have to be removed
        let startSlice = entry.indexOf("{{");
        let endSlice = entry.lastIndexOf("}}");
        
        // condition for slicing
        if ( startSlice !== -1 ) { startSlice = startSlice + 2 }
        
        // slice relevant strings
        if ( startSlice !== -1 || endSlice !== -1 ) {
            entry = entry.slice(startSlice, endSlice);

            // condition for concated variabels
            if ( entry.search("}}{{") != -1 ) {
                // DEBUG: console.log(`Found concated variables for postman-execution-id: ${postman.__execution.id} for "${entry}". Please provide single variables.`);
                entry = false;
            }

            // push sliced entries to new array current parameters
            pathVars.push(entry);
        }
        else {
            // DEBUG: console.log(`Found no {{ }} variables in path for ${entry}`);
        }

    }
    // DEBUG: 
    // console.log(par);
    // console.log(pathVars);
  
    // loop through keys of configuration to compare hierarchy
    for ( let key of Object.keys(cfg) ) {
        // check entity levels
        for ( let entry of cfg[key] ){
            // check values of pathVars against entries of configuration
            for ( let element of pathVars ) {
                // set regular expression from path variables form current request to find match with parameters
                let regexp =  new RegExp(`\\b${element}\\b`);
                // control condition, just matched results are relevant for execution
                let match = entry.match(regexp) ? true : false;
                console.log(match);
                // DEBUG: console.log(`Compare ${entry} [cfg] with ${element} [pathVars], used ${regexp} as RegExp!`); 
                if ( match && key === "item" ) {
                    // DEBUG: console.log(`Matching is ${match} on level: ${key} with ${par[key][element]} for ${element}`);
                    // pm.globals.set(element, par[key][element]);
                }
                else if ( match && key === "itemEfforts" ) {
                    // loop through itemEfforts object to find a relevant 
                    let itemEffortsKeys = Object.keys(par[key]);
                    let itemEffortId = ( counter < itemEffortsKeys.length ) ? itemEffortsKeys[counter] : counter + 1;
                    // DEBUG: console.log(`Matching is ${match} on level: ${key} with ${par[key][itemEffortId][element]} for ${element}`);
                    // pm.globals.set(element, par[key][itemEffortId][element]);
                }
            }
        }
    }
  
    counter++;
    // DEBUG: console.log(`Counter after execution: ${counter}`);
    // set global counter if needed: pm.globals.set("counter", counter);
    // return counter;
};

/* 
controlNextRequest [method]:
The script is used to check if the current workpage request has to be repeated. It returns the acion for the next
request and can be used in conjunction with postman.setNextRequest()
*/ 
const controlNextRequest = (counter, data) => {
    
    // get length of itemEfforts
    let itemEffortsLength = Object.keys(data.itemEfforts).length;
    // DEBUG: console.log(`ItemEfforts: ${itemEffortsLength} ... Counter: ${counter}`);
    
    // Runner Collection Actions
    const collection_actions = {
        normal: {
            text: "Normal",
            condition: counter === 0 && itemEffortsLength === 1
        },
        replay: {
            text: "Replay",
            condition: itemEffortsLength > 1 && counter < itemEffortsLength
        },
        stop: {
            text: "Stop",
            condition: counter > itemEffortsLength,
        },
        skip: {
            text: "Skip",
            condition: counter === 0 && itemEffortsLength === 0
            
        }
    };
  
    // Initialize result
    let result;
    
    // Define Conditions for building a request
    for ( let action of Object.keys(collection_actions) ) {
      
        if ( collection_actions[action].condition ) {
            result = action;
        }
        else {
            // console.log("Adjust code for controlNextRequest");
        }    
    }
    return result;
};

// inialize methods
// getGlobalVariables(configuration, res);
// buildCurrentRequest(parameters, configuration, postman1);

/*
simulateRunner [method]:
The method is used to simulate a runner task with different API calls and several iterations
*/
const simulateRunner = (cfg) => {
    
    // iteration number due to response object
    const iterations = Object.keys(response).length;

    // iterate over requests
    for ( let i = 0; i < iterations; i++ ) {

        let currentRes = response[i][0];
        let currentPars = getGlobalVariables(cfg, response[i]);
        let nextReq = controlNextRequest(0, currentRes);

        let itemEffortsLength = Object.keys(parameters.itemEfforts).length; 
        let countWorkpageRequests = ( itemEffortsLength > 1 ) ? `${itemEffortsLength} workpage requests.` : `no repetition.`; 

        // DEBUG: console.log(currentPars);

        document.write(`<b>${currentRes.id}: ${nextReq} run with ${countWorkpageRequests}</b></br>`);
        // iterate over collection requests 
        for ( let req in collectionRequests ) {
            document.write(`<small>${collectionRequests[req]}</small></br>`);
            // document.write(`<small>Parameters: </small></br>`); // ${collectionRequests.uri[req]}
            // if workpage request has to be repeated
            if ( nextReq === "replay" && req == 3 ) {
                document.write(`<small>New: ${collectionRequests[3]}</small></br>`);
            }
        }
    
    }

    for ( let a = 0; a <= 3; a++ ) {
        // 
        buildCurrentRequest(parameters, configuration, postman[a], counter);
    }

};

simulateRunner(configuration);