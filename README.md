# Kənd Təsərrüfatı İnvestisiya Portalı

Açıq (qeydiyyatsız) investor portalı. "Kənd Təsərrüfatı üzrə Dövlət Proqramı
(2026–2030)" çərçivəsində investorlara aidiyyəti dövlət dəstəyi mexanizmlərini
və proqram bəndlərini göstərir, investisiya niyyəti bildirişini qəbul edir və
daxili monitorinq portalına ötürür.

## Məzmun

- [Arxitektura](#arxitektura)
- [Quraşdırma və işə salma](#quraşdırma-və-işə-salma)
- [Layihə strukturu](#layihə-strukturu)
- [Məlumatların yenilənməsi](#məlumatların-yenilənməsi-kod-dəyişmədən)
- [Daxili portala qoşulma](#daxili-portala-qoşulma)
- [Şəxsi məlumatların minimallaşdırılması](#şəxsi-məlumatların-minimallaşdırılması)
- [Spam/bot qoruması](#spambot-qoruması)
- [API](#api)
- [Fərziyyələr və mənbə məhdudiyyətləri](#fərziyyələr-və-mənbə-məhdudiyyətləri)

## Arxitektura

Açıq portal və daxili monitorinq sistemi arasında əlaqə **birtərəflidir**: açıq
portal daxili sistemin heç bir məlumatına çıxışı yoxdur, yalnız özünün qəbul
etdiyi müraciətləri ötürə bilər.

```
┌─────────────────┐       ┌──────────────────┐       ┌───────────────────┐
│   İnvestor       │──────▶│  Açıq Portal      │──────▶│  Daxili Portal     │
│  (brauzer,       │ HTTP  │  (bu repo)        │  bir   │  (ayrıca sistem,   │
│  qeydiyyatsız)   │       │                   │ tərəfli│  bu repoda yoxdur) │
└─────────────────┘       │  - React frontend │  axın  │                    │
                           │  - Express API    │       │  - işçi qruplara   │
                           │  - SQLite (yerli) │       │    paylama         │
                           └──────────────────┘       └───────────────────┘
```

Ötürmə üçün iki rejim var (`.env` → `INTERNAL_ADAPTER_MODE`):

- **PULL (defolt)** — daxili portal özü `GET /api/internal/applications?status=pending`
  ünvanından yeni müraciətləri çəkir, işlədikdən sonra
  `POST /api/internal/applications/:appNumber/ack` ilə qəbulu təsdiqləyir.
- **PUSH** — açıq portal müraciəti qəbul edən kimi öz təşəbbüsü ilə daxili
  portalın API-sinə göndərir (xəta halında retry/backoff ilə).

Hər iki rejimdə daxili endpointlər (`/api/internal/*`) açıq `/api/*`
marşrutlarından tamamilə ayrı, öz middleware zəncirində quraşdırılıb və
API açarı (+ istəyə görə IP whitelist) tələb edir. Bu endpointlər heç bir
ictimai menyuda/dokumentasiyada göstərilmir.

Təsdiqdən sonra açıq portal, konfiqurasiyadan asılı olaraq, müraciətin şəxsi
məlumatlarını silə bilər və yalnız müraciət nömrəsi + statusu saxlaya bilər
(bax [Şəxsi məlumatların minimallaşdırılması](#şəxsi-məlumatların-minimallaşdırılması)).

## Quraşdırma və işə salma

**Tələblər:** Node.js **v22 və ya yuxarı** (`node:sqlite` üçün; bu layihə
`better-sqlite3` əvəzinə Node-un daxili SQLite modulundan istifadə edir ki,
Windows-da native compiler/Visual Studio Build Tools tələb olunmasın).
Yoxlanılıb: Node v24.19.0.

```bash
# 1. Asılılıqları quraşdırın (root-dan, npm workspaces)
npm install

# 2. Backend konfiqurasiyasını hazırlayın
cp backend/.env.example backend/.env
# .env faylını açıb lazım olan dəyərləri doldurun (bax aşağıda)

# 3. Backend-i işə salın (http://localhost:4000)
npm run dev:backend

# 4. Frontend-i işə salın (http://localhost:5173, /api -> 4000-ə proxy edilir)
npm run dev:frontend
```

Brauzerdə `http://localhost:5173` açın.

### Daxili portalı simulyasiya etmək (lokal test üçün)

Real daxili portal hazır olmadığı üçün bir mock server var:

```bash
npm run dev:mock-internal
```

`INTERNAL_ADAPTER_MODE=pull` olduqda bu mock `OPEN_BACKEND_URL`-ə (defolt
`http://localhost:4000`) periodik sorğu göndərib gözləyən müraciətləri çəkir
və təsdiqləyir. `push` rejimində isə əksinə, öz üzərində qəbuledici server
açıb açıq backend-dən gələn sorğuları qəbul edir (`MOCK_INTERNAL_PORT`,
defolt 4100). `MOCK_FAIL_RATE` ilə təsadüfi uğursuzluq simulyasiya edilə bilər
(retry məntiqini test etmək üçün).

### Production build

```bash
npm run build   # həm backend, həm frontend
```

## Layihə strukturu

```
backend/
  src/
    data/              JSON mənbə faylları (bax aşağıda)
    search/            AZ-aware fuzzy axtarış mühərriki
    db/                SQLite schema və bağlantı (node:sqlite)
    middleware/         validasiya, rate limit, honeypot, daxili auth
    adapter/            daxili portala ötürmə (push/pull) + mock server
    routes/             /api/search, /api/applications, /api/internal/*
    utils/              müraciət nömrəsi, işçi qrup marşrutlaşdırması
frontend/
  src/
    pages/              Axtarış, Nəticələr, Müraciət forması, Təsdiq
    api/client.ts        backend ilə əlaqə
    styles/global.css    rəsmi dövlət sayt üslubu, mobil-responsive
docs/
  dovlet-proqrami.pdf   mənbə sənəd
scripts/
  gen_program_data.py   program-items.json generatoru (bir dəfəlik)
  gen_incentives.py     incentives.json generatoru (bir dəfəlik)
```

## Məlumatların yenilənməsi (kod dəyişmədən)

Bütün sahə/dəstək məzmunu `backend/src/data/` altında JSON fayllarda saxlanılır
və serveri yenidən başlatmaqdan başqa heç bir kod dəyişikliyi tələb etmir:

- **`incentives.json`** — konkret dövlət dəstəyi/güzəşt/subsidiya mexanizmləri.
- **`program-items.json`** — Dövlət Proqramının fəaliyyət planı bəndləri
  (bənd nömrəsi, mətn, icraçı, müddət, nəticə).
- **`regions.json`** — rayon/şəhər siyahısı (forma üçün).
- **`routing-rules.json`** — sahə teqlərinin işçi qrup koduna uyğunluğu
  (bax aşağıda, mənbə sənəddə yoxdur).
- **`synonyms.json`** — AZ sinonim/əlaqəli söz qrupları (axtarışın geniş
  işləməsi üçün, məs. "toyuqçuluq" → "quşçuluq").

Yeni bənd/dəstək əlavə etmək üçün uyğun JSON-a yeni obyekt əlavə edin (eyni
sahə strukturunu saxlamaqla) və backend-i yenidən başladın. Kod dəyişikliyi
lazım deyil.

## Daxili portala qoşulma

Real daxili portal hazır olduqda, `backend/.env`-də:

1. `INTERNAL_ADAPTER_MODE` seçin:
   - `pull` — daxili komandaya yalnız API açarı və (istəyə görə) IP
     whitelist verin ki, `/api/internal/*`-a sorğu göndərə bilsinlər.
   - `push` — `INTERNAL_API_BASE_URL` və `INTERNAL_PUSH_API_KEY`-i real
     dəyərlərlə doldurun.
2. `INTERNAL_API_KEY`-i güclü, təsadüfi dəyərlə əvəz edin (PULL rejimi üçün).
3. `INTERNAL_IP_WHITELIST`-ə daxili portalın server IP-lərini (vergüllə
   ayrılmış) yazın.
4. `routing-rules.json`-u real işçi qrup strukturu ilə əvəz edin (bax
   [Fərziyyələr](#fərziyyələr-və-mənbə-məhdudiyyətləri)).

Mock server artıq istifadə olunmamalıdır — `npm run dev:mock-internal`
yalnız lokal test üçündür.

## Şəxsi məlumatların minimallaşdırılması

`PURGE_PII_ON_CONFIRM=true` təyin olunarsa, daxili portal müraciəti qəbul
edib təsdiqlədikdən sonra (`POST /api/internal/applications/:appNumber/ack`)
açıq portal həmin sətirdən şəxsi məlumatları (ad, telefon, e-poçt, VÖEN,
region, məbləğ, təsvir) silir və yalnız müraciət nömrəsi, sahə, status,
işçi qrup və tarixi saxlayır. Defolt `false`-dur (dev rahatlığı üçün).

## Spam/bot qoruması

Qeydiyyat olmadığı üçün aşağıdakı mexanizmlər tətbiq olunub:

- **Rate limiting**: `POST /api/applications` — 15 dəqiqədə 5 sorğu/IP;
  `GET /api/search` — dəqiqədə 60 sorğu/IP.
- **Honeypot**: formada görünməz (`website`) sahə var. Bot onu doldursa,
  server saxta uğurlu cavab (təsadüfi müraciət nömrəsi) qaytarır, lakin
  heç nə yazmır — bot hansı sahənin tələ olduğunu bilə bilmir.
- **Server-side validasiya**: bütün sahələr `zod` ilə yoxlanılır (format,
  uzunluq, region siyahısı, VÖEN formatı və s.); frontend validasiyası
  yalnız UX üçündür, təhlükəsizlik üçün deyil.

## API

| Metod | Yol | Təsvir |
|---|---|---|
| GET | `/api/search?q=...` | AZ-aware fuzzy axtarış (dəstək mexanizmləri + proqram bəndləri) |
| GET | `/api/search/tags` | Mövcud sahə teqlərinin siyahısı |
| POST | `/api/applications` | Yeni investisiya niyyəti müraciəti |
| GET | `/api/applications/:appNumber/status` | Müraciətin cari statusu |
| GET | `/api/internal/applications?status=pending` | *(daxili, auth tələb edir)* |
| POST | `/api/internal/applications/:appNumber/ack` | *(daxili, auth tələb edir)* |

## Fərziyyələr və mənbə məhdudiyyətləri

Tapşırığa əsasən: **mənbədə olmayan heç nə uydurulmayıb**; proqram bəndləri
(`program-items.json`) və dəstək mexanizmləri (`incentives.json`) yalnız
`docs/dovlet-proqrami.pdf`-dən çıxarılıb. Aşağıdakılar isə mənbə sənəddə
**yoxdur** və development üçün fərziyyə əsasında əlavə olunub:

- **`regions.json`** — Azərbaycanın rayon/inzibati vahid siyahısı. Ümumi
  bilikdən tərtib edilib, mənbə sənədin hissəsi deyil.
- **`routing-rules.json`** — işçi qrup kodları (WG-BITKI, WG-HEYVAN və s.)
  və sahə→qrup uyğunluğu tamamilə fərziyyədir (fayl daxilində `_qeyd`
  sahəsində də qeyd olunub). Real daxili portala qoşulmadan əvvəl bu fayl
  real işçi qrup strukturu ilə əvəz edilməlidir.
- **Axtarış sinonimləri (`synonyms.json`)** — dilçi fərziyyə əsasında
  tərtib edilib, mənbə sənədin hissəsi deyil.

**Mənbədə tapılmayan mövzular**: canlı testlər zamanı müəyyən edilib ki,
bəzi dar mövzular (məsələn, "arıçılıq" / arı/bal istehsalı) üçün Dövlət
Proqramının mətnində ayrıca bənd və ya dəstək mexanizmi yoxdur. Bu
mövzular üzrə axtarış nəticəsiz qalır — bu, axtarış mühərrikinin qüsuru
deyil, mənbə sənədin əhatə dairəsinin məhdudluğudur. İstifadəçi yenə də
ümumi investisiya niyyəti kimi müraciət edə bilər (bax Nəticələr səhifəsi,
"boş nəticə" halı).
