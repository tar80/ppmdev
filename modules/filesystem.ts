import type {Error_String} from '@ppmdev/modules/types.ts';

const fso = PPx.CreateObject('Scripting.FileSystemObject');

/**
 * Wrapper fso.createTextFile.
 * @param path - Path of file to create
 * @param overwrite - [default:true] Overwrite if already exists
 * @param unicode - [default:false] Create file with utf16le encoding
 * @return `boolean` Whether the file was created
 */
export const createTextFile = (path: string, overwrite = true, unicode = false): Error_String => {
  let [error, errormsg] = [false, ''];
  let st: Scripting.TextStream | undefined;

  try {
    st = fso.CreateTextFile(path, overwrite, unicode);
  } catch (err: any) {
    [error, errormsg] = [true, err.message];
  } finally {
    st?.Close();
  }

  return [error, errormsg];
};

type CopyMethod = 'CopyFile' | 'CopyFolder';
const _create = (method: CopyMethod, src: string, dest: string, isDelete: boolean, pwd: string, ow = false): Error_String => {
  try {
    fso[method](src, dest, ow);
  } catch (e) {
    if (isDelete) {
      fso.DeleteFolder(pwd);
    }

    return [true, `Could not create ${dest}`];
  }

  return [false, ''];
};

/**
 * Wrapper fso.copyFile.
 * Also, if the parent directory does not exist,
 * it will be automatically created and deleted on error.
 * @param source - source file to copy
 * @param destination - copy file destination
 * @param overwrite - [default:false] Overwrite if already exists
 * @return [success or not, error-message]
 */
export const copyFile = (source: string, destination: string, overwrite?: boolean): Error_String => {
  let createDir = false;

  if (!fso.FileExists(source)) {
    return [true, `${source} is not exist`];
  }

  const destParent = fso.GetParentFolderName(destination);

  if (!fso.FolderExists(destParent)) {
    fso.CreateFolder(destParent);
    createDir = true;
  }

  return _create('CopyFile', source, destination, createDir, destParent, overwrite);
};

/**
 * Wrapper fso.copyFolder.
 * Also, if the parent directory does not exist,
 * it will be automatically created and deleted on error.
 * @param source - source directory to copy
 * @param destination - copy directory destination
 * @param overwrite - [default:false] Overwrite if already exists
 * @return [success or not, error-message]
 */
export const copyFolder = (source: string, destination: string, overwrite?: boolean): Error_String => {
  let createDir = false;

  if (!fso.FolderExists(source)) {
    return [true, `${source} is not exist`];
  }

  const destParent = fso.GetParentFolderName(destination);

  if (!fso.FolderExists(destParent)) {
    fso.CreateFolder(destParent);
    createDir = true;
  }

  return _create('CopyFolder', source, destination, createDir, destParent, overwrite);
};

export default fso;
