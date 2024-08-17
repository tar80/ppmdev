import type {ErrorLevel} from '@ppmdev/modules/types.ts';

export const createBackup = ({
  path,
  comment = false,
  sort = true,
  discover = false,
  mask
}: {
  path: string;
  comment?: boolean;
  sort?: boolean;
  discover?: boolean;
  mask?: string[];
}): ErrorLevel => {
  const p = ~path.indexOf('\\') ? path : PPx.Extract(`%sgu"ppmcache"\\backup\\${path}`);
  const c = !comment ? ' -nocomment' : '';
  const s = !sort ? ' -nosort' : '';
  const d = discover ? ' -discover' : '';
  const m = mask ? `-mask:"${mask.join(',')}"` : '';

  return PPx.Execute(`*cd %0%:%Osbd *ppcust CD ${p}${c}${s}${d}${m}%&`);
};
