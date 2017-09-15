#!/usr/bin/env fibjs

const fs = require('fs');
const path = require('path');
const process = require('process');
const copy = require('@fibjs/copy');
const rmdirr = require('@fibjs/rmdirr');
const mkdirp = require('@fibjs/mkdirp');
const readdir = require('@fibjs/fs-readdir-recursive')

const { ignoreFiles,
  ignoreRegex,
  archs,
  platforms,
  traces,
  gens
} = require('./config.js');

const outDir = path.join(__dirname, '../v8');
const v8Dir = path.join(__dirname, '../v8-src/v8');
const platformDir = path.join(outDir, 'src/base/platform');

// copy source code
(() => {
  const srcDirs = ['include', 'src', 'testing', 'base'];
  srcDirs.map(dir => path.join(outDir, dir)).forEach(rmdirr);
  srcDirs.forEach(dir => {
    const src = path.join(v8Dir, dir);
    const dist = path.join(outDir, dir);
    copy(src, dist, (data, dir) => {
      if (!chk_file(dir.src)) {
        return false;
      }
      return data;
    });
  });

  function chk_file(fname) {
    fname = fname.replace(v8Dir, '').slice(1);

    if (!fname.endsWith('.h') && !fname.endsWith('.cc'))
      return false;

    if (ignoreFiles[fname])
      return false;

    const len = fname.length;
    for (var i = 0; i < ignoreRegex.length; i++)
      if (ignoreRegex[i].test(fname))
        return false;

    return true;
  }
})();

// patch os config
(() => {
  copy(path.join(__dirname, 'osconfig.h'),
    path.join(outDir, 'include/osconfig.h'));
})();

// patch platform source code
(() => {
  for (let platform in platforms) {
    const fname = path.join(platformDir, `platform-${platform}.cc`);
    const patch = platforms[platform];
    copy(fname, fname, data => {
      data = data.toString();
      return `#include "include/osconfig.h"\n\n${patch}\n\n${data}\n\n#endif`;
    });
  }
})();

// patch gens source code
(() => {
  gens.forEach(gen => {
    const src = path.join(v8Dir, gen);
    const dest = path.join(outDir, 'src/gen', path.basename(gen));
    copy(src, dest);
  });
})();

// remove unused code
(() => {
  ['src/third_party/vtune',
    'src/inspector'].map(dir => path.join(outDir, dir)).forEach(rmdirr);
})();

// patch source code
(() => {
  const srcDir = path.join(outDir, 'src');
  const dirs = readdir(srcDir);

  dirs.forEach(dir => {
    if (!dir.endsWith('.cc')) {
      return;
    }

    Object.keys(archs).forEach(arch => {
      let d = dir.split(path.sep);
      if (d.indexOf(arch) > -1) {
        dir = path.join(srcDir, dir);
        const patchCode = archs[arch];
        console.log('patch_src:', dir);
        copy(dir, dir, data => {
          data = data.toString();
          return `#if ${patchCode}\n\n${data}\n\n#endif  // ${patchCode}`;
        });
      }
    });
  });
})();

// patch trace code
(() => {
  for (let trace in traces) {
    const fname = path.join(outDir, `src/base/debug/stack_trace_${trace}.cc`);
    copy(fname, fname, data => {
      data = data.toString();
      return `#ifdef ${traces[trace]}\n\n${data}\n#endif`;
    });
  }
})();
