import PPx from '@ppmdev/modules/ppx';
global.PPx = Object.create(PPx);
import {ppm} from '@ppmdev/modules/ppm';
import {execSync} from 'node:child_process';

const ppxe = PPx.Execute;
const ppxt = PPx.Extract;

describe('ppm.echo() and ppm.question()', function () {
  beforeEach(() => (PPx.Execute = jest.fn()));
  afterAll(() => (PPx.Execute = ppxe));
  it('pass an empty string in the title. the return title must be "ppm"', function () {
    ppm.echo('', 'test');
    expect(PPx.Execute).toHaveBeenCalledWith(`%"ppm" %OC %I"test"`);
    expect(PPx.Execute).toHaveBeenCalledTimes(1);
    ppm.question('', 'test');
    expect(PPx.Execute).toHaveBeenCalledWith(`%"ppm" %OC %Q"test"`);
    expect(PPx.Execute).toHaveBeenCalledTimes(2);
  });
  it('pass an empty string in the message. the return message must be an empty string', () => {
    ppm.echo('mock', '');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`%"ppm/mock" %OC %I""`);
    ppm.question('mock', '');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`%"ppm/mock" %OC %Q""`);
  });
  it('specify error level. must return a message with the error level added to the end ', () => {
    const errorlevel = 1;
    const msg = `message with level(${errorlevel})`;
    ppm.echo('mock', msg);
    expect(PPx.Execute).toHaveBeenLastCalledWith(`%"ppm/mock" %OC %I"${msg}"`);
  });
});

// describe('ppm.choice()', function () {
//
// });

describe('ppm.execute()', function () {
  beforeEach(() => (PPx.Execute = jest.fn()));
  afterAll(() => (PPx.Execute = ppxe));
  it('passed an empty string to the command. the return level must be 1', () => {
    const errorlevel = ppm.execute('c', '');
    expect(1).toBe(errorlevel);
    expect(PPx.Execute).toHaveBeenCalledTimes(0);
  });
  it('running ppm-test', () => {
    // @ts-ignore
    global.ppm_test_run = 2;
    ppm.execute('.', '*clearchange');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`*execute B,*linemessage %%bx1b[2F[Execute] .,%(*clearchange%)`);
    // @ts-ignore
    global.ppm_test_run = undefined;
  });
  it('specify self id', () => {
    ppm.execute('.', '*clearchange');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`*clearchange`);
    expect(PPx.Execute).toHaveBeenCalledTimes(1);
  });
  it('specify an empty id', () => {
    ppm.execute('', '*clearchange');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`*execute ,*clearchange`);
    expect(PPx.Execute).toHaveBeenCalledTimes(1);
  });
  it('specify id', () => {
    ppm.execute('CB', '*clearchange');
    expect(PPx.Execute).toHaveBeenLastCalledWith(`*execute CB,*clearchange`);
    expect(PPx.Execute).toHaveBeenCalledTimes(1);
  });
});

// describe('ppm.execSync', function () {
//
// });

describe('ppm.extract()', function () {
  it('pass an empty string to the value', () => {
    expect(ppm.extract('.', '')).toEqual([13, '']);
  });
  it('specify self id. during testing, ppx.ts executes commands through PPb, so the path must return "B"', () => {
    expect(ppm.extract('.', '%n')).toEqual([0, 'B']);
  });
  it('specify an empty id', () => {
    expect(ppm.extract('', '%%n')).toEqual([0, 'B']);
  });
  it('specify existent id', () => {
    expect(ppm.extract('CA', '%%n')).toEqual([0, 'CA']);
  });
  it('specify non-existent id', () => {
    expect(ppm.extract('V', '%%n')).toEqual([0, '']);
  });
});

// describe('ppm.lang()', function () {
//
// });

// describe('ppm.glocal()', function () {
//
// });

describe('ppm.getpath()', function () {
  it('pass incorrect format. the return level must be 13', () => {
    expect(ppm.getpath('dc', 'test.txt')).toEqual([13, '']);
    expect(ppm.getpath('DCZ', 'test.txt')).toEqual([13, '']);
  });
  it('returns full-path', () => {
    expect(ppm.getpath('DC', 'test.txt', 'c:\\temp')).toEqual([0, 'C:\\temp\\test.txt']);
  });
  it('returns directory-path', () => {
    expect(ppm.getpath('D', 'C:\\bin\\test.txt')).toEqual([0, 'C:\\bin']);
  });
});

describe('ppm.getcust()', function () {
  it('pass an empty string. the return level must be 1', () => {
    expect(ppm.getcust('')).toEqual([1, '']);
  });
  it('pass unavailable id. the return level must be 13', () => {
    expect(ppm.getcust('Z_test')).toEqual([13, '']);
  });
  it('pass available id', () => {
    expect(ppm.getcust('S_test:abc')).toEqual([0, '']);
    expect(ppm.getcust('Mes000')).toEqual([0, 'Mes000	= {	** comment **\r\n}\r\n']);
    expect(ppm.getcust('_User:abc')).toEqual([0, '']);
    expect(ppm.getcust('Mes0411:7007')).toEqual([0, '&Option']);
  });
});

describe('deletecust()', function () {
  beforeEach(() => (PPx.Execute = jest.fn()));
  afterAll(() => (PPx.Execute = ppxe));

  it('pass invalid id. the return level must be 13', () => {
    expect(ppm.deletecust('Jest_mock')).toBe(13);
  });
  it('ids not enclosed in parentheses must be enclosed in parentheses', () => {
    ppm.deletecust('K_test');
    expect(PPx.Execute).toHaveBeenLastCalledWith('*deletecust "K_test"');
  });
  it('specify an "id" with enclosed in parentheses', () => {
    ppm.deletecust('"K_test"', '');
    expect(PPx.Execute).toHaveBeenLastCalledWith('*deletecust "K_test"');
  });
  it('subid must be enclosed in parentheses', () => {
    ppm.deletecust('K_test', 'prop1');
    expect(PPx.Execute).toHaveBeenLastCalledWith('*deletecust K_test,"prop1"');
  });
  it('id and subid are specified. only subid needs to be enclosed in parentheses', () => {
    ppm.deletecust('"K_test"', '"prop1"');
    expect(PPx.Execute).toHaveBeenLastCalledWith('*deletecust K_test,"prop1"');
  });
  it('specify false for subid. this ignores subid', () => {
    ppm.deletecust('"M_test"', false);
    expect(PPx.Execute).toHaveBeenLastCalledWith('*deletecust "M_test"');
  });
  it('specify load to true. then loadcust is called', () => {
    ppm.deletecust('"M_test"', '"prop1"', true);
    expect(PPx.Execute).toHaveBeenCalledWith('*deletecust M_test,"prop1"');
    expect(PPx.Execute).toHaveBeenLastCalledWith('%K"loadcust"');
    expect(PPx.Execute).toHaveBeenCalledTimes(2);
  });
});

// describe('ppm.setkey()', function () {
//
// });
// describe('ppm.deletekeys()', function () {
//
// });
// describe('ppm.linecust()', function () {
//
// });

describe('ppm.getvalue()', function () {
  afterAll(() => (PPx.Execute = ppxe));
  it('pass an empty string. the return level must be 1', () => {
    expect(ppm.getvalue('.', 'i', '')).toEqual([1, '']);
  });
  it('pass non-existing ids. the return level must be 13', () => {
    expect(ppm.getvalue('.', 'e', 'key')).toEqual([13, '']);
    expect(ppm.getvalue('V', 'p', 'key')).toEqual([13, '']);
  });
  it('pass existing id', () => {
    jest.spyOn(PPx, 'Execute').mockImplementation((param) => {
      const ppc = `${process.env.PPX_DIR}\\ppcw.exe`;
      execSync(`${ppc} -bootid:p -noactive -r -k ${param}`);
      return 0;
    });
    PPx.Execute('*execute C,*string i,ppm_test_id=test');
    expect(ppm.getvalue('C', 'i', 'ppm_test_id')).toEqual([0, 'test']);
    PPx.Execute('*execute C,*string i,ppm_test_id=');
  });
});

describe('ppm.setvalue()', function () {
  afterAll(() => (PPx.Execute = ppxe));
  it('check the returns', () => {
    jest.spyOn(PPx, 'Execute').mockImplementation((param) => {
      const ppc = `${process.env.PPX_DIR}\\ppcw.exe`;
      execSync(`${ppc} -bootid:p -noactive -r -k ${param}`);
      return 0;
    });
    ppm.setvalue('C', 'i', 'key', 'value');
    expect(ppm.getvalue('C', 'i', 'key')).toEqual([0, 'value']);
    ppm.setvalue('C', 'i', 'key', '');
  });
});

describe('ppm.input()', function () {
  it('unavailable type of mode. the return level must be 13', () => {
    expect(ppm.getinput({mode: ''})).toEqual([13, '']);
    expect(ppm.getinput({mode: 'REg'})).toEqual([13, '']);
  });
  it('enable all options', () => {
    PPx.Extract = jest.fn();
    const obj = {
      messate: '',
      title: 'jest',
      mode: 'RSg,dm',
      select: 'first',
      multi: true,
      leavecancel: true,
      forpath: true,
      fordijit: true,
      k: '*wait 300%%:%%k"test"'
    };
    ppm.getinput(obj);
    expect(PPx.Extract).toHaveBeenCalledWith(
      `%OCP %*input("" -title:"jest" -mode:RSg,dm -select:first -multi -leavecancel -forpath -fordijit -k %%OP- *wait 300%%:%%k"test")`
    );
    expect(PPx.Extract).toHaveBeenLastCalledWith();
    expect(PPx.Extract).toBeCalledTimes(2);
    PPx.Extract = ppxt;
  });
});
