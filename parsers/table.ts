import {info} from '@ppmdev/modules/data.ts';

export type properties = {[subid: string]: {sep: ',' | '='; value: string[]}};
export const properties = (id: string): properties => {
  const rawProps = PPx.Extract(`%*getcust(${id})`).split(info.nlcode);
  const props: properties = {};
  const rgx = /^([^,=]+)([,=])\s*(.*)/;
  let subid = '';

  for (let i = 1, k = rawProps.length - 2; i < k; i++) {
    const match = rawProps[i].replace(rgx, (_, key, sep, value): string => {
      subid = key.replace(/[\s\uFEFF\xA0]+$/, '');
      props[subid] = {sep, value: [value]};

      return '';
    });

    if (match !== '') {
      props[subid].value.push(rawProps[i].replace(/^\s*/, ''));
    }
  }

  return props;
};
