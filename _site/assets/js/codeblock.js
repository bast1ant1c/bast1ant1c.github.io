var codeBlocks = document.querySelectorAll('pre.highlight');

codeBlocks.forEach(function (codeBlock) {
  var Button = document.createElement('button');
  Button.className = 'copy-button';
  Button.type = 'button';
  Button.innerHTML = '<i class="fas fa-copy"></i> Copy code';

  var message = document.createElement('span');
  message.className = 'copied-message';

  message.style.display = 'none';

  var buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  buttonContainer.appendChild(Button);
  buttonContainer.appendChild(message);

  codeBlock.parentNode.insertBefore(buttonContainer, codeBlock);

  Button.addEventListener('click', function () {
    var code = codeBlock.querySelector('code').innerText.trim();
    window.navigator.clipboard.writeText(code);

    Button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    message.style.display = 'inline-block';

    setTimeout(function () {
      Button.innerHTML = '<i class="fas fa-copy"></i> Copy code';
      message.style.display = 'none';
    }, 2000);
  });
});

