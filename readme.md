# libv8

Convert V8 project from GN build system to CMake build system and build for static lib.

## usage

#### fetch V8

```shell
./tools/deps.sh
```

This will take a long time.Please be patient. After finished, the whole v8 project is located at `v8-src` folder.

#### Generate CMake project

We use `gn-v8.js` script to generate CMake project. 

`gn-v8.js` is a [fibjs](https://github.com/fibjs/fibjs) script. Make sure you have installed it.

```shell
./tools/gn-v8.js
```

The CMake V8 project will be located at `v8` folder.

#### Build

```shell
./build.sh [release|debug]
```

The V8 static lib file will be located at `bin` folder.
