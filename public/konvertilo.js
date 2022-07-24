function translate(input) {
  return input
    .replace(/cx/g, 'ĉ')
    .replace(/gx/g, 'ĝ')
    .replace(/hx/g, 'ĥ')
    .replace(/jx/g, 'ĵ')
    .replace(/sx/g, 'ŝ')
    .replace(/ux/g, 'ŭ')
    .replace(/Cx/g, 'Ĉ')
    .replace(/Gx/g, 'Ĝ')
    .replace(/Hx/g, 'Ĥ')
    .replace(/Jx/g, 'Ĵ')
    .replace(/Sx/g, 'Ŝ')
    .replace(/Ux/g, 'Ŭ');
}

function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

function offsetToRangeCharacterMove(el, offset) {
    return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}

function setInputSelection(el, startOffset, endOffset) {
    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        el.selectionStart = startOffset;
        el.selectionEnd = endOffset;
    } else {
        var range = el.createTextRange();
        var startCharMove = offsetToRangeCharacterMove(el, startOffset);
        range.collapse(true);
        if (startOffset == endOffset) {
            range.move("character", startCharMove);
        } else {
            range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
            range.moveStart("character", startCharMove);
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
    sel.start--;
    sel.end--;;
  }
  el.value = translate(input);
  setInputSelection(el, sel.start, sel.end);
}
