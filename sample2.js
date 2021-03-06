var aws = require('aws-sdk');

var region = 'ap-northeast-1';
var stream = 'jawsdays2015-handson-track2'
var strategy = 'LATEST';
var kinesis = new aws.Kinesis({region:region});

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
                console.log(result.Records.length);
                for(var i = 0; i < result.Records.length; i++){
                    r = result.Records[i];
                    console.log(shardId + ', ' + r.PartitionKey + ', ' + r.SequenceNumber + ', ' + r.Data);
                }
            }
            setTimeout(function() {
                getRecords(kinesis, shardId, result.NextShardIterator);
            },0);
        }
    })
}