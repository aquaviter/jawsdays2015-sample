// AWS config skipped for brevity 
ßvar kcl = require('kinesis-client-library')
 
var newlineBuffer = new Buffer('\n')
 
kcl.AbstractConsumer.extend({
  // create places to hold some data about the consumer 
  initialize: function (done) {
    this.cachedRecords = []
    this.cachedRecordSize = 0
    // This MUST be called or processing will never start 
    // That is really really really bad 
    done()
  },
 
  processRecords: function (records, done) {
    // Put each record into our list of cached records (separated by newlines) and update the size 
    records.forEach(function (record) {
      this.cachedRecords.push(record.Data)
      this.cachedRecords.push(newlineBuffer)
      this.cachedRecordSize += (record.Data.length + newlineBuffer.length)
    }.bind(this))
 
    // not very good for performance 
    var shouldCheckpoint = this.cachedRecordSize > 50000000
 
    // Get more records, but not save a checkpoint 
    if (! shouldCheckpoint) return done()
 
    // Upload the records to S3 
    //s3.putObject({
    //  Bucket: 'my-bucket-name',
    //  Key: 'path/to/records/' + Date.now(),
    //  Body: Buffer.concat(this.cachedRecords)
    //}, function (err)  {
    //  if (err) return done(err)
 	//
    //  this.cachedRecords = []
    //  this.cachedRecordsSize = 0
 
      // Pass `true` to checkpoint the latest record we've received 
    // done(null, true)
    //}.bind(this))
    
    console.log(Buffer.concat(this.cachedRecords))
    
  }
})