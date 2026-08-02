import {
  db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy
} from './firebase.js';
import { toast, confirmDialog, escapeHtml } from './ui.js';

var CATEGORY_ORDER = [
  "প্রতিষ্ঠাতা পরিচালক", "সভাপতি", "সিনিয়র সহ-সভাপতি", "সহ-সভাপতি", "সাধারণ সম্পাদক",
  "যুগ্ম সাধারণ সম্পাদক", "কোষাধ্যক্ষ", "প্রচার সম্পাদক", "সাংগঠনিক সম্পাদক", "দপ্তর সম্পাদক",
  "ক্রিয়া সম্পাদক", "সংস্কৃতি বিষয়ক সম্পাদক", "সমাজসেবা বিষয়ক সম্পাদক", "উপদেষ্টা", "সাধারণ সদস্য"
];

var STATE = { all: [], search: '', unsub: null };

export function renderTeam(root) {
  root.innerHTML =
    '<div class="panel">' +
      '<div class="panel-toolbar">' +
        '<div class="toolbar-left">' +
          '<div class="search-box"><i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="text" id="teamSearch" placeholder="নাম বা পদবি দিয়ে খুঁজুন...">' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-primary btn-sm" id="addTeamBtn"><i class="fa-solid fa-plus"></i> নতুন সদস্য যোগ করুন</button>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>সদস্য</th><th>পদবি</th><th>বিভাগ</th><th>স্ট্যাটাস</th><th></th></tr></thead>' +
          '<tbody id="teamRows"><tr class="loading-row"><td colspan="5"><i class="fa-solid fa-spinner spin"></i> লোড হচ্ছে...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '<div class="overlay" id="teamDrawerOverlay"><div class="drawer" id="teamDrawer"></div></div>';

  document.getElementById('teamSearch').addEventListener('input', function (e) {
    STATE.search = e.target.value.toLowerCase().trim();
    renderTable();
  });
  document.getElementById('addTeamBtn').addEventListener('click', function () { openDrawer(null); });
  document.getElementById('teamDrawerOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'teamDrawerOverlay') closeDrawer();
  });

  if (STATE.unsub) STATE.unsub();
  var q = query(collection(db, 'team_members'), orderBy('id', 'asc'));
  STATE.unsub = onSnapshot(q, function (snap) {
    STATE.all = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
    renderTable();
  }, function (err) {
    console.error(err);
    document.getElementById('teamRows').innerHTML = '<tr class="loading-row"><td colspan="5">ডাটা লোড করা যায়নি।</td></tr>';
  });
}

function renderTable() {
  var rows = STATE.all.filter(function (m) {
    if (!STATE.search) return true;
    return (m.name || '').toLowerCase().indexOf(STATE.search) !== -1 || (m.role || '').toLowerCase().indexOf(STATE.search) !== -1;
  });
  var tbody = document.getElementById('teamRows');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="5"><i class="fa-solid fa-users-slash"></i><br>কোনো সদস্য পাওয়া যায়নি — "নতুন সদস্য যোগ করুন" চেপে শুরু করুন</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (m) {
    var isActive = m.status === 'active';
    return (
      '<tr class="row-clickable" data-id="' + m._id + '">' +
        '<td><div class="avatar-cell"><img src="' + escapeHtml(m.image || '') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
        '<div class="name-cell"><strong>' + escapeHtml(m.name || '—') + '</strong></div></div></td>' +
        '<td>' + escapeHtml(m.role || '—') + '</td>' +
        '<td>' + escapeHtml(m.category || '—') + '</td>' +
        '<td><span class="badge ' + (isActive ? 'badge-approved' : 'badge-neutral') + '">' + (isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়') + '</span></td>' +
        '<td><div class="row-actions"><button class="icon-btn danger" data-del="' + m._id + '"><i class="fa-solid fa-trash"></i></button></div></td>' +
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
      var m = STATE.all.filter(function (x) { return x._id === btn.dataset.del; })[0];
      confirmDialog('সদস্য ডিলিট করবেন?', (m ? m.name : 'এই সদস্য') + ' — সাইট থেকে সরাসরি মুছে যাবে।').then(function (ok) {
        if (!ok) return;
        deleteDoc(doc(db, 'team_members', btn.dataset.del)).then(function () {
          toast('ডিলিট করা হয়েছে', 'success');
        }).catch(function (err) { console.error(err); toast('ডিলিট করা যায়নি', 'error'); });
      });
    });
  });
}

function openDrawer(id) {
  var m = id ? STATE.all.filter(function (x) { return x._id === id; })[0] : {};
  var overlay = document.getElementById('teamDrawerOverlay');
  var drawer = document.getElementById('teamDrawer');

  drawer.innerHTML =
    '<div class="drawer-head"><h3>' + (id ? 'সদস্য এডিট করুন' : 'নতুন সদস্য') + '</h3><button class="drawer-close" id="closeTeamDrawer"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<div class="drawer-body">' +
      '<div class="photo-preview-row">' +
        '<img id="teamPhotoPreview" src="' + escapeHtml(m.image || '/icons/avatar.webp') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
        '<div class="form-group" style="flex:1;"><label>ছবির লিংক (image)</label><input type="url" id="t_image" value="' + escapeHtml(m.image || '') + '"></div>' +
      '</div>' +
      '<div class="form-grid">' +
        '<div class="form-group full"><label>নাম</label><input type="text" id="t_name" value="' + escapeHtml(m.name || '') + '"></div>' +
        '<div class="form-group"><label>পদবি (role)</label><input type="text" id="t_role" value="' + escapeHtml(m.role || '') + '"></div>' +
        '<div class="form-group"><label>বিভাগ (category)</label><select id="t_category">' +
          CATEGORY_ORDER.map(function (c) { return '<option value="' + c + '"' + (c === m.category ? ' selected' : '') + '>' + c + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="form-group"><label>স্ট্যাটাস</label><select id="t_status">' +
          '<option value="active"' + (m.status === 'active' ? ' selected' : '') + '>সক্রিয়</option>' +
          '<option value="inactive"' + (m.status !== 'active' ? ' selected' : '') + '>নিষ্ক্রিয়</option>' +
        '</select></div>' +
        '<div class="form-group"><label>মেম্বার আইডি (ঐচ্ছিক)</label><input type="text" id="t_memberid" value="' + escapeHtml(m.memberid || '') + '"></div>' +
        '<div class="form-group full"><label>বিবরণ</label><textarea id="t_desc">' + escapeHtml(m.desc || '') + '</textarea></div>' +
        '<div class="form-group"><label>প্রোফাইল লিংক (profileUrl)</label><input type="text" id="t_profileUrl" value="' + escapeHtml(m.profileUrl || '') + '"></div>' +
        '<div class="form-group"><label>ফেসবুক</label><input type="text" id="t_facebook" value="' + escapeHtml(m.facebook || '') + '"></div>' +
        '<div class="form-group full"><label>হোয়াটসঅ্যাপ</label><input type="text" id="t_whatsapp" value="' + escapeHtml(m.whatsapp || '') + '"></div>' +
      '</div>' +
    '</div>' +
    '<div class="drawer-foot">' +
      '<button class="btn btn-ghost" id="cancelTeamBtn" style="flex:1;">বাতিল</button>' +
      '<button class="btn btn-primary" id="saveTeamBtn" style="flex:2;"><i class="fa-solid fa-floppy-disk"></i> সংরক্ষণ করুন</button>' +
    '</div>';

  overlay.classList.add('show');
  document.getElementById('closeTeamDrawer').addEventListener('click', closeDrawer);
  document.getElementById('cancelTeamBtn').addEventListener('click', closeDrawer);
  document.getElementById('t_image').addEventListener('input', function (e) {
    document.getElementById('teamPhotoPreview').src = e.target.value || '/icons/avatar.webp';
  });
  document.getElementById('saveTeamBtn').addEventListener('click', function () { saveTeam(id, m); });
}

function closeDrawer() { document.getElementById('teamDrawerOverlay').classList.remove('show'); }

function saveTeam(id, existing) {
  var payload = {
    name: document.getElementById('t_name').value.trim(),
    role: document.getElementById('t_role').value.trim(),
    category: document.getElementById('t_category').value,
    status: document.getElementById('t_status').value,
    image: document.getElementById('t_image').value.trim(),
    desc: document.getElementById('t_desc').value.trim(),
    memberid: document.getElementById('t_memberid').value.trim(),
    profileUrl: document.getElementById('t_profileUrl').value.trim(),
    facebook: document.getElementById('t_facebook').value.trim(),
    whatsapp: document.getElementById('t_whatsapp').value.trim()
  };

  if (!payload.name) { toast('নাম আবশ্যক', 'error'); return; }

  var saveBtn = document.getElementById('saveTeamBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> সংরক্ষণ হচ্ছে...';

  var promise;
  if (id) {
    promise = updateDoc(doc(db, 'team_members', id), payload);
  } else {
    payload.id = (STATE.all.reduce(function (max, m) { return Math.max(max, m.id || 0); }, 0)) + 1;
    promise = addDoc(collection(db, 'team_members'), payload);
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
