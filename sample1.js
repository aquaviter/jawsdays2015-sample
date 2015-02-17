var AWS = require('aws-sdk');

var kinesis = new AWS.Kinesis();

var shard_id = "jawsdays2015-handson-track2";

var params = {
	ShardId: shard_id,
	ShardIteratorType: 'LATEST'
};

kinesis.getShardIterator(params, function(err, data){
	if (err) console.log(err,err.stack);
	else     console.log(data);
});

