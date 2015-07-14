'use strict';

document.addEventListener('DOMContentLoaded', function() {

  var lookup = document.querySelector('#search');
  var keyinput = lookup.querySelector('input[type="text"]');

  keyinput.addEventListener('keyup', function(e) {
    lookup.action = '/messages/' + keyinput.value;
  });

});
