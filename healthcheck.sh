#!/bin/bash

URL="https://cse341-ecommerce-project.onrender.com/healthcheck"

response=$(curl --write-out "%{http_code}" --silent --output /dev/null "$URL")

current_date=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$response" -ne 200 ]; then
    message=$(echo -e "Message: Health check failed\n\nDate: $current_date")
    curl -d "$message" ntfy.sh/byu_ecommerce_errors
else
    message=$(echo -e "Message: Health check OK\n\nDate: $current_date")
    curl -d "$message" ntfy.sh/byu_ecommerce_logs
fi
