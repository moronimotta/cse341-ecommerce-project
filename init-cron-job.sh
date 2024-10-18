#!/bin/bash

chmod +x /path/to/healthcheck.sh

(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/healthcheck.sh") | crontab -