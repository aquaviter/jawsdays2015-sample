var aws = require('aws-sdk');
var http = require('http');

var region = 'ap-northeast-1';
var stream = 'jawsdays2015-handson-track2'
var strategy = 'LATEST';
var kinesis = new aws.Kinesis({region:region});

var server = http.createServer();
var io = require('socket.io').listen(server);

server.on('request', function (req, res) {
  fs.readFile('client.html', function(err, data){
    if (err) {
      res.writeHead(500);
      return res.end('HTML loading Error');
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8'
    });
    res.end(data);
  });
});

server.listen(9000);

io.sockets.on('connection', function (socket) {
  socket.emit('emitdata', {data:}, function (data) {
    console.log('data:' + data);
  });
});

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
        data = getRecords(kinesis,shardId,result.ShardIterator);
        socket.emit('data', function(data){
          console.log(data);
        });
      };
    });
  };
});

function getRecords(kinesis,shardId,shardIterator){
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
                getRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
}
