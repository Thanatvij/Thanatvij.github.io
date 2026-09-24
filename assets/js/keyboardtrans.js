/* keyboardTrans demo widget (personal-projects). Conversion logic lives in keyboardtrans-core.js. */
(() => {
  'use strict';
  const root = document.getElementById('kt');
  const KT = window.KeyboardTrans;
  if (!root || !KT) return;

  const input = root.querySelector('#kt-in');
  const output = root.querySelector('#kt-out');
  const mode = root.querySelector('#kt-mode');
  const status = root.querySelector('#kt-status');
  const live = root.querySelector('#kt-live');
  const copyBtn = root.querySelector('#kt-copy');
  let statusTimer = 0;

  const say = (message) => {
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = ''; }, 2600);
  };

  const convert = () => {
    const text = input.value;
    const result = KT.fix(text);
    output.textContent = result;
    output.classList.toggle('is-empty', !text.trim());
    mode.textContent = !text.trim() ? '' : KT.hasThai(text) ? 'Detected: Thai characters → English keys' : 'Detected: English keys → Thai';
    copyBtn.disabled = !text.trim();
    return result;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-secure contexts and older browsers
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (!ok) throw new Error('copy failed');
  };

  root.querySelector('#kt-convert').addEventListener('click', () => { convert(); say('แปลงแล้ว · Converted'); });
  input.addEventListener('input', () => { if (live.checked) convert(); });
  live.addEventListener('change', () => { if (live.checked) convert(); });
  copyBtn.addEventListener('click', async () => {
    const result = convert();
    try { await copyText(result); say('คัดลอกแล้ว · Copied to clipboard ✓'); }
    catch { say('คัดลอกไม่สำเร็จ — เลือกข้อความแล้วกด Ctrl/⌘+C · Copy failed, select the text and copy it manually'); }
  });
  root.querySelector('#kt-clear').addEventListener('click', () => { input.value = ''; convert(); input.focus(); });
  root.querySelectorAll('[data-example]').forEach((chip) => chip.addEventListener('click', () => {
    input.value = chip.dataset.example;
    convert();
    input.focus();
  }));
  convert();
})();
