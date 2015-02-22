var aws = require('aws-sdk');
var fs = require('fs');

var region = 'ap-northeast-1';
var stream = 'jawsdays2015-handson-track2'
//var stream = process.argv[2];
var strategy = 'LATEST';
var kinesis = new aws.Kinesis({region:region});

var fs = require('fs');
var app = require('http').createServer(function(req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(fs.readFileSync('client.html'));
}).listen(9000);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
	socket.on('msg', function(data) {
		io.sockets.emit('msg'. data);
	});
});

kinesis.describeStream({StreamName:stream},function(err,result){
   var shards = result.StreamDescription.Shards;
   for(var i = 0; i < shards.length; i++){
       var shardId = shards[i].ShardId;
       var params = {
         ShardId: shardId,
         ShardIteratorType: strategy,
         StreamName: stream
       };
       kinesis.getShardIterator(params,function(err,result){
          if(err) console.log(err);
          else getRecords(kinesis,shardId,result.ShardIterator);
       });
   }
});

function getRecords(kinesis,shardId,shardIterator){
    kinesis.getRecords({ShardIterator: shardIterator, Limit: 10000},function(err,result){
        if(err) console.log(err);
        else {
            if(result.Records.length){
                for(var i = 0; i < result.Records.length; i++){
                    r = result.Records[i];
                   	io.sockets.emit('msg', String(r.Data));
                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                }
            }
            setTimeout(function() {
                getRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
}


