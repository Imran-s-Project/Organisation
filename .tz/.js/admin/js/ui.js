/* এডমিন প্যানেলের জন্য কমন UI হেল্পার — toast, confirm dialog, ফরম্যাটিং, CSV এক্সপোর্ট */

export function toast(message, type) {
  var stack = document.getElementById('toastStack');
  if (!stack) return;
  var el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  var icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
  el.innerHTML = '<i class="fa-solid ' + icon + '"></i><span>' + escapeHtml(message) + '</span>';
  stack.appendChild(el);
  setTimeout(function () {
    el.style.opacity = '0';
    el.style.transition = 'opacity .25s';
    setTimeout(function () { el.remove(); }, 250);
  }, 3200);
}

export function confirmDialog(title, message) {
  return new Promise(function (resolve) {
    var box = document.getElementById('confirmBox');
    document.getElementById('confirmTitle').textContent = title || 'নিশ্চিত করুন';
    document.getElementById('confirmMsg').textContent = message || 'আপনি কি নিশ্চিত?';
    box.classList.add('show');

    var okBtn = document.getElementById('confirmOk');
    var cancelBtn = document.getElementById('confirmCancel');

    function cleanup(result) {
      box.classList.remove('show');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

export function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function fmtDate(ts) {
  if (!ts) return '—';
  var d = ts.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
}

export function downloadCSV(filename, rows) {
  if (!rows || !rows.length) { toast('এক্সপোর্ট করার মতো কোনো ডাটা নেই', 'error'); return; }
  var headers = Object.keys(rows[0]);
  var csv = [headers.join(',')].concat(
    rows.map(function (r) {
      return headers.map(function (h) {
        var v = r[h] === undefined || r[h] === null ? '' : String(r[h]);
        v = v.replace(/"/g, '""');
        return '"' + v + '"';
      }).join(',');
    })
  ).join('\n');

  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function copyText(text) {
  navigator.clipboard.writeText(text).then(function () {
    toast('কপি হয়েছে', 'success');
  }).catch(function () {
    toast('কপি করা যায়নি', 'error');
  });
}
