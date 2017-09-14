cmake_minimum_required(VERSION 2.6)

project(v8)

file(GLOB_RECURSE src_list "v8/src/*.c*")
add_library(v8 ${src_list})

set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin/${BUILD_TYPE})

add_definitions(
	-DV8_NO_FAST_TLS=1
	-DV8_DEPRECATION_WARNINGS=1
	-DENABLE_HANDLE_ZAPPING=1
)

set(CMAKE_CXX_FLAGS "-std=c++11")

if(${BUILD_TYPE} STREQUAL "debug")
	set(flags "${flags} -g -O0 ${BUILD_OPTION} -Wall")
	set(link_flags "${link_flags} ${BUILD_OPTION}")
	add_definitions(-DDEBUG=1)
endif()

if(${BUILD_TYPE} STREQUAL "debug")
	add_definitions(
		-DVERIFY_HEAP=1
		-DOBJECT_PRINT=1
		-DENABLE_DISASSEMBLER=1
		-DV8_ENABLE_CHECKS=1
		-DTRACE_MAPS=1
		-DENABLE_SLOW_DCHECKS=1
	)
endif()

include_directories("${PROJECT_SOURCE_DIR}/v8/include")
include_directories("${PROJECT_SOURCE_DIR}/v8/")
include_directories("/usr/local/include/")
