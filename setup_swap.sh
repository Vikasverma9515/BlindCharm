#!/bin/bash
# Script to add 4GB Swap file to Linux VPS to prevent OOM kills

echo "Checking for existing swap..."
swapon --show

if [ $(swapon --show | wc -l) -gt 0 ]; then
    echo "Swap already exists. Skipping."
else
    echo "Creating 4GB swap file..."
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    echo "Swap created successfully!"
    free -h
fi
