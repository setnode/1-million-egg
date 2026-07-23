# Plan Doğrulama ve Teknik Risk İncelemesi

Plan genel hatlarıyla çok sağlam ancak implementasyona geçmeden önce **production ortamında sistemi tamamen çökertebilecek 4 kritik risk** tespit ettim. Bu riskleri aşağıdaki ufak dokunuşlarla gidereceğiz:

### 1. Ponder Senkronizasyon (Re-sync) Faciası
**Risk:** Ponder her güncellendiğinde veya yeniden başladığında 0. bloktan itibaren tüm geçmiş verileri tekrar okur (Historical Sync). Eğer `DailyClaimed` event'i geldiğinde doğrudan kuyruğa bildirim atarsak, Ponder sync olduğu anda kullanıcılara geçmiş 6 ayın tüm bildirimleri (binlerce bildirim) bir anda gider.
**Çözüm:** Ponder handler içerisinde, bloğun zaman damgasını (timestamp) kontrol edeceğiz. Sadece son 1 saat içinde gerçekleşmiş (yani "canlı") event'ler için Notification Queue'ya kayıt atacağız.

### 2. Veri Kaybı (Ponder Schema Mimarisi)
**Risk:** `ponder.schema.ts` dosyası sadece on-chain veriler (türetilmiş veriler) içindir. Ponder bir şema değişikliği algıladığında bu tabloları DROP eder ve baştan yaratır. Eğer Webhook token'larını ve Queue'yu burada tanımlarsak, her güncellemede tüm kullanıcıların bildirim izinleri ve sıradaki bildirimler kalıcı olarak silinir!
**Çözüm:** `NotificationToken`, `PlayerFid` ve `NotificationQueue` tablolarını `ponder.schema.ts` içine KESİNLİKLE koymayacağız. Bunları projedeki standart veritabanı yapısında (Drizzle üzerinden) oluşturacağız. Ponder handler'ı içinden standart `db.insert()` çağrısı ile kuyruğa veri yazacağız.

### 3. Farcaster Webhook Sahteciliği (Security)
**Risk:** `/api/webhook/farcaster` endpoint'i herkese açık olacak. Kötü niyetli biri sürekli sahte `frame_removed` istekleri atarak veritabanımızdaki tüm bildirim token'larını silebilir.
**Çözüm:** Farcaster webhook'ları `X-Farcaster-Signature` header'ı ile gelir. İsteği işleme almadan önce bu imzayı (signature) uygulamanın gizli anahtarı ile doğrulayacağız (Verify).

### 4. Başkasının Adresini Çalma (Spoofing)
**Risk:** Frontend'den atılacak `/api/player/link-fid` isteğinde biri çıkıp `address: VITALIK_ADRESI, fid: KENDI_FID_SI` yollarsa, Vitalik'in bildirimleri bu kişiye gider. Bu durum finansal bir hack olmasa da spam yaratır.
**Çözüm:** Bu eşleştirmeyi yaparken frontend tarafında kullanıcıdan cüzdanı ile basit bir imza (Sign Message: "Link Farcaster FID 1234...") alacağız ve backend'de bu imzayı doğrulayarak eşleştirmeyi kaydedeceğiz.

---
Bu 4 maddeyi plana dahil ettiğimizde sistem **%100 bullet-proof (kurşun geçirmez)** olacaktır. 

Eğer bu korumaları da uygun bulursanız, ilk adım olan **Tablo/Şema oluşturma ve Drizzle entegrasyonu** ile kodlamaya başlıyorum?
