#!/bin/bash

# Monitor URL response time and report only when it exceeds 1 second
# Exit if response is not HTTP 200

URL="https://localhost:4000/livenessProbe"
THRESHOLD=1.0

echo "Monitoring $URL (reporting only when response time > ${THRESHOLD}s)"
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
  
  # Check if HTTP status is 200
  if [ "$http_code" != "200" ]; then
    echo "ERROR: Received HTTP $http_code (expected 200). Exiting."
    exit 1
  fi
  
  # Check if time taken exceeds threshold
  # Using awk for floating point comparison
  exceeds=$(echo "$time_taken $THRESHOLD" | awk '{if ($1 > $2) print "yes"; else print "no"}')
  
  if [ "$exceeds" = "yes" ]; then
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] Response time: ${time_taken}s"
  fi
  
  # Wait 1 second before next check
  sleep 1
done

