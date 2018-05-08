// path to postman collection json
const file_to_load = './data/Runner.postman_collection.json';

// load json resource
fetch(file_to_load)
    .then(
        (res) => {
            if ( res.status !== 200 ) {
                console.log(`Status Code: ${res.status}`);
                return;
            } 
            // do something when data was requested successful
            res.json().then((data) => {
                // get necessary parameters from collection for test cyle
                getParameters(data);
                // 
                
            });
        }
    )
    .catch( (err) => {
        console.log(`Fetch Error :-S`, err);
    }
)

// get relevant parameters from collection to build environment variables
let getParameters = (data) => {
   
    for (let entry of data.item) {
    
        for (let i of entry.item) {
            console.log("----------------");
            console.log(i.name);
            // path variables [array]
            let pathEntries = i.request.url.path;
            // get environment variables of requests
            // define function that takes an array as input
            // console.log(pathEntries);
            console.log(normalizeParameters(pathEntries));
        }
    }
};

let normalizeParameters = (array) => {
    
    // define empty array to store relevant parameters
    let results = [];

    // check if input is an array
    if (typeof(array) === "object" ) {
        // compare items of array to postman variable definition
        for (let item of array) {
            // characters {{ }} in items have to be removed
            let startSlice = item.indexOf("{{");
            let endSlice = item.lastIndexOf("}}");
            
            // start slicing
            if ( startSlice !== -1 || endSlice !== -1 ) {
                // define correct slice position
                if ( startSlice !== -1 ) { startSlice = startSlice + 2 }
                let result = item.slice(startSlice, endSlice);
                // condition for two concated parameters
                if (result.search("}}{{") != -1) { 
                    let resultA = result.slice( result.indexOf("{{") + 2, result.length);
                    let resultB = result.slice( 0, result.indexOf("}}") );
                    results.push(resultA);
                    results.push(resultB);
                    break;
                }
                else {
                    results.push(result);
                }
                // test
                // console.log(`${item} has to be sliced. Starting at postion: ${startSlice}, ending at position: ${endSlice}. Results in ${result}`);
            }
            else {
                // console.log(`${item} has not to be sliced.`);
            }
        }
    }
    else {
        console.log("You must specify an object[array] to get path parameters. Have a look to your input");
    }

    return results;
};