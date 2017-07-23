#!/bin/bash

set -e

ELASTICSEARCH_NAME=elasticsearch
ELASTICSEARCH_VERSION=5.5-alpine

ELASTICSEARCH_STATUS=$(docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep $ELASTICSEARCH_NAME | awk '{print $2}')

echo "ELASTICSEARCH_STATUS: $ELASTICSEARCH_STATUS"

function runElasticsearch() {
  docker run -d -p 9200:9200 --name $ELASTICSEARCH_NAME $ELASTICSEARCH_NAME:$ELASTICSEARCH_VERSION
  sleep 5
  curl -XPOST localhost:9200/dummy_index/dummy_type -d '{"key1":100,"key2":"dummy"}' -H "Content-Type:application/json"
}


if [ -z $ELASTICSEARCH_STATUS ]
then
  runElasticsearch
  echo "Elasticsearch is running"
else
  echo "Elasticsearch is already running"
fi
