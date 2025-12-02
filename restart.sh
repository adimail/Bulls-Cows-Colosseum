#!/bin/bash
set -e

APP_NAME="fs"
APP_DIR="$HOME/colosseum_app"
LOG_FILE="$APP_DIR/app.log"

echo ">>> Attempting to restart the Colosseum application..."

cd "$APP_DIR" || {
	echo "Error: Could not cd into $APP_DIR"
	exit 1
}

echo "--> Stopping any existing process for '$APP_NAME'..."
pkill -f "$APP_DIR/$APP_NAME" || echo "No old process was running."
sleep 2

echo "--> Setting execute permissions on new binary..."
chmod +x "$APP_DIR/$APP_NAME"

echo "--> Starting new application process..."
nohup "./$APP_NAME" >"$LOG_FILE" 2>&1 &

echo ">>> Application restart command issued successfully."
echo "--> Check logs at: $LOG_FILE"
