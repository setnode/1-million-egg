# Boss Raid

## Amaç

Boss Raid, normal `EggClickerV2` ekonomisinden ayrı çalışan, toplulukla birlikte
bir Boss'un canını azaltma ve en çok hasar veren ilk beş oyuncunun sabit USDC
ödülünü paylaşması üzerine kurulu bir etkinliktir.

Boss tap'leri normal egg üretmez. Bu ayrım, aynı işlem için hem normal egg
claim yükümlülüğü hem de Boss ödülü oluşmasını engeller.

## İlk raid parametreleri

İlk etkinlik için önerilen ayarlar:

- Boss canı: `2,000`
- Raid süresi: `30 gün`
- Tap paketleri: `1x`, `10x`, `20x`, `50x`, `100x`
- Ödül: Başlangıçta kontrata kilitlenen `20 USDC`
- Ücret: Raid açılırken belirlenen sabit ETH miktarı

ETH fiyatı değiştiği için ücret kontratta USD olarak değil, `tapFeeWei` olarak
saklanır. Arayüz kesin ETH miktarını ve işlem anındaki yaklaşık USD değerini
gösterir. Raid başladıktan sonra ücret değiştirilemez.

## Raid yaşam döngüsü

1. Owner, ödül dağılımının toplamı kadar USDC'yi kontrata approve eder.
2. `startRaid` ile can, ETH tap ücreti ve beş ödül tutarı belirlenir.
3. Kontrat ödülü escrow'a alır ve raid'i `Active` yapar.
4. Kullanıcı `bossTap(raidId, hits)` çağırır. `hits` yalnızca 1, 10, 20, 50 veya 100 olabilir.
5. Her tap, kullanıcının Boss Damage skorunu artırır ve ETH ödemesini kullanıcı bazında kaydeder.
6. Boss'un canı sıfırlanırsa raid `Completed` olur ve Top 5 ödülleri claimable hâle gelir.
7. Boss 30 gün içinde bitmezse herkes `expireRaid` çağırabilir; raid `Expired` olur.

## Refund ve owner güvenliği

`Active` durumunda owner ne ETH gelirini ne de USDC ödülünü çekebilir.

Raid iptal edilir veya süresi dolarsa her katılımcı `claimRefund` ile o raid'de
ödediği Boss Tap ETH'sinin tamamını alır. Base işlem gas'ı iade edilmez.

Raid tamamlanırsa kazananların `claimPrize` için 30 günü vardır. Süre sonunda
claim edilmemiş USDC `sweepExpiredPrize` ile treasury'ye geri dönebilir.

Başarılı raid'in ETH geliri ancak `Completed` durumundan sonra
`withdrawCompletedRevenue` ile çekilebilir.

## İleride 10,000 HP raid

Yeni kontrat deploy edilmez. Önceki raid tamamlandıktan veya iptal edildikten
sonra aynı kontrattan tekrar `startRaid` çağrılır:

```text
health       = 10,000
tapFeeWei    = yeni ETH fiyatına göre belirlenen sabit değer
prizeAmounts = yeni beş ödül tutarı
```

Active raid sırasında can, fee, süre ve ödül dağılımı değiştirilemez.

## Kullanıcıya gösterilecek açık mesaj

> Boss Raid'e yapılan tap'ler normal egg vermez; yalnızca Boss Damage kazandırır.
> Ödül havuzu raid başlamadan önce kontratta kilitlidir. Boss 30 gün içinde
> bitmez veya raid iptal edilirse, ödediğiniz Boss Tap ETH'sini refund olarak
> alabilirsiniz. Boss tamamlanırsa yalnızca en yüksek hasara sahip ilk beş
> oyuncu, sabit ödül tablosundaki USDC'yi claim edebilir.

Bu kontrat, küresel cash-prize yayını için hukuki uygunluk garantisi vermez;
ödüllü raid modu yayınlanmadan önce hedef pazarlar için ayrı bir inceleme
yapılmalıdır.
