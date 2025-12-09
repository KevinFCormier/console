#!/bin/bash

# Monitor URL response time
# Optionally supply -t <seconds> to only report when threshold is exceeded
# Exit if response is not HTTP 200

URL="https://localhost:4000/livenessProbe"
THRESHOLD=""

while getopts "t:" opt; do
  case $opt in
    t) THRESHOLD="$OPTARG" ;;
    *) echo "Usage: $0 [-t threshold_seconds]"; exit 1 ;;
  esac
done

echo -n "Monitoring $URL"
if [ -n "$THRESHOLD" ]; then
  echo -n " (reporting only when response time > ${THRESHOLD}s)" 
fi
echo ""
echo "Press Ctrl+C to stop"
echo ""

while true; do
  # Get HTTP status code and time taken
  # %{http_code} - HTTP status code
  # %{time_total} - Total time in seconds (with millisecond precision)
  response=$(curl -k -s -w "\n%{http_code}\n%{time_total}" -o /dev/null "$URL")
  
  # Parse the response
  http_code=$(echo "$response" | sed -n '2p')
  time_taken=$(echo "$response" | sed -n '3p')

  # Check if HTTP status is 000 (startup)
  if [ "$http_code" = "000" ]; then
    sleep 1
    continue
  fi
  
  # Check if HTTP status is 200
  if [ "$http_code" != "200" ]; then
    echo "ERROR: Received HTTP $http_code (expected 200). Exiting."
    exit 1
  fi
  
  # Skip reporting if threshold is set and not exceeded
  # Using awk for floating point comparison
  if [ -n "$THRESHOLD" ]; then
    exceeds=$(echo "$time_taken $THRESHOLD" | awk '{if ($1 > $2) print "yes"; else print "no"}')
    if [ "$exceeds" != "yes" ]; then
      sleep 1
      continue
    fi
  fi

  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] Response time: ${time_taken}s"
  
  # Wait 1 second before next check
  sleep 1
done

