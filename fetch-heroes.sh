#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error.
set -u
# Pipelines return the exit status of the last command to exit with a non-zero status.
set -o pipefail

# --- Configuration ---
API_URL="https://assets.deadlock-api.com/v2/heroes"
DEST_DIR="assets/heroes"
# Change this to 'png' and update the jq query if you want PNGs instead
IMAGE_EXT="webp"

# --- ANSI Color Codes for Logging ---
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_NONE='\033[0m' # No Color

# --- Check for dependencies ---
if ! command -v curl &> /dev/null; then
    echo -e "${COLOR_RED}Error: curl is not installed. Please install it to continue.${COLOR_NONE}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${COLOR_RED}Error: jq is not installed. Please install it to continue.${COLOR_NONE}"
    echo "Installation instructions: https://jqlang.github.io/jq/download/"
    exit 1
fi

# --- Main Script ---

echo "Creating destination directory: $DEST_DIR"
mkdir -p "$DEST_DIR"

echo "Fetching hero list and downloading images..."

# The jq query is updated to be more specific to the IMAGE_EXT variable
curl -sL "$API_URL" | \
  jq -r ".[] | select(.images.icon_image_small_${IMAGE_EXT}) | \"\(.id) \(.images.icon_image_small_${IMAGE_EXT})\"" | \
  while read -r hero_id image_url; do
    dest_file="$DEST_DIR/$hero_id.$IMAGE_EXT"
    echo "Downloading: $image_url"
    if ! curl -Lsf -o "$dest_file" "$image_url"; then
        echo -e "${COLOR_RED}Failed to download ${image_url} (HTTP Error). Skipping.${COLOR_NONE}"
    fi
done

echo -e "${COLOR_GREEN}All hero images have been downloaded and validated.${COLOR_NONE}"