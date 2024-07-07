
  function closeAlert() {
    var alert = document.querySelector('.alert');
    if (alert) {
      alert.classList.remove('show');
      alert.classList.add('hide');
    }
  }

