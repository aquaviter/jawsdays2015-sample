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
        for(var i = 0; i < shards.length; i++){
            var shardId = shards[i].ShardId;
            var params = {
                ShardId: shardId,
                ShardIteratorType: strategy,
                StreamName: stream
                };
            kinesis.getShardIterator(params,function(err,iter){
                if(err) console.log(err);
                else {
                    //data = getKinesisRecords(kinesis,shardId,result.ShardIterator);
                    //io.sockets.emit('msg', data);
                    console.log(iter.shardIterator);
                    kinesis.getRecords({ShardIterator: iter.shardIterator, Limit: 100},function(err,records){
                        if(err) console.log(err);
                        else {
                           console.log(records.Records.length); //なぜここが0になるのか？
                            if(records.Records.length){
                                for(var i = 0; i < records.Records.length; i++){
                                 r = records.Records[i];
                                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                                    var record = shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data;
                                    io.sockets.emit('msg', record);
                                }
                            }
                        }
                    })
                };
            });
        };
    });
});

function getKinesisRecords(kinesis,shardId,shardIterator){
    kinesis.getRecords({ShardIterator: shardIterator, Limit: 100},function(err,result){
        if(err) console.log(err);
        else {
            console.log(result.Records.length);
            if(result.Records.length){
                for(var i = 0; i < result.Records.length; i++){
                    r = result.Records[i];
                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                    var records =+ shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data + '\n';
                }
            }
            return records;
            setTimeout(function() {
                getKinesisRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
}
