#!/bin/bash

# Base URL for API requests
BASE_URL="https://cse341-ecommerce-project.onrender.com"
STORES_ENDPOINT="$BASE_URL/stores/"
LOW_STOCK_ENDPOINT="$BASE_URL/products/store/low-stock"
NTFY_TOPIC="byu_ecommerce_logs"  # Customize topic as needed

# Get all store IDs
response=$(curl --silent "$STORES_ENDPOINT")
echo "Response from stores endpoint: $response"  # Debug statement

store_ids=$(echo "$response" | jq -r '.[]._id')
echo "Store IDs: $store_ids"  # Debug statement

# Check if store_ids is empty
if [ -z "$store_ids" ]; then
  echo "No stores found."
  exit 0
fi

# Initialize message content
current_date=$(date '+%Y-%m-%d %H:%M:%S')
low_stock_message="Message: Low stock alert for the following items:

Date: $current_date"

# Iterate over each store ID to check for low-stock products
for id in $store_ids; do
  # Get low-stock products for the store ID
  low_stock_products=$(curl --silent "$LOW_STOCK_ENDPOINT/$id" | jq -r '.[] | "Name: \(.name), Stock: \(.stock), ID: \(.id)"')

  # If low_stock_products is not empty, add it to the message
  if [ -n "$low_stock_products" ]; then
    low_stock_message="$low_stock_message

Store ID: $id
$low_stock_products"
  fi
done

# Check if any low-stock products were found
if [ "$low_stock_message" != "Message: Low stock alert for the following items:

Date: $current_date" ]; then
  # Send the message to the specified topic
  curl -d "$low_stock_message" "https://ntfy.sh/$NTFY_TOPIC"
else
  echo "No low-stock products found."
fi