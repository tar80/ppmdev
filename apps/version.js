#!/usr/bin/env node
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const INSTALL_FILE = 'install';
const PACKAGE_FILE = 'package.json';
let initialVersion = '0.1.0';

const main = () => {
  const name = path.basename(process.cwd());
  const tempDir = `${os.tmpdir()}\\ppm`;
  const tempFile = `${tempDir}\\${name}_version`;
  const hasInstall = fs.existsSync(INSTALL_FILE);
  const versionFile = hasInstall ? INSTALL_FILE : PACKAGE_FILE;

  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir);

  try {
    execSync(`git -C ${process.cwd()} cat-file -p origin/main:${versionFile}> ${tempFile}`);
    initialVersion = getRemoteVersion(tempFile, hasInstall);
    fs.rmSync(tempFile, {force: true});
  } catch (err) {
    /* null */
  }

  const message = `Please enter new version [current: ${initialVersion}] > `;

  readInterface.question(message, (input) => {
    readInterface.close();

    if (input === '') {
      console.log('Abort.');
      process.exit();
    }

    if (downVersion(initialVersion, input)) {
      console.log('Version down is not allowed.');
      process.exit();
    }

    if (hasInstall) {
      const {path, rgx, rep} = conv('ppm', input);
      overwrite(path, rgx, rep);
    }

    const {path, rgx, rep} = conv('package', input);
    fs.existsSync(path) && overwrite(path, rgx, rep);

    console.log('Success.');
  });
};

const readInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const partOfVersion = (part) => {
  let part_ = '00';

  if (part) {
    part_ = part.length === 1 ? `0${part}` : part;
  }

  return part_;
};

const semver = (version) => {
  const s = String(version).split('.');
  s[1] = partOfVersion(s[1]);
  s[2] = partOfVersion(s[2]);

  return Number([s[0], s[1], s[2]].join(''));
};

const downVersion = (c, i) => {
  const oldver = Number(semver(c));
  const newver = Number(semver(i));

  return oldver > newver;
};

const conv = (t, v) => {
  const term = {
    ppm: [INSTALL_FILE, 'VERSION=[0-9\\.]+', `VERSION=${v}`],
    package: [PACKAGE_FILE, `"version": "[0-9\\.]+"`, `"version": "${v}"`]
  }[t];

  return {path: term[0], rgx: RegExp(term[1]), rep: term[2]};
};

const overwrite = (path, rgx, rep) => {
  fs.readFile(path, 'utf8', function (err, data) {
    if (err) throw err;

    data = data.replace(rgx, rep);

    fs.writeFile(path, data, function (err) {
      if (err) throw err;
    });
  });
};

const getRemoteVersion = (path, hasInstall) => {
  let version = initialVersion;
  const rgx = hasInstall ? /^VERSION=(.+)$/ : /^\s+"version":\s+"(.+)",$/;
  const f = fs.statSync(path);

  if (f.size !== 0) {
    const raw = fs.readFileSync(path);
    const lines = raw.toString().split('\n');
    const line = lines.find((v) => rgx.test(v));

    if (line) {
      version = line.replace(rgx, '$1');
    }
  }

  return version;
};

main();
