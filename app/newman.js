const newman = require('newman');

// call newman.run to pass `options` object and wait for callback
newman.run(
    {
        collection: require('/Users/reschulz/Documents/_dev/mmpModules/postman_workflows/mmp_item-data-supply_test/app/public/data/Runner.postman_collection.json'),
        reporters: 'cli'
    }, 
    function (err) {
	    if (err) { throw err; }
        console.log('collection run complete!');
    }
);