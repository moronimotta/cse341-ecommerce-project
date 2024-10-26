#!/bin/bash

BASE_URL="https://cse341-ecommerce-project.onrender.com"
STORES_ENDPOINT="$BASE_URL/stores/"
LOW_STOCK_ENDPOINT="$BASE_URL/products/store/low-stock"

response=$(curl --silent "$STORES_ENDPOINT")
echo "Response from stores endpoint: $response"  

store_ids=$(echo "$response" | jq -r '.[]._id')
echo "Store IDs: $store_ids"  

if [ -z "$store_ids" ]; then
  echo "No stores found."
  exit 0
fi

for id in $store_ids; do
  NTFY_TOPIC="byu_ecommerce_store_$id"
  echo "Processing Store ID: $id with topic: $NTFY_TOPIC"

  for attempt in {1..3}; do
    low_stock_response=$(curl --silent -w "\n%{http_code}" "$LOW_STOCK_ENDPOINT/$id")
    http_code=$(echo "$low_stock_response" | tail -n1)
low_stock_products=$(echo "$low_stock_response" | head -n -1 | jq -r '.[] | "Name: \(.name), Stock: \(.stock), ID: \(._id)"')

    echo "Attempt $attempt - HTTP Code: $http_code"  

    if [ "$http_code" -ne "000" ]; then
      break
    fi

    echo "No response for Store ID: $id. Retrying..."
    sleep 2  
  done

  
  if [ "$http_code" == "404" ]; then
    echo "No low-stock products found for Store ID: $id"
    continue
  elif [ "$http_code" == "000" ]; then
    echo "Failed to get response for Store ID: $id after multiple attempts."
    continue
  fi

  if [ -n "$low_stock_products" ]; then
    current_date=$(date '+%Y-%m-%d %H:%M:%S')
    low_stock_message="Message: Low stock alert for the following items:

Date: $current_date

$low_stock_products"

    curl -d "$low_stock_message" "https://ntfy.sh/$NTFY_TOPIC"
    echo "Notification sent to topic $NTFY_TOPIC"
  else
    echo "No low-stock message content for Store ID: $id"
  fi
done
