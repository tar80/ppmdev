// Type definitions for PPx Script Module R21
// Definitions by: tar80 (https://github.com/tar80)

declare var PPx: PPx;
type ZeroTo<T extends number, A extends number[] = []> = A['length'] extends T ? A[number] | T : ZeroTo<T, [...A, A['length']]>;

interface PPxArguments {
  atEnd(): boolean;
  moveNext(): void;
  reset(): void;
  Item(int: number): string;
  value: string;
  length: number;
  Length: number;
  count: number;
  Count: number;
}

declare namespace PPxEntry {
  const enum Attribute {
    Normal = 0,
    ReadOnly = 1,
    Hidden = 2,
    System = 4,
    Label = 8,
    Directory = 16,
    Archive = 32,
    Temporary = 256,
    Sparse = 512,
    Reparse = 1024,
    Compressed = 2048,
    Offline = 4096,
    NoIndex = 8192
  }
}
declare interface PPx {
  // Cursor();
  Argument: PPxArguments['Item'];
  Arguments: PPxArguments;
  CreateObject<K extends keyof ActiveXObjectNameMap = any>(strProgID: K, strPrefix?: string): ActiveXObjectNameMap[K];
  ConnectObject(objEventSource: any, strPrefix: string): void;
  DisconnectObject(object: any): void;
  GetObject<K extends keyof ActiveXObjectNameMap>(strPathname: string, strProgID: K, strPrefix?: string): ActiveXObjectNameMap[K];
  GetObject(pathname: string, progid: string): object;
  Echo(...args: any[]): void;
  Include(): any;
  linemessage(text: any): void;
  log(text: any): void;
  report(text: any): void;
  //TODO: update later
  Enumerator: any;
  Entry: typeof entry;
  EntryInsert(index: number, name: string): void;
  EntryFirstMark(): number;
  EntryNextMark(): number;
  EntryPrevMark(): number;
  EntryLastMark(): number;
  Execute(param: string): number;
  Extract(param?: string): string;
  GetComboItemCount(id: number | undefined): number;
  getValue(key: string): string;
  setValue(key: string, value: string | number): void;
  getIValue(key: string): string;
  setIValue(key: string, value: string | number): void;
  getProcessValue(key: string): string;
  setProcessValue(key: string, value: string | number): void;
  GetFileInformation(filename: string, mode?: number): string;
  LoadCount(): number;
  Pane: typeof pane;
  SetPopLineMessage(message: any): void;
  Sleep(intTime: number): void;
  StayMode: number;
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
  EntryHighlight: ZeroTo<7>;
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
  WindowIDName: string;
}

declare namespace entry {
  var Entry: Object;
  function atEnd(): typeof entry;
  function moveNext(): typeof entry;
  function IndexFrom(name: string): number;
  function Information(): string;
  function Item(index: number | string): typeof entry;
  function GetComment(id: number | string): string;
  function SetComment(id: number | string, value: string): void;
  function FirstMark(): number;
  function NextMark(): number;
  function PrevMark(): number;
  function LastMark(): number;
  var AllEntry: typeof entry;
  var AllMark: typeof entry;
  var Attributes: PPxEntry.Attribute;
  var Comment: string;
  var Count: number;
  var DateCreated: Date;
  var DateLastAccessed: Date;
  var DateLastModified: Date;
  var ExtColor: number;
  var Hide: number;
  var Highlight: ZeroTo<7>;
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
  function Item(index: number | string): typeof pane;
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
  var IDName: string;
  var index: number;
  var IndexFrom: void;
  var Name: string;
  var Pane: number;
  var TotalCount: number;
  var TotalPPcCount: number;
  var Type: number;
}
