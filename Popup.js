const toggle = document.getElementById('toggleState');
const statusText = document.getElementById('status');

// Kayıtlı durumu yükle (varsayılan: açık/true)
chrome.storage.sync.get(['gtaProtectionEnabled'], function(result) {
  const isEnabled = result.gtaProtectionEnabled !== false; // Tanımlı değilse varsayılan true
  toggle.checked = isEnabled;
  statusText.textContent = isEnabled ? "Aktif" : "Pasif";
  statusText.style.color = isEnabled ? "#2ecc71" : "#e74c3c";
});

// Değiştirildiğinde hafızaya kaydet
toggle.addEventListener('change', function() {
  const isEnabled = toggle.checked;
  chrome.storage.sync.set({ gtaProtectionEnabled: isEnabled }, function() {
    statusText.textContent = isEnabled ? "Aktif" : "Pasif";
    statusText.style.color = isEnabled ? "#2ecc71" : "#e74c3c";
  });
});