# Create directory structure
New-Item -Path "node_modules/tailwindcss" -ItemType Directory -Force

# Copy tailwindcss from parent directory
Copy-Item -Path "../node_modules/tailwindcss/*" -Destination "node_modules/tailwindcss/" -Recurse -Force
