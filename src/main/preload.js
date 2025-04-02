// src/main/preload.js
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Это поможет нам увидеть, что скрипт загрузился
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type]);
    }
  });
