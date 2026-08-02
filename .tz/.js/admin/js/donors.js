import {
  db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy
} from './firebase.js';
import { toast, confirmDialog, escapeHtml } from './ui.js';

var STATE = { all: [], search: '', unsub: null };
var RANK_LABEL = { gold: 'গোল্ড', silver: 'সিলভার', heart: 'হার্ট' };

export function renderDonors(root) {
  root.innerHTML =
    '<div class="panel">' +
      '<div class="panel-toolbar">' +
        '<div class="toolbar-left">' +
          '<div class="search-box"><i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="text" id="donorSearch" placeholder="নাম দিয়ে খুঁজুন...">' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" id="addDonorBtn"><i class="fa-solid fa-plus"></i> নতুন দাতা যোগ করুন</button>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>দাতা</th><th>পদবি</th><th>র‍্যাংক</th><th>সদস্যকাল</th><th></th></tr></thead>' +
          '<tbody id="donorRows"><tr class="loading-row"><td colspan="5"><i class="fa-solid fa-spinner spin"></i> লোড হচ্ছে...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '<div class="overlay" id="donorDrawerOverlay"><div class="drawer" id="donorDrawer"></div></div>';

  document.getElementById('donorSearch').addEventListener('input', function (e) {
    STATE.search = e.target.value.toLowerCase().trim();
    renderTable();
  });
  document.getElementById('addDonorBtn').addEventListener('click', function () { openDrawer(null); });
  document.getElementById('donorDrawerOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'donorDrawerOverlay') closeDrawer();
  });

  if (STATE.unsub) STATE.unsub();
  var q = query(collection(db, 'donors'), orderBy('id', 'asc'));
  STATE.unsub = onSnapshot(q, function (snap) {
    STATE.all = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
    renderTable();
  }, function (err) {
    console.error(err);
    document.getElementById('donorRows').innerHTML = '<tr class="loading-row"><td colspan="5">ডাটা লোড করা যায়নি।</td></tr>';
  });
}

function renderTable() {
  var rows = STATE.all.filter(function (d) {
    if (!STATE.search) return true;
    return (d.name || '').toLowerCase().indexOf(STATE.search) !== -1;
  });
  var tbody = document.getElementById('donorRows');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="5"><i class="fa-solid fa-hand-holding-heart"></i><br>কোনো দাতা পাওয়া যায়নি — "নতুন দাতা যোগ করুন" চেপে শুরু করুন</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (d) {
    return (
      '<tr class="row-clickable" data-id="' + d._id + '">' +
        '<td><div class="avatar-cell"><img src="' + escapeHtml(d.image || '') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
        '<div class="name-cell"><strong>' + escapeHtml(d.name || '—') + '</strong></div></div></td>' +
        '<td>' + escapeHtml(d.title || '—') + '</td>' +
        '<td><span class="badge badge-neutral">' + (RANK_LABEL[d.rank] || d.rank || '—') + '</span></td>' +
        '<td>' + escapeHtml(d.since || '—') + '</td>' +
        '<td><div class="row-actions"><button class="icon-btn danger" data-del="' + d._id + '"><i class="fa-solid fa-trash"></i></button></div></td>' +
      '</tr>'
    );
  }).join('');

  tbody.querySelectorAll('tr[data-id]').forEach(function (tr) {
    tr.addEventListener('click', function (e) {
      if (e.target.closest('[data-del]')) return;
      openDrawer(tr.dataset.id);
    });
  });
  tbody.querySelectorAll('[data-del]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var d = STATE.all.filter(function (x) { return x._id === btn.dataset.del; })[0];
      confirmDialog('দাতা ডিলিট করবেন?', (d ? d.name : 'এই দাতা') + ' — সাইট থেকে সরাসরি মুছে যাবে।').then(function (ok) {
        if (!ok) return;
        deleteDoc(doc(db, 'donors', btn.dataset.del)).then(function () {
          toast('ডিলিট করা হয়েছে', 'success');
        }).catch(function (err) { console.error(err); toast('ডিলিট করা যায়নি', 'error'); });
      });
    });
  });
}

function openDrawer(id) {
  var d = id ? STATE.all.filter(function (x) { return x._id === id; })[0] : {};
  var overlay = document.getElementById('donorDrawerOverlay');
  var drawer = document.getElementById('donorDrawer');

  drawer.innerHTML =
    '<div class="drawer-head"><h3>' + (id ? 'দাতা এডিট করুন' : 'নতুন দাতা') + '</h3><button class="drawer-close" id="closeDonorDrawer"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<div class="drawer-body">' +
      '<div class="photo-preview-row">' +
        '<img id="donorPhotoPreview" src="' + escapeHtml(d.image || '/icons/avatar.webp') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
        '<div class="form-group" style="flex:1;"><label>ছবির লিংক (image)</label><input type="url" id="d_image" value="' + escapeHtml(d.image || '') + '"></div>' +
      '</div>' +
      '<div class="form-grid">' +
        '<div class="form-group full"><label>নাম</label><input type="text" id="d_name" value="' + escapeHtml(d.name || '') + '"></div>' +
        '<div class="form-group"><label>পদবি (title)</label><input type="text" id="d_title" value="' + escapeHtml(d.title || '') + '"></div>' +
        '<div class="form-group"><label>র‍্যাংক ব্যাজ</label><select id="d_rank">' +
          '<option value="gold"' + (d.rank === 'gold' ? ' selected' : '') + '>গোল্ড (crown)</option>' +
          '<option value="silver"' + (d.rank === 'silver' ? ' selected' : '') + '>সিলভার (medal)</option>' +
          '<option value="heart"' + (!d.rank || d.rank === 'heart' ? ' selected' : '') + '>হার্ট</option>' +
        '</select></div>' +
        '<div class="form-group"><label>সদস্যকাল (since)</label><input type="text" id="d_since" value="' + escapeHtml(d.since || '') + '" placeholder="যেমনঃ ০৭ মাস"></div>' +
        '<div class="form-group full"><label>অবদান (contribution)</label><input type="text" id="d_contribution" value="' + escapeHtml(d.contribution || '') + '"></div>' +
      '</div>' +
    '</div>' +
    '<div class="drawer-foot">' +
      '<button class="btn btn-ghost" id="cancelDonorBtn" style="flex:1;">বাতিল</button>' +
      '<button class="btn btn-primary" id="saveDonorBtn" style="flex:2;"><i class="fa-solid fa-floppy-disk"></i> সংরক্ষণ করুন</button>' +
    '</div>';

  overlay.classList.add('show');
  document.getElementById('closeDonorDrawer').addEventListener('click', closeDrawer);
  document.getElementById('cancelDonorBtn').addEventListener('click', closeDrawer);
  document.getElementById('d_image').addEventListener('input', function (e) {
    document.getElementById('donorPhotoPreview').src = e.target.value || '/icons/avatar.webp';
  });
  document.getElementById('saveDonorBtn').addEventListener('click', function () { saveDonor(id); });
}

function closeDrawer() { document.getElementById('donorDrawerOverlay').classList.remove('show'); }

function saveDonor(id) {
  var payload = {
    name: document.getElementById('d_name').value.trim(),
    title: document.getElementById('d_title').value.trim(),
    rank: document.getElementById('d_rank').value,
    image: document.getElementById('d_image').value.trim(),
    since: document.getElementById('d_since').value.trim(),
    contribution: document.getElementById('d_contribution').value.trim()
  };

  if (!payload.name) { toast('নাম আবশ্যক', 'error'); return; }

  var saveBtn = document.getElementById('saveDonorBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> সংরক্ষণ হচ্ছে...';

  var promise;
  if (id) {
    promise = updateDoc(doc(db, 'donors', id), payload);
  } else {
    payload.id = (STATE.all.reduce(function (max, d) { return Math.max(max, d.id || 0); }, 0)) + 1;
    promise = addDoc(collection(db, 'donors'), payload);
  }

  promise.then(function () {
    toast('সংরক্ষণ করা হয়েছে', 'success');
    closeDrawer();
  }).catch(function (err) {
    console.error(err);
    toast('সংরক্ষণ করা যায়নি', 'error');
  }).finally(function () {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> সংরক্ষণ করুন';
  });
}
