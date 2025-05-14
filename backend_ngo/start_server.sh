#!/bin/bash

# Kill any existing Python processes running the main.py file
pkill -f "python3 -m main" || true

# Start the FastAPI server
python3 -m main 