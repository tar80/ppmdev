if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength: number, padString: string): string {
    targetLength = Math.floor(targetLength) || 0;

    if (targetLength < this.length) return String(this);

    padString = padString ? String(padString) : ' ';

    var pad = '';
    var len = targetLength - this.length;
    var i = 0;

    while (pad.length < len) {
      if (!padString[i]) {
        i = 0;
      }
      pad += padString[i];
      i++;
    }

    return pad + String(this).slice(0);
  };
}
