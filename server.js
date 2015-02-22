var aws = require('aws-sdk');
var fs = require('fs');
var http = require('http');

var region = 'ap-northeast-1';
var stream = 'jawsdays2015-handson-track2'
var strategy = 'LATEST';
var kinesis = new aws.Kinesis({region:region});

var server = http.createServer(function (req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	var html = fs.readFileSync("./client.html", "utf-8");
	res.end(html);
}).listen(9000);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    var address = socket.handshake.address;
	console.log('client connected: ' + address.address + ":" + address.port);
    //for(var i = 0; i < 10; i++) {
    //    io.sockets.emit("msg", i);
    //}
    kinesis.describeStream({StreamName:stream},function(err,result){
        var shards = result.StreamDescription.Shards;
        console.log(shards);
        for(var i = 0; i < shards.length; i++){
            var shardId = shards[i].ShardId;
            var params = {
                ShardId: shardId,
                ShardIteratorType: strategy,
                StreamName: stream
                };
            kinesis.getShardIterator(params,function(err,result){
                if(err) console.log(err);
                else {
                    data = getKinesisRecords(kinesis,shardId,result.ShardIterator);
                    io.sockets.emit('msg', data);
                };
            });
        };
    });
});

function getKinesisRecords(kinesis,shardId,shardIterator){
    kinesis.getRecords({ShardIterator: shardIterator, Limit: 10000},function(err,result){
        if(err) console.log(err);
        else {
            if(result.Records.length){
                for(var i = 0; i < result.Records.length; i++){
                    r = result.Records[i];
                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                    var records += shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data + '\n';
                }
            }
            setTimeout(function() {
                getKinesisRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
    return records;
}
