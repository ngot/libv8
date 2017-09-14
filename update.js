#!/usr/bin/env fibjs

const fs = require('fs');
const path = require('path');
const process = require('process');
const copy = require('@fibjs/copy');
const rmdirr = require('@fibjs/rmdirr');
const mkdirp = require('@fibjs/mkdirp');

const outDir = path.join(__dirname, 'v8');
const v8Dir = path.fullpath("");

const platformDir = path.join(outDir, 'src/base/platform');

const files = {
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

Object.keys(files).map(key => {
  key = path.normalize(key);
  files[key] = 1;
});

const re = [
  /^src\/d8.*$/,
  /^.*unittest.*\.cc$/,
  /^src\/test\/.*\.cc$/
];

function chk_file(fname) {
  fname = fname.replace(v8Dir, '').slice(1);
  console.log('chk_file:', fname);

  if (!fname.endsWith('.h') && !fname.endsWith('.cc'))
    return false;

  if (files[fname])
    return false;

  const len = fname.length;

  for (var i = 0; i < re.length; i++)
    if (re[i].test(fname))
      return false;

  return true;
}

function fix_src(p, val) {
  var dir = fs.readdir(p);
  dir.forEach(name => {
    if (name.endsWith('.cc')) {
      var fname = path.join(p, name);
      var txt = fs.readTextFile(fname);
      console.log("fix", fname);
      fs.writeFile(fname, '#include "src/v8.h"\n\n#if ' + val + '\n\n' + txt + '\n\n#endif  // ' + val);
    }
  });
}

var archs = {
  arm: 'V8_TARGET_ARCH_ARM',
  arm64: 'V8_TARGET_ARCH_ARM64',
  mips: 'V8_TARGET_ARCH_MIPS',
  mips64: 'V8_TARGET_ARCH_MIPS64',
  ppc: "V8_TARGET_ARCH_PPC",
  ia32: 'V8_TARGET_ARCH_IA32',
  s390: 'V8_TARGET_ARCH_S390',
  x64: 'V8_TARGET_ARCH_X64',
  x87: 'V8_TARGET_ARCH_X87'
};

function patch_src(p) {
  var dir = fs.readdir(p);
  dir.forEach(name => {
    var fname = path.join(p ,name);
    var f = fs.stat(fname);
    if (f.isDirectory()) {
      if (archs[name])
        fix_src(fname, archs[name]);
      else
        patch_src(fname);
    }
  });
}

var plats1 = {
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

function patch_plat() {
  for (var f in plats1) {
    var fname = path.join(platformDir, 'platform-' + f + '.cc');
    var txt = fs.readTextFile(fname);
    var val = plats1[f];

    console.log("patch", fname);
    txt = '#include "include/osconfig.h"\n\n' + val + '\n\n' + txt + '\n\n#endif';
    fs.writeFile(fname, txt);
  }
}

var traces = {
  'android': "V8_OS_ANDROID",
  'posix': "V8_OS_POSIX",
  'win': "V8_OS_WIN"
};

function patch_trace() {
  for (var f in traces) {
    var fname = 'src/base/debug/stack_trace_' + f + '.cc';
    fname = path.join(outDir, fname);
    var txt = fs.readTextFile(fname);
    var txt1;
    var val = traces[f];

    console.log("patch", fname);
    txt1 = txt.replace('#include "src/base/debug/stack_trace.h"\n', '#include "src/base/debug/stack_trace.h"\n#ifdef ' + val);

    fs.writeFile(fname, txt1 + "\n#endif");
  }
}

function patch_trace_win() {
  var fname = "src/base/debug/stack_trace_win.cc";
  fname = path.join(outDir, fname);

  console.log("patch", fname);
  var txt = fs.readTextFile(fname);
  txt = txt.replace("bool InitializeSymbols()",
    "bool InitializeSymbols() {\n" +
    "  g_init_error = ERROR_SUCCESS;\n" +
    "  return true;\n" +
    "}\n" +
    "\n" +
    "inline bool InitializeSymbols1()");
  fs.writeFile(fname, txt);
}

function patch_macro() {
  var fname = "src/macro-assembler.h";
  fname = path.join(outDir, fname);

  console.log("patch", fname);
  var txt = fs.readTextFile(fname);
  fs.writeFile(fname, '#include "src/v8.h"\n\n' + txt);
}

function patch_trap() {
  var fname = 'src/trap-handler/handler-inside.cc';
  fname = path.join(outDir, fname);

  console.log("patch", fname);

  var txt = fs.readTextFile(fname);
  txt = "#ifndef _WIN32\n\n" + txt + "\n\n#endif\n";
  fs.writeFile(fname, txt);
}

function patch_snapshot() {
  mkdirp(path.join(outDir, "src/snapshot/snapshots"));

  var archs = {
    arm: 'V8_TARGET_ARCH_ARM',
    arm64: 'V8_TARGET_ARCH_ARM64',
    mips: 'V8_TARGET_ARCH_MIPS',
    mips64: 'V8_TARGET_ARCH_MIPS64',
    ppc: "V8_TARGET_ARCH_PPC",
    ppc64: "V8_TARGET_ARCH_PPC64",
    ia32: 'V8_TARGET_ARCH_IA32',
    s390: 'V8_TARGET_ARCH_S390',
    x64: 'V8_TARGET_ARCH_X64'
  };

  var warch_win = {
    x64: true,
    ia32: true
  }

  copy(path.join(v8Dir, "/src/snapshot/mksnapshot.cc"),
    path.join(outDir, "test/src/mksnapshot.inl"));

  var txt = fs.readTextFile(path.join(v8Dir, "/src/snapshot/snapshot-empty.cc"));

  for (var arch in archs) {
    if (warch_win[arch]) {
      fs.writeFile(path.join(outDir, "src/snapshot/snapshots/snapshot-" + arch + ".cc"),
        '#ifndef _WIN32\n\n#include "src/v8.h"\n\n#if ' + archs[arch] + '\n\n' + txt + '\n\n#endif  // '
           + archs[arch] + '\n\n#endif _WIN32');

      fs.writeFile(path.join(outDir, "src/snapshot/snapshots/snapshot-" + arch + "-win.cc"),
        '#ifdef _WIN32\n\n#include "src/v8.h"\n\n#if ' + archs[arch] + '\n\n' + txt + '\n\n#endif  // ' 
          + archs[arch] + '\n\n#endif _WIN32');
    } else
      fs.writeFile(path.join(outDir, "src/snapshot/snapshots/snapshot-" + arch + ".cc"),
        '#include "src/v8.h"\n\n#if ' + archs[arch] + '\n\n' + txt + '\n\n#endif  // ' 
          + archs[arch]);
  }
}

const srcDirs = ['include', 'src', 'testing'];

srcDirs.map(dir => path.join(outDir, dir)).forEach(rmdirr);
srcDirs.forEach(dir => {
  copy(path.join(v8Dir, dir),
    path.join(outDir, dir),
    (data, dir) => {
      if (!chk_file(dir.src)) {
        return false;
      }
      return data;
    });
});

copy(path.join(__dirname, 'tools/osconfig.h'),
  path.join(outDir, 'include/osconfig.h'));

copy(path.join(v8Dir, 'base'),
  path.join(outDir, 'include/base'));

patch_plat();

const gens = [
  '/out.gn/x64.release/gen/libraries.cc',
  '/out.gn/x64.release/gen/extras-libraries.cc',
  '/out.gn/x64.release/gen/experimental-extras-libraries.cc'
];
const genDir = path.join(outDir, 'src/gen');
mkdirp(genDir);
gens.forEach(gen => {
  copy(path.join(v8Dir, gen),
    path.join(genDir, path.basename(gen)));
});

['src/third_party/vtune',
  'src/inspector'].map(dir => path.join(outDir, dir)).forEach(rmdirr);

patch_src(path.join(outDir, 'src'));
patch_trace();
patch_trace_win();
patch_macro();
patch_trap();

patch_snapshot();
