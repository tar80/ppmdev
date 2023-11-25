import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {gitCmd, repoRoot, branchHead, branchName} from '../git';
import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';

jest.mock('@ppmdev/modules/io');

const root = PPx.ScriptName.replace(/^(.+\\ppmdev).*/, '$1');

describe('gitCmd()', function () {
  it('subcmd is not specified. must return an error', () => {
    // @ts-ignore
    expect(() => gitCmd({})).toThrow();
  });
  it('no options', () => {
    const obj: gitCmd = {subcmd: '@@@', wd: 'c:\\ppmdev'};
    expect(gitCmd(obj)).toBe('git -C "c:\\ppmdev" @@@');
  });
  it('full options', () => {
    const obj: gitCmd = {
      wd: 'c:\\ppmdev',
      noquotepath: true,
      noeditor: true,
      config: 'core.ignorecase=false',
      subcmd: 'log',
      opts: '-10 --online'
    };
    expect(gitCmd(obj)).toBe(
      'git -C "c:\\ppmdev" -c core.quotepath=false -c core.editor=false -c core.ignorecase=false log -10 --online'
    );
  });
});

describe('repoRoot()', function () {
  it('specify no arguments. the return value must be the root of current repositry', () => {
    expect(repoRoot()).toBe(root);
  });
  it('pass aux:local path. the return value must be the path without the aux domain', () => {
    const path = `${root}\\a\\b\\c`;
    const cwd = `aux:\\S_test\\${path}`;
    expect(repoRoot(cwd)).toBe(root);
  });
  it('pass aux:remote path. the return value must be an empty string', () => {
    const cwd = `aux://S_test//${root}`;
    expect(repoRoot(cwd)).toBe('');
  });
});

describe('branchName()', function () {
  const tempDir = `${os.tmpdir()}\\ppmdevtest`;
  const detachedHead = 'head~'
  beforeAll(() => {
    !fs.existsSync(tempDir) && fs.mkdirSync(tempDir);
    execSync(`git -C ${tempDir} init`);
    execSync(`git -C ${tempDir} commit --allow-empty -m"1st commit"`);
    execSync(`git -C ${tempDir} commit --allow-empty -m"2nd commit"`);
    execSync(`git -C ${tempDir} switch -d ${detachedHead}`);
  });
  afterAll(() => {
    fs.rmSync(tempDir, {recursive: true, force: true});
  });
  it('pass not exist path. the return value must be empty strings', () => {
    expect(branchName('c:\\not\\exist\\path')).toEqual(['', '']);
  });
  it('pass the ppmdev root path. the return value must be ["<branch name>", "<branch state>"]', () => {
    expect(branchName(root)).toEqual(['main', '']);
  });
  it('pass the temp repository root path. the return value meust be ["<detached head>", "Detached"]', () => {
    expect(branchName(tempDir)).toEqual([detachedHead, 'Detached'])
  });
});

describe('branchHead()', function () {
  it('pass an non-existent path. the return value must be [true, "<error message>"]', () => {
    const path = 'c:\\not\\exist\\path';
    expect(branchHead(path)).toEqual([true, `${path} is not exists`]);
  });
  it('pass an non-git repository root path. the return value must be [true, "<error message>"]', () => {
    const path = `${root}\\docs`;
    expect(branchHead(path)).toEqual([true, `${path}\\.git\\HEAD not found`]);
  });
  it('pass ppmdev root path. the return value must be [false, "<HEAD commit hash>"]', () => {
    let stdout = execSync('git show-ref origin/main');
    const hash = stdout.toString().split(' ')[0];
    expect(branchHead(root)).toEqual([false, hash]);
  });
});
