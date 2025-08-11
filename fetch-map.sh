#!/bin/bash

mkdir -p assets/map
url=$(curl https://assets.deadlock-api.com/v1/map | jq -r '.images | .minimap')
curl $url -o assets/map/minimap.webp
