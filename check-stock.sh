#!/bin/bash

URL="https://cse341-ecommerce-project.onrender.com/products/get/low-stock"

response=$(curl --silent --write-out "%{http_code}" --output /dev/null "$URL")
products=$(curl --silent "$URL")

current_date=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$(echo "$products" | jq length)" -gt 0 ]; then
    low_stock_items=$(echo "$products" | jq -r '.[] | "Name: \(.name), Stock: \(.stock)", ID: \(._id)')
    message="Message: Low stock alert for the following items:

$low_stock_items

Date: $current_date"

    curl -d "$message" ntfy.sh/byu_ecommerce_logs

fi
