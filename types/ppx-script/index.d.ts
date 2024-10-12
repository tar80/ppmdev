// Type definitions for PPx Script Module R21
// Definitions by: tar80 (https://github.com/tar80)

type HighlightNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type CommentNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

declare namespace PPx {
  enum FileAttribute {
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
    NoIndex = 8192,
    Encrypted = 16384
  }

  interface PPxEnum<T> {
    [Symbol.iterator](): Iterator<T>;
    Item<U extends this>(index?: string | number): PPxEnum<U>;
    moveNext(): IteratorResult<T>;
    atEnd(): boolean;
    Reset(): void;
  }

  interface PPxArguments<T> extends PPxEnum<PPxArguments<T>> {
    readonly length: number;
    readonly Count: number;
    readonly value: string;
  }

  interface PPxEnumerator extends Enumerator {
    <T = any>(collection: {Item(index: any): T}): Enumerator<T>;
  }

  interface PPxEntry<T> extends PPxEnum<PPxEntry<T>> {
    readonly Count: number;
    readonly length: number;
    Index: number;
    IndexFrom(filename: string): number;
    Mark: number;
    FirstMark(): number;
    NextMark(): number;
    PrevMark(): number;
    LastMark(): number;
    readonly Name: string;
    readonly ShortName: string;
    readonly Attributes: FileAttribute;
    readonly Size: number;
    readonly DateCreated: Date;
    readonly DateLastAccessed: Date;
    readonly DateLastModified: Date;
    State: number;
    ExtColor: number;
    Highlight: HighlightNumber;
    Comment: string;
    GetComment(id: CommentNumber | string): string;
    SetComment(id: CommentNumber | string, value: string): void;
    Information: string;
    readonly Hide: number;
    readonly AllEntry: PPxEntry<T>;
    readonly AllMark: PPxEntry<T>;
  }

  interface PPxPaneEnum<T> {
    [Symbol.iterator](): Iterator<T>;
    Item<U extends this>(index?: string | number): PPxPaneEnum<U>;
    //FIXME: its's probably incorrect
    Tab: PPxTab<string|number>
    moveNext(): IteratorResult<T>;
    atEnd(): boolean;
    Reset(): void;
  }

  interface PPxPane<T> extends PPxPaneEnum<PPxPane<T>> {
    readonly Count: number;
    readonly length: number;
    index: number;
    IndexFrom(IDName: string): number;
    GroupIndex: number;
    GroupName: string;
    readonly GroupCount: number;
    GroupList: string;
  }

  interface PPxTab<T>  {
    [Symbol.iterator](): Iterator<T>;
    Item<U extends this>(index?: T): PPxTab<U>;
    moveNext(): IteratorResult<T>;
    atEnd(): boolean;
    Reset(): void;
    readonly Count: number;
    readonly length: number;
    index: number;
    IndexFrom(IDName: string): number;
    readonly Pane: number;
    readonly IDName: string;
    readonly Name: string;
    Type: number;
    Lock: number;
    TotalCount: number;
    TotalPPcCount: number;
    BackColor: number;
    Color: number;
    Execute(param: string): number;
    Extract(param: string): string;
  }

  const Arguments: PPxArguments<string | number>;
  const Entry: PPxEntry<string | number>;
  const Pane: PPxPane<string | number>;
  const Tab: PPxTab<string | number>;
  const Enumerator: PPxEnumerator;
  function Argument(int: number): string;
  function CreateObject<K extends keyof ActiveXObjectNameMap = any>(strProgID: K, strPrefix?: string): ActiveXObjectNameMap[K];
  function ConnectObject(objEventSource: any, strPrefix: string): void;
  function DisconnectObject(object: any): void;
  function GetObject<K extends keyof ActiveXObjectNameMap>(strPathname: string, strProgID: K, strPrefix?: string): ActiveXObjectNameMap[K];
  function GetObject(pathname: string, progid: string): object;
  function Echo(...args: any[]): void;
  function Sleep(intTime: number): void;
  const Quit: typeof process.exit;
  const CodeType: number;
  const ModuleVersion: number;
  const PPxVersion: number;
  const ScriptName: string;
  const ScriptFullName: string;
  const ScriptEngineName: string;
  const ScriptEngineVersion: string;
  var result: any;
  const ReentryCount: number;
  var StayMode: number;
  function Execute(param: string): number;
  function Extract(param?: string): string;
  function SetPopLineMessage(message: any): void;
  function linemessage(message: any): void;
  function log(message: any): void;
  function report(message: any): void;
  function GetFileInformation(filename: string, mode?: number): string;
  var Clipboard: any;
  function setValue(key: string, value: string | number): void;
  function getValue(key: string): string;
  function setProcessValue(key: string, value: string | number): void;
  function getProcessValue(key: string): string;
  function setIValue(key: string, value: string | number): void;
  function getIValue(key: string): string;
  function Include(filename: string): void;
  var WindowIDName: string;
  const WindowDirection: number;
  const EntryDisplayTop: number;
  const EntryDisplayX: number;
  const EntryDisplayY: number;
  function GetComboItemCount(id?: number): number;
  const ComboIDName: string;
  var SlowMode: number;
  var SyncView: number;
  const DriveVolumeLabel: string;
  const DriveTotalSize: number;
  const DriveFreeSize: number;
  const DirectoryType: number;
  function LoadCount(type?: 0 | 1): number;
  const EntryAllCount: number;
  const EntryDisplayCount: number;
  const EntryMarkCount: number;
  const EntryMarkSize: number;
  const EntryDisplayDirectories: number;
  const EntryDisplayFiles: number;
  function EntryInsert(index: number, name: string): void;
  var EntryIndex: number;
  var EntryMark: number;
  const EntryName: string;
  const EntryAttributes: number;
  const EntrySize: number;
  var EntryState: number;
  var EntryExtColor: number;
  var EntryHighlight: HighlightNumber;
  var EntryComment: string;
  function EntryFirstMark(): number;
  function EntryNextMark(): number;
  function EntryPrevMark(): number;
  function EntryLastMark(): number;
  const PointType: number;
  const PointIndex: number;
}
