#!/bin/bash

sudo apt update
sudo apt install cron

chmod +x ./healthcheck.sh

(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/healthcheck.sh") | crontab -