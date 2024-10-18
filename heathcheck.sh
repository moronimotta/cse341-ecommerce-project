#!/bin/bash

# URL="https://cse341-ecommerce-project.onrender.com"
URL="http://localhost:8080"

response=$(curl --write-out "%{http_code}" --silent --output /dev/null "$URL")

if [ "$response" -ne 200 ]; then
    curl -d "System Alert: Health check failed" ntfy.sh/byu_ecommerce_errors
else
    curl -d "System Alert: Health check OK" ntfy.sh/byu_ecommerce_logs
fi