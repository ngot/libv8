#!/bin/bash

rm -rf out
rm -rf bin

mkdir out
mkdir bin

cd out

cmake -DBUILD_TYPE=release -DBUILD_OPTION="" ../ > CMake.log
# cmake -DBUILD_TYPE=debug -DBUILD_OPTION="" ../ > CMake.log
make -j4
if [ $? != 0 ]; then
	exit 1
fi
cd ..
echo ""
