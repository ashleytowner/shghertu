function toggle() {
  const element = document.getElementsByTagName('html')[0];
  const showEn = element.getAttribute('data-en')
  if (showEn === 'true') {
    element.setAttribute('data-en', 'false');
  } else {
    element.setAttribute('data-en', 'true');
  }
}
