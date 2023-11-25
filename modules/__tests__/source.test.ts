import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {type Source, expandSource, setSource, owSource, sourceComp} from '@ppmdev/modules/source';
import {execSync} from 'child_process';

const ppxe = PPx.Execute;

describe('expandSource()', function () {
  it('specify non-existent source. the return value must be undefined', () => {
    expect(expandSource('non-existent-source')).toBeUndefined();
  });
  it('specify existent source. the return value must be {name,path,enable,setup,location}', () => {
    jest.spyOn(PPx, 'Execute').mockImplementation((param) => {
      const ppc = `${process.env.PPX_DIR}\\ppcw.exe`;
      execSync(`${ppc} -bootid:p -noactive -r -k ${param}`);
      return 0;
    });
    const name = 'dummy-plugin';
    const path = `${PPx.Extract('%sgu"ppmrepo"')}\\${name}`;
    const value = '{"enable":true,"setup":false,"location":"remote"}';
    PPx.Execute(`*setcust S_ppm#sources:${name}=${value}`);

    const obj = {name, path, enable: true, setup: false, location: 'remote'};
    expect(expandSource(name)).toEqual(obj);
    PPx.Execute(`*deletecust S_ppm#sources,"${name}"`);
  });
});

describe('owSource()', function () {
  afterAll(() => (PPx.Execute = ppxe));
  it('change some of the values', () => {
    jest.spyOn(PPx, 'Execute').mockImplementation((param) => {
      const ppc = `${process.env.PPX_DIR}\\ppcw.exe`;
      execSync(`${ppc} -bootid:p -noactive -r -k ${param}`);
      return 0;
    });
    const name = 'dummy-plugin';
    const value = '{"enable":true,"setup":false,"location":"remote"}';
    PPx.Execute(`*setcust S_ppm#sources:${name}=${value}`);
    owSource(name, {enable: false, setup: true});
    const details = PPx.Extract(`%*getcust(S_ppm#sources:${name})`);
    expect(details).toBe('{"enable":false,"setup":true,"location":"remote"}');
    PPx.Execute(`*deletecust S_ppm#sources,"${name}"`);
  });
});

describe('setSource()', function () {
  const name = 'ppx-plugin-manager';
  const path = 'c:\\bin\\ppm\\repo';
  let spy: any;
  beforeEach(() => (spy = jest.spyOn(PPx, 'Execute')));
  afterAll(() => (PPx.Execute = ppxe));
  it('set remote plugin', () => {
    const source: Source = {name, enable: true, setup: false, version: '0.1.0', location: 'remote', path};
    // const spy = jest.spyOn(PPx, 'Execute');
    setSource(source);
    expect(spy).toHaveBeenLastCalledWith(
      `*setcust S_ppm#sources:${name}={"enable":true,"setup":false,"version":"0.1.0","location":"remote"}`
    );
  });
  it('set local plugin', () => {
    const source: Source = {name, enable: false, setup: false, version: '0.1.0', location: 'local', path};
    // const spy = jest.spyOn(PPx, 'Execute');
    setSource(source);
    expect(spy).toHaveBeenLastCalledWith(
      `*setcust S_ppm#sources:${name}={"enable":false,"setup":false,"version":"0.1.0","location":"local","path":"${path}"}`
    );
  });
});

describe('sourceComp.getPrefix()', function () {
  it('disabled source. the return value must be "~"(disabled)', () => {
    const source = {enable: false} as Source;
    expect(sourceComp.getPrefix(source)).toBe('~');
  });
  it('enable and unset source. the return value must be "!"(installed)', () => {
    const source = {enable: true, setup: false} as Source;
    expect(sourceComp.getPrefix(source)).toBe('!');
  });
  it('enable and set source. the return value must be ""(setup)', () => {
    const source = {enable: true, setup: true} as Source;
    expect(sourceComp.getPrefix(source)).toBe('');
  });
});

// describe('sourceComp.fix()', function () {
//   
// });
