/**
 * Membuka data URL PDF di tab baru secara aman dan kompatibel dengan semua browser.
 * Browser modern (Chrome, Edge, Safari, dan Mobile) memblokir navigasi langsung
 * ke data: URI pada tab baru (menyebabkan halaman kosong 'about:blank').
 * Helper ini mengonversi base64 ke Blob URL yang 100% didukung browser.
 */
export function openPdfInNewTab(dataUrl, fileName = 'Dokumen_Katalog.pdf') {
  if (!dataUrl) return;

  // Jika URL web biasa (http/https), buka langsung
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    window.open(dataUrl, '_blank');
    return;
  }

  try {
    const parts = dataUrl.split(',');
    const base64Data = parts[1] || parts[0];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    const win = window.open(blobUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Jika pop-up diblokir di HP, unduh langsung
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Bersihkan Blob URL setelah 2 menit
    setTimeout(() => {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {
        // Abaikan jika sudah bersih
      }
    }, 120000);
  } catch (err) {
    console.error('Gagal membuka PDF via Blob URL:', err);
    // Fallback: unduh langsung
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
