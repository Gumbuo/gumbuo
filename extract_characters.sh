#!/bin/bash
cd "IDEAS ONLY/assets/image/characters"
for zip in ../../../../godot-projects/alien-catacombs/asset/characters/pixellab/*.zip; do
    name=$(basename "$zip" .zip)
    echo "Extracting $name..."
    unzip -o -q "$zip" -d "$name"
done
echo "Done! Extracted characters:"
ls -d */
