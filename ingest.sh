#!/bin/bash


devicename="testdevice"
profile="jawsdays2015"
streamname="jawsdays2015-handson-track2"

while(true); do
	#date=$(date "+%Y-%m-%dT%H:%M:%SZ")
	date=$(date +%s)
	value=$(awk -vmin=0 -vmax=100 'BEGIN{srand(); print int(min+rand()*(max-min+1))}')
	message="$devicename,$date,$value"
	message=$(echo $message | openssl enc -e -base64)

	aws kinesis put-record --profile $profile \
	--stream-name $streamname --data $message --partition-key devicename;

	sleep 5

done