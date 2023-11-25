# ppmdev

ppx-plugin-manager のプラグイン開発環境です。npm-workspace 上で動作します。

## 動作環境

- nodejs >= 18.17.0

### 仕様

- 開発言語は TypeScript です。ソースコードを、Babel で ES3 相当にトランスパイルし、
  Rollup でバンドルします。
- テストには Jest を採用しています。
- 型情報は、windows-script-host, activex-scripting, activex-adodb, PPx-script,
  Jest を参照できます。
