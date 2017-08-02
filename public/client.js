// client-side js
// run by the browser each time view template is loaded

(function() {
  console.log('client.js loaded');
  
  document.getElementById('url-form').onsubmit = function(event) {
    event.preventDefault();
    
    var input = event.target.input,
        original_url = input.value;
    
    fetch('/new/' + original_url).then(function(response) {
      return response.json();
    }).then(function(json) {
      var li = document.createElement('li');

      li.innerText = (JSON.stringify(json))
      input.value = '';
           
      input.focus();
      document.getElementById('output').appendChild(li);
    });
  }
}());
