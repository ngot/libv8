#!/bin/bash

mkdir v8-src
cd v8-src

# clone the depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

# fetch v8 source
./depot_tools/fetch v8

cd v8

# sync update
../depot_tools/gclient sync

# generate code
./tools/dev/v8gen.py x64.release

# build v8
../depot_tools/ninja -C out.gn/x64.release
