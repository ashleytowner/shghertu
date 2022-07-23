function wait(ms) {
  return new Promise((res) => {
    setTimeout(res, ms);
  })
}

class Typer {
  /** @type {HTMLElement} */
  element;

  /**
  * @param {string} elementId the ID of the element
  */
  constructor(elementId) {
    this.element = document.getElementById(elementId);
  }

  /**
   * @param {string[]} letterArr
   * @param {number} delay
   */
  async typeString(letterArr, delay) {
    while(letterArr.length > 0) {
      this.append(letterArr.shift());
      await wait(delay);
    }
  }

  /**
   * @param {number} delay
   */
  async clearText(delay) {
    while (this.text.length > 0) {
      this.backspace();
      await wait(delay);
    }
  }

  backspace() {
    this.text = this.text
      .split('')
      .filter((_, i, a) => {
        return i !== a.length - 1;
      })
      .join('');
  }

  append(letter) {
    this.text = this.text + letter;
  }

  get text() {
    return this.element.innerHTML;
  }

  /**
   * @param {string} val
   */
  set text(val) {
    this.element.innerHTML = val;
  }
};

const steps = [
  's',
  'sx',
  'ŝ',
  'ŝg',
  'ŝgx',
  'ŝĝ',
  'ŝĝe',
  'ŝĝer',
  'ŝĝert',
  'ŝĝertu',
  'ŝĝertux',
  'ŝĝertŭ',
];

const typer = new Typer('keyboardname');
let currentlyTyping = false;

async function runTyping(delay = 300) {
  if (currentlyTyping) return;
  currentlyTyping = true;
  await typer.clearText(delay);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    typer.text = step;
    await wait(delay);
  }
  currentlyTyping = false;
}

function ev() { runTyping() };

typer.element.onfocus = ev;

typer.element.onmouseover = ev;

setTimeout(runTyping, 5000);
