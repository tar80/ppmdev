#!/usr/bin/env node
import {rollup} from 'rollup';
import swc from '@rollup/plugin-swc';
import strip from '@rollup/plugin-strip';
import {getBabelOutputPlugin} from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import {readFile, writeFile, readdir} from 'node:fs/promises';

const SOURCE_DIR = 'src';
const DEV_DIR = 'dev';
const DIST_DIR = 'dist';
const isProduction = process.env.NODE_ENV === 'Production';

if (!isProduction && typeof process.argv[2] === 'undefined') {
  console.log('\x1b[31m[!] Error: no path specified\x1b[39m');
  process.exit(1);
}

let input;

if (isProduction) {
  await readdirRecursively(SOURCE_DIR).catch((err) => {
    console.error('Error:', err);
  });
} else {
  input = process.argv[2].replace(/\\/g, '/');
  input = input.replace(/^src\//, '');
  const cv8 = input.includes('cv8/');

  build(...configuration(DEV_DIR, false, cv8));
  build(...configuration(DIST_DIR, true, cv8));
}

function configuration(dest, prod, cv8) {
  return [
    {
      input: SOURCE_DIR + '/' + input,
      plugins: [
        swc(),
        commonjs({
          extensions: ['.ts']
        }),
        resolve({
          browser: false
        }),
        prod &&
          strip({
            include: ['**/*.ts', '**/*.js'],
            exclude: '@ppmdev/modules/debug.ts',
            functions: ['debug.*', 'console.log']
          }),
        !cv8 &&
          getBabelOutputPlugin({
            targets: {'ie': '8'},
            presets: [['@babel/preset-env', {loose: true, modules: false, useBuiltIns: false}]],
            plugins: [['@babel/plugin-transform-for-of', {assumeArray: true}]]
          }),
        prod &&
          terser({
            ie8: true,
            format: {
              comments: false,
              ecma: 3,
              shebang: false
            }
          })
      ]
    },
    {
      file: `${dest}/${input.replace(/(cv8\/)?([^/]+)\.ts$/, '$2.js')}`,
      format: 'es',
      // sourcemap: !prod
    }
  ];
}

async function build(inputs, outputs) {
  let bundle;

  try {
    bundle = await rollup(inputs);
    await bundle.write(outputs);
    const output = outputs.file;
    const bom = '\ufeff';
    const raw = await readFile(output);
    await writeFile(output, bom + raw);
    console.log(`\x1b[32mSuccess: ${output}\x1b[39m`);
  } catch (error) {
    console.error(error);
  } finally {
    bundle && (await bundle.close());
  }
}

async function readdirRecursively(dir) {
  const dirents = await readdir(dir, {withFileTypes: true});

  for await (const dirent of dirents) {
    if (/^_.*/.test(dirent.name)) {
      continue;
    }

    if (dirent.isDirectory()) {
      if (dirent.name === 'mod') {
        continue;
      }

      await readdirRecursively(`${dir}/${dirent.name}`);
    }

    if (dirent.isFile()) {
      input = `${dirent.path}/${dirent.name}`.substring(SOURCE_DIR.length + 1);
      const cv8 = input.includes('cv8/');
      await build(...configuration(DIST_DIR, true, cv8));
    }
  }
}
