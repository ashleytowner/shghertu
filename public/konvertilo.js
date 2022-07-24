function convert() {
  const input = document.getElementById('konvertilo-input').value;
  const output = input
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
  document.getElementById('konvertilo-output').value = output;
}
