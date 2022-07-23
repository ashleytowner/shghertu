const spoilerLang = new URLSearchParams(document.location.search).get('spoiler');
if (spoilerLang) {
  document.getElementsByTagName('html')[0].setAttribute('data-spoiler', spoilerLang);
}

const spoilers = document.getElementsByClassName('spoiler');
for (let i = 0; i < spoilers.length; i++) {
  spoilers[i].setAttribute('tabindex', '0');
}
