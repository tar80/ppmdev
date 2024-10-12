import PPx from '@ppmdev/modules/ppx.ts';
global.PPx = Object.create(PPx);
import {ppmTable} from '@ppmdev/modules/data.ts';
import {onceEvent, userEvent} from '../event.ts';

const EVENT_TABLE_ID = ppmTable.event;
const SUB_ID = 'jest';

describe('onceEvent()', function () {
  const execute = jest.spyOn(PPx, 'Execute');
  const extract = jest.spyOn(PPx, 'Extract');
  afterEach(() => {
    execute.mockClear();
    extract.mockClear();
  });

  it('empty event will not be executed', () => {
    const cmdline = '';
    extract.mockImplementation(() => cmdline);
    const closeEvent = onceEvent(SUB_ID, cmdline);
    closeEvent();
    const resp = {
      1: `*setcust ${EVENT_TABLE_ID}:${SUB_ID}=%(${cmdline}%)`
    };
    expect(execute).toHaveBeenCalledWith(resp[1]);
    expect(execute).toHaveBeenCalledTimes(1);
  });
  it('event will be deleted after exection', () => {
    const cmdline = '*linemessage jest-test';
    extract.mockImplementation(() => cmdline);
    const closeEvent = onceEvent(SUB_ID, cmdline);
    closeEvent();
    const resp = {
      1: `*setcust ${EVENT_TABLE_ID}:${SUB_ID}=%(${cmdline}%)`,
      2: cmdline,
      3: `*deletecust ${EVENT_TABLE_ID}:${SUB_ID}`
    };
    expect(execute).toHaveBeenCalledWith(resp[1]);
    expect(execute).toHaveBeenCalledWith(resp[2]);
    expect(execute).toHaveBeenCalledWith(resp[3]);
    expect(execute).toHaveBeenCalledTimes(3);
  });
});

describe('userEvent', function () {
  const execute = jest.spyOn(PPx, 'Execute');
  const extract = jest.spyOn(PPx, 'Extract');
  afterEach(() => {
    execute.mockClear();
    extract.mockClear();
  });

  describe('set()', function () {
    it('set event', () => {
      const cmdline = '*linemessage test';
      const resp = `*setcust ${EVENT_TABLE_ID}:${SUB_ID}=%(${cmdline}%)`;
      userEvent.set(SUB_ID, cmdline);
      expect(execute).toHaveBeenCalledWith(resp);
    });
  });

  describe('unset()', function () {
    it('empty event, the deletion process will not be performed', () => {
      extract.mockImplementation(() => '');
      userEvent.unset(SUB_ID);
      expect(extract).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledTimes(0);
    });
    it('delete event', () => {
      const cmdline = '*linemessage jest-test';
      extract.mockImplementation(() => cmdline);
      userEvent.unset(SUB_ID);
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('do()', function () {
    it('empty event will not be performed', () => {
      extract.mockImplementation(() => '');
      userEvent.do(SUB_ID);
      expect(execute).toHaveBeenCalledTimes(0);
    });
    it('the command set in the event must be executed', () => {
      const cmdline = '*linemessage jest-test';
      extract.mockImplementation(() => cmdline);
      userEvent.do(SUB_ID);
      expect(execute).toHaveBeenCalledWith(cmdline);
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('once()', function () {
    it('empty event will not be performed', () => {
      extract.mockImplementation(() => '');
      userEvent.do(SUB_ID);
      expect(execute).toHaveBeenCalledTimes(0);
    });
    it('command set in event must be executed once and then deleted', () => {
      const cmdline = '*linemessage jest-test';
      extract.mockImplementation(() => cmdline);
      userEvent.once(SUB_ID);
      expect(execute).toHaveBeenCalledWith(cmdline);
      expect(execute).toHaveBeenCalledWith(`*deletecust ${EVENT_TABLE_ID}:${SUB_ID}`);
      expect(execute).toHaveBeenCalledTimes(2);
    });
  });
});
