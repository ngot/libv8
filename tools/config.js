'use strict';

const path = require('path');

const ignoreFiles = {
  'src/v8dll-main.cc': 1,
  'src/setup-isolate-deserialize.cc': 1,
  'src/interpreter/mkpeephole.cc': 1,
  'src/snapshot/mksnapshot.cc': 1,
  'src/snapshot/natives-external.cc': 1,
  'src/snapshot/snapshot-external.cc': 1,
  'src/snapshot/snapshot-empty.cc': 1,
  'src/base/platform/platform-qnx.cc': 1,
  'src/base/platform/platform-cygwin.cc': 1,
  'src/base/platform/platform-fuchsia.cc': 1,
  'src/base/debug/stack_trace_fuchsia.cc': 1,
  'src/builtins/builtins-intl.cc': 1,
  'src/builtins/builtins-intl-gen.cc': 1,
  'src/char-predicates.cc': 1,
  'src/intl.cc': 1,
  'src/intl.h': 1,
  'src/objects/intl-objects.cc': 1,
  'src/objects/intl-objects.h': 1,
  'src/runtime/runtime-intl.cc': 1
};

Object.keys(ignoreFiles).map(key => {
  key = path.normalize(key);
  ignoreFiles[key] = 1;
});

exports.ignoreFiles = ignoreFiles;

exports.ignoreRegex = [
  /^src\/d8.*$/,
  /^.*unittest.*\.cc$/,
  /^src\/test\/.*\.cc$/
];

exports.archs = {
  arm: 'V8_TARGET_ARCH_ARM',
  arm64: 'V8_TARGET_ARCH_ARM64',
  mips: 'V8_TARGET_ARCH_MIPS',
  mips64: 'V8_TARGET_ARCH_MIPS64',
  ppc: "V8_TARGET_ARCH_PPC",
  ia32: 'V8_TARGET_ARCH_IA32',
  s390: 'V8_TARGET_ARCH_S390',
  x64: 'V8_TARGET_ARCH_X64',
  x87: 'V8_TARGET_ARCH_X87'
}

exports.platforms = {
  'aix': "#ifdef AIX",
  'freebsd': "#ifdef FreeBSD",
  'linux': "#ifdef Linux",
  'macos': "#ifdef Darwin",
  'openbsd': "#ifdef OpenBSD",
  'solaris': "#ifdef Solaris",
  'win32': "#ifdef Windows",
  'posix': "#ifndef Windows",
  'posix-time': "#ifndef Windows"
};

exports.traces = {
  'android': "V8_OS_ANDROID",
  'posix': "V8_OS_POSIX",
  'win': "V8_OS_WIN"
};

exports.gens = [
  '/out.gn/x64.release/gen/libraries.cc',
  '/out.gn/x64.release/gen/extras-libraries.cc',
  '/out.gn/x64.release/gen/experimental-extras-libraries.cc'
];
