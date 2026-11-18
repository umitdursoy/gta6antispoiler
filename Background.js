chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Kullanıcının eklentiyi açıp kapatmadığını kontrol et
    chrome.storage.sync.get(['gtaProtectionEnabled'], function(result) {
      const isEnabled = result.gtaProtectionEnabled !== false;
      if (!isEnabled) return; // Koruma kapalıysa hiçbir şey yapma

      const url = changeInfo.url.toLowerCase();
      
      // Hem rakam (6) hem de Romen rakamı (vi) dahil tüm boşluk/tire varyasyonları
      const gta6Regex = /gta[\s\-_%20+]*(6|vi)/i;

      if (gta6Regex.test(url)) {
        chrome.tabs.goBack(tabId).catch(() => {
          chrome.tabs.remove(tabId);
        });
      }
    });
  }
});