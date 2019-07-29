function SourceSection(startLine, startColumn, charIndex, length) {
  this.startLine   = function () { return startLine;   };
  this.startColumn = function () { return startColumn; };
  this.charIndex   = function () { return charIndex;   };
  this.length      = function () { return length;      };
}

exports.SourceSection = SourceSection;
