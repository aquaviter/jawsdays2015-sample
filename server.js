var aws = require('aws-sdk');
var fs = require('fs');
var http = require('http');

var region = 'ap-northeast-1';
var stream = 'jawsdays2015-handson-track2'
var strategy = 'LATEST';
var kinesis = new aws.Kinesis({region:region});

var server = http.createServer(function (req, res) {
	res.writehead(200, {"Content-Type":"text/html"});
	var rs = fs.createReadStream('client.html');
}).listen(9000);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log('client connected');
});

function getKinesisRecords(kinesis,shardId,shardIterator){
    kinesis.getRecords({ShardIterator: shardIterator, Limit: 10000},function(err,result){
        if(err) console.log(err);
        else {
            if(result.Records.length){
                for(var i = 0; i < result.Records.length; i++){
                    r = result.Records[i];
                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                    return r.Data;
                }
            }
            setTimeout(function() {
                getKinesisRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
}
