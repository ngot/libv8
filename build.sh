#!/bin/bash

BUILD_TYPE="release"

for i in "$@"
do
	case $i in
		release|debug) BUILD_TYPE=$i
			;;
	esac
done

if [ ! -e bin ]; then
	mkdir bin
fi

if [ ! -e out ]; then
	mkdir out
fi

cd out

echo ${BUILD_TYPE}

cmake -DBUILD_TYPE=${BUILD_TYPE} -DBUILD_OPTION="" ../ > CMake.log
make -j4
if [ $? != 0 ]; then
	exit 1
fi
cd ..
echo ""
