function translate(input) {
  return input
    .replace(/c[xX]/g, 'ĉ')
    .replace(/g[xX]/g, 'ĝ')
    .replace(/h[xX]/g, 'ĥ')
    .replace(/j[xX]/g, 'ĵ')
    .replace(/s[xX]/g, 'ŝ')
    .replace(/u[xX]/g, 'ŭ')
    .replace(/C[xX]/g, 'Ĉ')
    .replace(/G[xX]/g, 'Ĝ')
    .replace(/H[xX]/g, 'Ĥ')
    .replace(/J[xX]/g, 'Ĵ')
    .replace(/S[xX]/g, 'Ŝ')
    .replace(/U[xX]/g, 'Ŭ');
}

function getInputSelection(el) {
  let start = 0; let end = 0; let normalizedValue; let range;
  let textInputRange; let len; let
    endRange;

  if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
    start = el.selectionStart;
    end = el.selectionEnd;
  } else {
    range = document.selection.createRange();

    /* eslint-disable-next-line */
    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, '\n');

      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
        /* eslint-disable-next-line */
        start = end = len;
      } else {
        start = -textInputRange.moveStart('character', -len);
        start += normalizedValue.slice(0, start).split('\n').length - 1;

        if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd('character', -len);
          end += normalizedValue.slice(0, end).split('\n').length - 1;
        }
      }
    }
  }

  return {
    start,
    end
  };
}

function offsetToRangeCharacterMove(el, offset) {
  return offset - (el.value.slice(0, offset).split('\r\n').length - 1);
}

function setInputSelection(el, startOffset, endOffset) {
  if (typeof el.selectionStart === 'number' && typeof el.selectionEnd === 'number') {
    /* eslint-disable-next-line */
    el.selectionStart = startOffset;
    /* eslint-disable-next-line */
    el.selectionEnd = endOffset;
  } else {
    const range = el.createTextRange();
    const startCharMove = offsetToRangeCharacterMove(el, startOffset);
    range.collapse(true);
    /* eslint-disable-next-line */
    if (startOffset == endOffset) {
      range.move('character', startCharMove);
    } else {
      range.moveEnd('character', offsetToRangeCharacterMove(el, endOffset));
      range.moveStart('character', startCharMove);
    }
    range.select();
  }
}

document.getElementById('konvertilo-input').onkeyup = (ev) => {
  const el = ev.target;
  const sel = getInputSelection(el);
  const input = el.value;
  const translation = translate(input);
  if (translation !== input) {
    sel.start += (translation.length - input.length);
    sel.end += (translation.length - input.length);
  }
  el.value = translate(input);
  setInputSelection(el, sel.start, sel.end);
};
