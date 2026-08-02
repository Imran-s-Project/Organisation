import {
  db, collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp
} from './firebase.js';
import { toast, confirmDialog, escapeHtml, fmtDate, downloadCSV, copyText } from './ui.js';

var STATE = { all: [], search: '', statusFilter: 'all', typeFilter: 'all', unsub: null };

var STATUS_LABEL = { pending: 'পেন্ডিং', approved: 'অনুমোদিত', blocked: 'ব্লকড' };
var STATUS_BADGE = { pending: 'badge-pending', approved: 'badge-approved', blocked: 'badge-blocked' };

var MEMBERSHIP_TYPES = ["সাধারণ সদস্য", "আজীবন সদস্য", "সম্মানিত সদস্য", "স্বেচ্ছাসেবক"];

export function renderMembers(root) {
  root.innerHTML =
    '<div class="stat-grid" id="memberStats"></div>' +
    '<div class="panel">' +
      '<div class="panel-toolbar">' +
        '<div class="toolbar-left">' +
          '<div class="search-box"><i class="fa-solid fa-magnifying-glass"></i>' +
            '<input type="text" id="memberSearch" placeholder="নাম, আইডি, মোবাইল বা ইমেইল দিয়ে খুঁজুন...">' +
          '</div>' +
          '<select class="filter-select" id="statusFilter">' +
            '<option value="all">সব স্ট্যাটাস</option>' +
            '<option value="pending">পেন্ডিং</option>' +
            '<option value="approved">অনুমোদিত</option>' +
            '<option value="blocked">ব্লকড</option>' +
          '</select>' +
          '<select class="filter-select" id="typeFilter">' +
            '<option value="all">সব সদস্যপদ</option>' +
            MEMBERSHIP_TYPES.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('') +
          '</select>' +
        '</div>' +
        '<button class="btn btn-ghost btn-sm" id="exportBtn"><i class="fa-solid fa-file-arrow-down"></i> CSV এক্সপোর্ট</button>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr>' +
            '<th>আবেদনকারী</th><th>মেম্বার আইডি</th><th>মোবাইল</th><th>সদস্যপদ</th><th>স্ট্যাটাস</th><th>জমা দেওয়ার সময়</th><th></th>' +
          '</tr></thead>' +
          '<tbody id="memberRows"><tr class="loading-row"><td colspan="7"><i class="fa-solid fa-spinner spin"></i> লোড হচ্ছে...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>' +
    '<div class="overlay" id="memberDrawerOverlay"><div class="drawer" id="memberDrawer"></div></div>';

  document.getElementById('memberSearch').addEventListener('input', function (e) {
    STATE.search = e.target.value.toLowerCase().trim();
    renderTable();
  });
  document.getElementById('statusFilter').addEventListener('change', function (e) {
    STATE.statusFilter = e.target.value;
    renderTable();
  });
  document.getElementById('typeFilter').addEventListener('change', function (e) {
    STATE.typeFilter = e.target.value;
    renderTable();
  });
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('memberDrawerOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'memberDrawerOverlay') closeDrawer();
  });

  if (STATE.unsub) STATE.unsub();
  var q = query(collection(db, 'members'), orderBy('submittedAt', 'desc'));
  STATE.unsub = onSnapshot(q, function (snap) {
    STATE.all = snap.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
    renderStats();
    renderTable();
  }, function (err) {
    console.error(err);
    document.getElementById('memberRows').innerHTML =
      '<tr class="loading-row"><td colspan="7">ডাটা লোড করা যায়নি। কনসোল চেক করুন।</td></tr>';
  });
}

function renderStats() {
  var total = STATE.all.length;
  var pending = STATE.all.filter(function (m) { return (m.status || 'pending') === 'pending'; }).length;
  var approved = STATE.all.filter(function (m) { return m.status === 'approved'; }).length;
  var blocked = STATE.all.filter(function (m) { return m.status === 'blocked'; }).length;

  document.getElementById('memberStats').innerHTML =
    statCard('মোট আবেদন', total, '') +
    statCard('পেন্ডিং', pending, 'accent-clay') +
    statCard('অনুমোদিত', approved, 'accent-moss') +
    statCard('ব্লকড', blocked, 'accent-danger');
}

function statCard(label, num, accent) {
  return '<div class="stat-card ' + accent + '"><div class="num">' + num + '</div><div class="label">' + label + '</div></div>';
}

function getFiltered() {
  return STATE.all.filter(function (m) {
    var matchesSearch = !STATE.search ||
      (m.full_name || '').toLowerCase().indexOf(STATE.search) !== -1 ||
      (m.member_id || '').toLowerCase().indexOf(STATE.search) !== -1 ||
      (m.mobile_number || '').toLowerCase().indexOf(STATE.search) !== -1 ||
      (m.email || '').toLowerCase().indexOf(STATE.search) !== -1;
    var matchesStatus = STATE.statusFilter === 'all' || (m.status || 'pending') === STATE.statusFilter;
    var matchesType = STATE.typeFilter === 'all' || m.membership_type === STATE.typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
}

function renderTable() {
  var rows = getFiltered();
  var tbody = document.getElementById('memberRows');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr class="loading-row"><td colspan="7"><i class="fa-solid fa-inbox"></i><br>কোনো আবেদন পাওয়া যায়নি</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function (m) {
    var status = m.status || 'pending';
    return (
      '<tr class="row-clickable" data-id="' + m._id + '">' +
        '<td><div class="avatar-cell">' +
          '<img src="' + escapeHtml(m.photo_url || '/icons/avatar.webp') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
          '<div class="name-cell"><strong>' + escapeHtml(m.full_name || '—') + '</strong><span>' + escapeHtml(m.email || '') + '</span></div>' +
        '</div></td>' +
        '<td>' + escapeHtml(m.member_id || '—') + '</td>' +
        '<td>' + escapeHtml(m.mobile_number || '—') + '</td>' +
        '<td>' + escapeHtml(m.membership_type || '—') + '</td>' +
        '<td><span class="badge ' + STATUS_BADGE[status] + '">' + STATUS_LABEL[status] + '</span></td>' +
        '<td>' + fmtDate(m.submittedAt) + '</td>' +
        '<td><div class="row-actions">' +
          '<button class="icon-btn danger" data-del="' + m._id + '" title="ডিলিট করুন"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td>' +
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
      handleDelete(btn.dataset.del);
    });
  });
}

function handleDelete(id) {
  var m = STATE.all.filter(function (x) { return x._id === id; })[0];
  confirmDialog('আবেদন ডিলিট করবেন?', (m ? m.full_name : 'এই আবেদন') + ' — এই কাজটি ফিরিয়ে নেওয়া যাবে না।').then(function (ok) {
    if (!ok) return;
    deleteDoc(doc(db, 'members', id)).then(function () {
      toast('ডিলিট করা হয়েছে', 'success');
    }).catch(function (err) {
      console.error(err);
      toast('ডিলিট করা যায়নি', 'error');
    });
  });
}

function openDrawer(id) {
  var m = STATE.all.filter(function (x) { return x._id === id; })[0];
  if (!m) return;
  var overlay = document.getElementById('memberDrawerOverlay');
  var drawer = document.getElementById('memberDrawer');
  var status = m.status || 'pending';
  var verifyLink = window.location.origin + '/verify.html?id=' + (m.member_id || '');

  drawer.innerHTML =
    '<div class="drawer-head"><h3>আবেদনের বিস্তারিত</h3><button class="drawer-close" id="closeDrawerBtn"><i class="fa-solid fa-xmark"></i></button></div>' +
    '<div class="drawer-body">' +

      '<div class="photo-preview-row">' +
        '<img id="photoPreview" src="' + escapeHtml(m.photo_url || '/icons/avatar.webp') + '" onerror="this.src=\'/icons/avatar.webp\'">' +
        '<div style="flex:1;">' +
          '<div class="form-group"><label>প্রোফাইল ছবির লিংক (photo_url)</label>' +
            '<input type="url" id="f_photo_url" value="' + escapeHtml(m.photo_url || '') + '" placeholder="https://...">' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="form-group full" style="margin-bottom:16px;">' +
        '<label>ভেরিফিকেশন লিংক</label>' +
        '<div class="link-copy"><input type="text" readonly value="' + escapeHtml(verifyLink) + '" id="verifyLinkInput"><button class="icon-btn" id="copyLinkBtn"><i class="fa-solid fa-copy"></i></button></div>' +
      '</div>' +

      '<div class="form-section-title">স্ট্যাটাস</div>' +
      '<div class="form-grid">' +
        '<div class="form-group full"><label>আবেদনের স্ট্যাটাস</label>' +
          '<select id="f_status">' +
            '<option value="pending"' + (status === 'pending' ? ' selected' : '') + '>পেন্ডিং</option>' +
            '<option value="approved"' + (status === 'approved' ? ' selected' : '') + '>অনুমোদিত</option>' +
            '<option value="blocked"' + (status === 'blocked' ? ' selected' : '') + '>ব্লকড (verify.html-এ দেখাবে না)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<div class="form-section-title">ব্যক্তিগত তথ্য</div>' +
      '<div class="form-grid">' +
        field('member_id', 'মেম্বার আইডি', m.member_id) +
        field('full_name', 'পুরো নাম', m.full_name) +
        field('father_name', 'পিতার নাম', m.father_name) +
        field('mother_name', 'মাতার নাম', m.mother_name) +
        field('date_of_birth', 'জন্ম তারিখ', m.date_of_birth, 'date') +
        selectField('gender', 'লিঙ্গ', m.gender, ['পুরুষ', 'মহিলা', 'অন্যান্য']) +
        selectField('blood_group', 'রক্তের গ্রুপ', m.blood_group, ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) +
      '</div>' +

      '<div class="form-section-title">যোগাযোগ</div>' +
      '<div class="form-grid">' +
        field('mobile_number', 'মোবাইল নম্বর', m.mobile_number) +
        field('email', 'ইমেইল', m.email, 'email') +
      '</div>' +

      '<div class="form-section-title">ঠিকানা</div>' +
      '<div class="form-grid">' +
        textareaField('present_address', 'বর্তমান ঠিকানা', m.present_address) +
        textareaField('permanent_address', 'স্থায়ী ঠিকানা', m.permanent_address) +
      '</div>' +

      '<div class="form-section-title">শিক্ষা, পেশা ও সদস্যপদ</div>' +
      '<div class="form-grid">' +
        field('education', 'শিক্ষাগত যোগ্যতা', m.education) +
        field('occupation', 'পেশা', m.occupation) +
        selectField('membership_type', 'সদস্যপদের ধরন', m.membership_type, MEMBERSHIP_TYPES) +
        field('reference_name', 'রেফারেন্স', m.reference_name) +
        field('reference_mobile', 'রেফারেন্সের মোবাইল', m.reference_mobile) +
      '</div>' +

    '</div>' +
    '<div class="drawer-foot">' +
      '<button class="btn btn-ghost" id="cancelEditBtn" style="flex:1;">বাতিল</button>' +
      '<button class="btn btn-primary" id="saveEditBtn" style="flex:2;"><i class="fa-solid fa-floppy-disk"></i> সংরক্ষণ করুন</button>' +
    '</div>';

  overlay.classList.add('show');

  document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
  document.getElementById('cancelEditBtn').addEventListener('click', closeDrawer);
  document.getElementById('copyLinkBtn').addEventListener('click', function () { copyText(verifyLink); });
  document.getElementById('f_photo_url').addEventListener('input', function (e) {
    document.getElementById('photoPreview').src = e.target.value || '/icons/avatar.webp';
  });
  document.getElementById('saveEditBtn').addEventListener('click', function () { saveMember(id); });
}

function field(name, label, value, type) {
  return '<div class="form-group"><label>' + label + '</label><input type="' + (type || 'text') + '" id="f_' + name + '" value="' + escapeHtml(value || '') + '"></div>';
}
function textareaField(name, label, value) {
  return '<div class="form-group full"><label>' + label + '</label><textarea id="f_' + name + '">' + escapeHtml(value || '') + '</textarea></div>';
}
function selectField(name, label, value, options) {
  var opts = options.map(function (o) { return '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>'; }).join('');
  return '<div class="form-group"><label>' + label + '</label><select id="f_' + name + '"><option value="">—</option>' + opts + '</select></div>';
}

function closeDrawer() {
  document.getElementById('memberDrawerOverlay').classList.remove('show');
}

var EDITABLE_FIELDS = [
  'member_id', 'full_name', 'father_name', 'mother_name', 'date_of_birth', 'gender', 'blood_group',
  'mobile_number', 'email', 'present_address', 'permanent_address', 'education', 'occupation',
  'membership_type', 'reference_name', 'reference_mobile', 'photo_url', 'status'
];

function saveMember(id) {
  var payload = {};
  EDITABLE_FIELDS.forEach(function (name) {
    var el = document.getElementById('f_' + name);
    if (el) payload[name] = el.value.trim();
  });
  payload.updatedAt = serverTimestamp();

  var saveBtn = document.getElementById('saveEditBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> সংরক্ষণ হচ্ছে...';

  updateDoc(doc(db, 'members', id), payload).then(function () {
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

function exportCSV() {
  var rows = getFiltered().map(function (m) {
    return {
      member_id: m.member_id || '', full_name: m.full_name || '', father_name: m.father_name || '',
      mother_name: m.mother_name || '', date_of_birth: m.date_of_birth || '', gender: m.gender || '',
      blood_group: m.blood_group || '', mobile_number: m.mobile_number || '', email: m.email || '',
      present_address: m.present_address || '', permanent_address: m.permanent_address || '',
      education: m.education || '', occupation: m.occupation || '', membership_type: m.membership_type || '',
      reference_name: m.reference_name || '', reference_mobile: m.reference_mobile || '',
      status: m.status || 'pending', photo_url: m.photo_url || ''
    };
  });
  downloadCSV('rjf-members-' + Date.now() + '.csv', rows);
}
