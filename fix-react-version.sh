#!/bin/bash

# Script to fix React version and resolve dependency conflicts
echo "Starting the process to fix React version compatibility..."

# Step 1: Uninstall React and React DOM
echo "Uninstalling React and React DOM..."
npm uninstall react react-dom

# Step 2: Ask user which version of React to install
echo "Choose the version of React to install:"
echo "1) React 18 (stable)"
echo "2) React 19 (specific release candidate)"
read -p "Enter your choice (1 or 2): " choice

# Step 3: Install the selected version
if [ "$choice" -eq 1 ]; then
  echo "Installing React 18 (stable)..."
  npm install react@18.2.0 react-dom@18.2.0
elif [ "$choice" -eq 2 ]; then
  echo "Installing React 19 (release candidate)..."
  npm install react@19.0.0-rc-de68d2f4-20241204 react-dom@19.0.0-rc-de68d2f4-20241204
else
  echo "Invalid choice. Exiting."
  exit 1
fi

# Step 4: Clean up project files
echo "Cleaning up old project files..."
rm -rf node_modules package-lock.json

# Step 5: Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Step 6: Start development server
echo "Starting the development server..."
npm run dev

echo "Process complete. React version has been fixed!"
