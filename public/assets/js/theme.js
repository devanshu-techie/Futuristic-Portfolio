// Runs before paint: applies the saved colour theme and marks JS as available.
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var t = localStorage.getItem('dg-theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    d.setAttribute('data-theme', t);
  } catch (e) { /* storage unavailable: keep dark */ }
})();
