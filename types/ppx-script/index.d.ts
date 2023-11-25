// Type definitions for PPx Script Module R20
// Definitions by: tar80 (https://github.com/tar80)

declare var PPx: PPx;

interface PPxArguments extends WshArguments {
  atEnd(): boolean;
  moveNext(): void;
  reset(): void;
  item(int: number): string;
  value: string;
}

declare interface PPx {
  // Cursor();
  Arguments: PPxArguments;
  CreateObject<K extends keyof ActiveXObjectNameMap = any>(strProgID: K, strPrefix?: string): ActiveXObjectNameMap[K];
  ConnectObject(objEventSource: any, strPrefix: string): void;
  DisconnectObject(object: any): void;
  GetObject<K extends keyof ActiveXObjectNameMap>(
    strPathname: string,
    strProgID: K,
    strPrefix?: string
  ): ActiveXObjectNameMap[K];
  GetObject(pathname: string, progid: string): object;
  Echo(...args: any[]): void;
  linemessage(text: any): void;
  log(text: any): void;
  report(text: any): void;
  Entry: typeof entry;
  EntryInsert(index: number, name: string): void;
  EntryFirstMark(): number;
  EntryNextMark(): number;
  EntryPrevMark(): number;
  EntryLastMark(): number;
  Execute(param: string): number;
  Extract(param?: string): string;
  getComboItemCount(id: number | undefined): number;
  getValue(key: string): string;
  setValue(key: string, value: string | number): void;
  getIValue(key: string): string;
  setIValue(key: string, value: string | number): void;
  getProcessValue(key: string): string;
  setProcessValue(key: string, value: string | number): void;
  GetFileInformation(filename: string, mode: number): string;
  Pane: typeof pane;
  SetPopLineMessage(message: any): void;
  Sleep(intTime: number): void;
  StayMode(value: number | string): number;
  // Quit(exitcode?: number): void;
  Quit: typeof process.exit;
  Clipboard: string;
  readonly CodeType: number;
  readonly ComboIDName: string;
  readonly DirectoryType: number;
  readonly DriveVolumeLabel: string;
  readonly DriveFreeSize: number;
  readonly DriveTotalSize: number;
  readonly EntryAllCount: number;
  readonly EntryAttributes: number;
  EntryComment: string;
  readonly EntryDisplayX: number;
  readonly EntryDisplayY: number;
  readonly EntryDisplayTop: number;
  readonly EntryDisplayCount: number;
  readonly EntryDisplayFiles: number;
  readonly EntryDisplayDirectories: number;
  EntryHighlight: number;
  EntryIndex: number;
  readonly EntryName: string;
  EntryMark: number;
  readonly EntryMarkCount: number;
  readonly EntryMarkSize: number;
  EntryState: number;
  EntryExtColor: number;
  readonly ModuleVersion: number;
  readonly EntrySize: number;
  readonly PointIndex: number;
  readonly PointType: number;
  readonly PPxVersion: number;
  result: any;
  readonly ScriptEngineName: string;
  readonly ScriptEngineVersion: string;
  readonly ScriptFullName: string;
  readonly ScriptName: string;
  SlowMode: number;
  SyncView: number;
  readonly WindowDirection: number;
  readonly windowIDName: string;
}

declare namespace entry {
  function Hide(): number;
  function information(): string;
  function item(index: number | string): number;
  function getComment(id: number | string): string;
  function setComment(id: number | string, value: string): void;
  function FirstMark(): number;
  function NextMark(): number;
  function PrevMark(): number;
  function LastMark(): number;
  var AllEntry: object;
  var AllMark: object;
  var Attributes: number;
  var Comment: string;
  var Count: number;
  var DateCreated: Date;
  var DateLastAccessed: Date;
  var DateLastModified: Date;
  var ExtColor: number;
  var Highlight: number;
  var length: number;
  var index: number;
  var Mark: number;
  var Name: string;
  var ShortName: string;
  var Size: number;
  var State: number;
}

declare namespace pane {
  function atEnd(): number;
  function moveNext(): number;
  function Reset(): number;
  function item(index: number | string): number;
  var Count: number;
  var length: number;
  var index: number;
  var IndexFrom: void;
  var Tab: typeof tab;
}

declare namespace tab {
  function atEnd(): number;
  function moveNext(): number;
  function Reset(): number;
  function item(index: number | string): number;
  function Execute(param: string): number;
  function Extract(param: string): string;
  var BackColor: number;
  var Color: number;
  var Count: number;
  var length: number;
  var Lock: number;
  var idname: string;
  var index: number;
  var IndexFrom: void;
  var Name: string;
  var Pane: number;
  var TotalCount: number;
  var TotalPPcCount: number;
  var Type: number;
}
