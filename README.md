# NR Publicore — SAPA NR

เว็บแอปสำหรับประชาสัมพันธ์และส่งเสริมการมีส่วนร่วมของนักเรียน โรงเรียนนารีรัตน์จังหวัดแพร่ ภายใต้โครงการประชาธิปไตยดิจิทัลเพื่อการมีส่วนร่วม รองรับการติดตามข่าวสารและนโยบายพรรคสภานักเรียน แสดงความคิดเห็น เรียนรู้ผ่านสื่อ และดูผลการเลือกตั้ง

ตัวแอปอยู่ในโฟลเดอร์ [`sapa-project`](./sapa-project) ใช้ React และ Vite เชื่อมต่อ Firebase จากเบราว์เซอร์โดยตรง ส่วนผลเลือกตั้งอ่านจาก API ภายนอก โดยไม่มีซอร์สของ API นั้นอยู่ใน repository นี้

## สารบัญ

- [ฟีเจอร์](#features)
- [เทคโนโลยีและสถาปัตยกรรม](#architecture)
- [โครงสร้างโปรเจกต์](#structure)
- [การติดตั้งและรัน](#setup)
- [การตั้งค่า Firebase](#firebase)
- [โครงสร้างข้อมูล](#data)
- [API ผลเลือกตั้ง](#vote-api)
- [หน้าและเส้นทาง](#routes)
- [คำสั่งพัฒนาและการตรวจสอบ](#development)
- [การเผยแพร่](#deployment)
- [การปรับแต่งและข้อจำกัด](#maintenance)
- [การแก้ปัญหาเบื้องต้น](#troubleshooting)
- [ผู้พัฒนาและสิทธิ์การใช้งาน](#credits)

<a id="features"></a>
## ฟีเจอร์

### สำหรับผู้เข้าชมและนักเรียน

- **ข่าวประชาสัมพันธ์:** แสดงโพสต์ล่าสุด 10 รายการจาก Firestore และอัปเดตผ่าน realtime listener
- **ข้อมูลพรรค:** รายละเอียดพรรค สมาชิก และนโยบาย พร้อมโพสต์ของแต่ละพรรค
- **บัญชีผู้ใช้:** เข้าสู่ระบบด้วย Google ผ่าน Firebase Authentication
- **การมีส่วนร่วม:** ผู้ใช้ที่เข้าสู่ระบบสามารถกดถูกใจ ยกเลิกถูกใจ และแสดงความคิดเห็นใต้โพสต์
- **ห้องเรียนรู้:** แสดงหัวข้อจาก Firestore กรองตามแท็ก เปิดภาพสื่อ และให้คะแนนหัวใจ 1–5 ระดับ โดยเปลี่ยนหรือยกเลิกคะแนนได้
- **NR eVote:** หน้า `/school` มีแท็บข้อมูลพรรคและผลเลือกตั้ง แสดงคะแนนผู้สมัคร คะแนนไม่ประสงค์ลงคะแนน และสัดส่วนคะแนนตามข้อมูล API
- **โพล/ดีเบต:** หน้า `/debate` มีช่วงเวลาเปิด–ปิดรับความคิดเห็นและการเลือกพรรค บันทึกข้อมูลใน Firestore collection `poll` ปัจจุบันปุ่มไปหน้านี้ในแถบนำทางถูกคอมเมนต์ไว้ แต่ route ยังมีอยู่
- **แหล่งเรียนรู้ภายนอก:** เชื่อมไปยัง NRDD MOOC และ NRDD MAP บน Roblox

### สำหรับตัวแทนพรรค

- เข้าสู่ระบบผ่านหน้า Party Login
- สร้างโพสต์หัวข้อและรายละเอียด พร้อมภาพประกอบหนึ่งไฟล์ ขนาดไม่เกิน 2 MiB (`2 × 1024 × 1024` ไบต์)
- ดูรายการโพสต์และรายละเอียดความคิดเห็น
- ตอบความคิดเห็นในนามพรรค

ระบบหลังบ้านปัจจุบันยังไม่มีฟังก์ชันแก้ไขหรือลบโพสต์ และไม่มีหน้าจัดการข้อมูลพรรคหรือหัวข้อห้องเรียนรู้

<a id="architecture"></a>
## เทคโนโลยีและสถาปัตยกรรม

เวอร์ชันด้านล่างอ้างอิงช่วงเวอร์ชันใน [`package.json`](./sapa-project/package.json) ส่วนเวอร์ชันที่ใช้ติดตั้งซ้ำระบุใน `package-lock.json`

| ส่วน | เทคโนโลยี |
| --- | --- |
| UI | React / React DOM `^19.2.0`, JavaScript และ JSX |
| Build และ dev server | Vite `^7.2.4`, React Compiler ผ่าน Babel plugin |
| Routing | React Router DOM `^7.12.0` และ `BrowserRouter` |
| Styling | Tailwind CSS `^4.1.18` ผ่าน Vite plugin และ CSS ของโปรเจกต์ |
| Backend services | Firebase SDK `^12.8.0`: Authentication, Cloud Firestore, Storage |
| ไอคอนและกล่องแจ้งเตือน | Lucide React, React Icons, SweetAlert2 |
| ตรวจโค้ด | ESLint 9, React Hooks และ React Refresh plugins |
| วิเคราะห์ bundle | `rollup-plugin-visualizer` |
| Hosting / CI | Firebase Hosting และ GitHub Actions |

```text
Browser → React SPA
           ├─ Firebase Authentication → เข้าสู่ระบบ Google
           ├─ Cloud Firestore         → บัญชี โพสต์ ความคิดเห็น โพล และสื่อเรียนรู้
           ├─ Firebase Storage        → ภาพประกอบโพสต์
           ├─ VITE_API_URL            → อ่านผลเลือกตั้งภายนอก
           └─ PARTIES ในซอร์สโค้ด     → ข้อมูลพรรค สมาชิก และนโยบาย
```

`AuthProvider` ติดตามสถานะผู้ใช้ผ่าน `onAuthStateChanged` หน้าแต่ละส่วนโหลดด้วย `React.lazy` และ `Suspense` ส่วน Firestore เปิด persistent local cache พร้อมรองรับหลายแท็บ ข้อมูลบางหน้าใช้ realtime listener ขณะที่รายการหัวข้อและรายการโพสต์หลังบ้านอ่านเป็นครั้ง ๆ

<a id="structure"></a>
## โครงสร้างโปรเจกต์

```text
.
├── README.md
├── .github/workflows/
│   ├── firebase-hosting-merge.yml         # Deploy เมื่อ push เข้า main
│   └── firebase-hosting-pull-request.yml  # Preview สำหรับ PR ใน repository เดียวกัน
└── sapa-project/
    ├── package.json / package-lock.json
    ├── index.html                        # HTML entry และชื่อ NR Publicore
    ├── vite.config.js                    # React, Tailwind, bundle visualizer
    ├── eslint.config.js
    ├── tailwind.config.js
    ├── firebase.json                     # Hosting, cache headers, SPA rewrite
    ├── .firebaserc                       # Firebase project alias
    ├── stats.html                        # รายงาน bundle ที่ build สร้าง/เขียนทับ
    └── src/
        ├── main.jsx                      # React root และ BrowserRouter
        ├── App.jsx                       # Routes และ layout
        ├── index.css / app.css
        ├── components/
        │   ├── Context.jsx / Login.jsx    # Auth context และการเข้าสู่ระบบ
        │   ├── Header.jsx / Navbar.jsx / Footer.jsx
        │   ├── Home.jsx / Detail.jsx      # ฟีดและรายละเอียดโพสต์
        │   ├── Parties.jsx / Profile.jsx  # รายการและโปรไฟล์พรรค
        │   ├── School.jsx / Vote.jsx      # NR eVote และผลเลือกตั้ง
        │   ├── Debate.jsx                # โพลและผลโหวต
        │   ├── learning/
        │   │   ├── Learn.jsx             # รายการหัวข้อและตัวกรองแท็ก
        │   │   └── Topic.jsx             # รายละเอียดและคะแนนหัวใจ
        │   └── party/
        │       ├── PartyHome.jsx
        │       ├── PartyCreatePosts.jsx
        │       ├── PartyPosts.jsx
        │       └── PartyDetail.jsx
        ├── data/
        │   ├── firebase.js               # Firebase initialization
        │   ├── parties.js                # ข้อมูลพรรคคงที่ p1, p2, p3
        │   ├── LikedPost.js / getLikePosts.js
        │   └── CommentPost.js
        └── utils/formatDate.js            # วันที่แบบ DD/MM/พ.ศ.
```

<a id="setup"></a>
## การติดตั้งและรัน

### สิ่งที่ต้องเตรียม

- Git และ npm
- Node.js ที่ตรงกับ `engines` ของ Vite ใน lockfile: `^20.19.0 || >=22.12.0`
- Firebase project ที่เปิด Authentication, Firestore และ Storage ตามฟีเจอร์ที่จะใช้
- URL ของ API ผลเลือกตั้งสำหรับแท็บผลเลือกตั้ง

### 1. ติดตั้ง dependencies

หลัง clone repository ให้เปิด terminal ที่โฟลเดอร์รากแล้วรัน:

```bash
cd sapa-project
npm ci
```

คำสั่ง npm ทั้งหมดในคู่มือนี้ให้รันจาก `sapa-project/` เนื่องจากโฟลเดอร์รากไม่มี `package.json`

### 2. ตั้งค่า environment variables

สร้างไฟล์ `sapa-project/.env.local` แล้วใส่ค่าของ Firebase Web App และ API ที่ใช้:

```dotenv
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_API_URL=https://your-api.example/election-results
```

ใช้ค่า Storage bucket ตาม Firebase configuration ของโปรเจกต์จริง ตัวอย่างข้างต้นเป็น placeholder ทั้งหมด ใน repository ยังไม่มี `.env.example`

ตัวแปร Firebase ทั้ง 6 ค่าอ่านจาก [`src/data/firebase.js`](./sapa-project/src/data/firebase.js) ส่วน `VITE_API_URL` อ่านจาก `Vote.jsx` ตัวแปรที่ขึ้นต้นด้วย `VITE_` จะถูกฝังใน JavaScript ฝั่งผู้ใช้ตอน build จึงไม่ใช้เก็บ service account หรือข้อมูลลับฝั่งเซิร์ฟเวอร์ ไฟล์ `.env.local` ถูก ignore ด้วยกฎ `*.local` ของ repository

### 3. เปิด development server

```bash
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal เมื่อแก้ environment variables ให้เริ่ม dev server ใหม่ หากเป็น production ให้ build ใหม่ก่อน deploy

<a id="firebase"></a>
## การตั้งค่า Firebase

1. สร้างหรือเลือก Firebase project และลงทะเบียน Web App แล้วนำ config มาใส่ใน `.env.local`
2. เปิด Google sign-in provider ใน Firebase Authentication และกำหนด authorized domains ให้ตรงกับโดเมนที่ใช้ รวมถึง `localhost` สำหรับการพัฒนา
3. เตรียม Cloud Firestore และข้อมูลตามตารางด้านล่าง หน้าแรกอ่าน `posts` และห้องเรียนรู้อ่าน `learn`
4. เตรียม Firebase Storage หากต้องการอัปโหลดภาพโพสต์ โดยโค้ดบันทึกไฟล์ที่ `partyPosts/<timestamp>_<filename>`
5. กำหนด Firestore และ Storage Security Rules ให้ตรงกับสิทธิ์ผู้ใช้จริง repository นี้ไม่มีไฟล์ rules, indexes หรือ emulator configuration ให้ deploy ตามได้ทันที
6. Query โพสต์ของพรรคใช้ `partyID == ...` ร่วมกับ `orderBy("date", "desc")` หาก Firestore แจ้งว่าต้องสร้าง composite index ให้สร้างตามรายละเอียดของ query ในข้อความผิดพลาด

ข้อมูลพรรคมีสองแหล่งที่ต้องสัมพันธ์กัน: [`src/data/parties.js`](./sapa-project/src/data/parties.js) เก็บข้อมูลแสดงผล ส่วน collection `parties` ใช้กับ Party Login และโพล ฟิลด์ `UID` ในเอกสารพรรคต้องตรงกับ `PARTIES[].id` เช่น `p1` และโพสต์ใช้ค่านี้ใน `partyID`

ยังไม่มี seed script หรือข้อมูลส่งออกของฐานข้อมูล ต้องเตรียมข้อมูลเริ่มต้นเองผ่านเครื่องมือจัดการ Firebase สำหรับบทเรียนควรมี `tag` เป็น array เสมอ แม้จะเป็น `[]` และใช้ Firestore Timestamp สำหรับวันที่

**ข้อจำกัดของ Party Login:** โค้ดปัจจุบัน query ฟิลด์ `name` และ `password` จาก Firestore โดยตรง แล้วเก็บข้อมูลพรรคใน `localStorage` วิธีนี้ไม่ได้สร้าง Firebase Auth session ของตัวแทนพรรค และ `localStorage` ไม่ใช่หลักฐานสิทธิ์ที่เชื่อถือได้ การใช้ระบบหลังบ้านจริงจึงต้องปรับการยืนยันตัวตนและการตรวจสิทธิ์ให้ทำงานร่วมกับ Security Rules ไม่ควรแก้ปัญหาด้วยการเปิดสิทธิ์เขียนฐานข้อมูลให้ทุกคน

<a id="data"></a>
## โครงสร้างข้อมูล

ตารางนี้สรุปฟิลด์ที่โค้ดอ่านหรือเขียน ไม่ใช่ schema หรือ rules ที่บังคับใช้โดยอัตโนมัติ

| Collection / document path | ฟิลด์สำคัญและหน้าที่ |
| --- | --- |
| `accounts/{uid}` | `UID`, `name`, `email`, `displayImg`, `tag: "user"` สร้างหรืออัปเดตหลัง Google sign-in |
| `accounts/{uid}/likePosts/{postId}` | `postID` สำหรับโพสต์ที่ผู้ใช้ถูกใจ มีเอกสาร `init` แยกไว้และถูกกรองออกตอนอ่าน |
| `accounts/{uid}/topicRatings/{topicId}` | `topicID`, `rating` (1–5), `timestamp` |
| `parties/{partyDocumentId}` | `UID`, `name`, `password` ที่ระบบเข้าสู่ระบบเดิมใช้; หน้าโพลอ่านข้อมูลเอกสารพรรคด้วย |
| `posts/{postId}` | `partyID`, `content` (หัวข้อ/ข้อความฟีด), `description`, `hasImage`, `img`, `date`, `likes` |
| `posts/{postId}/comments/{commentId}` | `userID`, `userName`, `userImg`, `content`, `tag` (`user` หรือ `party`), `timestamp` |
| `learn/{topicId}` | `topic`, `date`, `tag` (array ของ string), `img`, ตัวนับ `like_1` ถึง `like_5` |
| `poll/{voteId}` | `uid`, `vote` (รหัสพรรค), `secondary`, `detail`, `description`, `date` |

การสร้างโพสต์จะเพิ่ม placeholder comment ที่มี `_status: "initial_placeholder"` ด้วย เอกสารนี้ไม่มี `timestamp` จึงไม่อยู่ในผล query ความคิดเห็นที่เรียงตามฟิลด์ดังกล่าว

`partyDocumentId` คือ ID ของเอกสารใน Firestore ขณะที่ `UID` คือรหัสพรรคสำหรับเชื่อมข้อมูลคงที่ ทั้งสองค่าไม่จำเป็นต้องเหมือนกัน ส่วน `userID` ในความคิดเห็นของพรรคใช้รหัสจาก `PARTIES` และไม่ได้หมายถึง Firebase Auth UID

<a id="vote-api"></a>
## API ผลเลือกตั้ง

[`Vote.jsx`](./sapa-project/src/components/Vote.jsx) ส่ง `GET` ไปยัง `VITE_API_URL` เมื่อเปิดแท็บผลเลือกตั้ง และโหลดซ้ำทุก 300,000 มิลลิวินาที (5 นาที) โดยไม่มีการแนบ token หรือกำหนด header เพิ่มเติม API ต้องตอบ JSON และอนุญาตการเรียกจาก origin ของเว็บหากอยู่คนละโดเมน

ตัวอย่างรูปแบบข้อมูลที่หน้าเว็บอ่าน (ตัวเลขเป็นข้อมูลสมมติ):

```json
{
  "summary": {
    "candidates": [
      { "candidateID": "1", "tag": "p1", "votes": 120 },
      { "candidateID": "2", "tag": "p2", "votes": 100 },
      { "candidateID": "3", "tag": "p3", "votes": 90 }
    ],
    "noVote": 10
  }
}
```

- `tag` ต้องตรงกับ `PARTIES[].id` เพราะหน้าเว็บนำไปค้นหาชื่อ สี และภาพพรรค
- `votes` และ `noVote` ควรเป็นตัวเลข ผลรวมที่หน้าเว็บคำนวณคือคะแนนผู้สมัครทั้งหมดรวมกับ `noVote`
- ฐานจำนวนผู้มีสิทธิ์ที่โค้ดใช้คำนวณเปอร์เซ็นต์กำหนดไว้เป็น `allStudents = 2945`
- เวลาปลดล็อกแสดงผลกำหนดไว้เป็น `2027-02-20T16:20:00+07:00` ก่อนถึงเวลาจะแสดงการนับถอยหลัง โดยโค้ดยังเรียก API อยู่

หน้านี้เป็นส่วนแสดงผลจาก API ภายนอก ไม่ได้ส่งบัตรเลือกตั้งผ่าน API ดังกล่าว ส่วน `/debate` เป็นโพลอีกระบบหนึ่งที่เขียนลง Firestore

<a id="routes"></a>
## หน้าและเส้นทาง

เส้นทางที่ประกาศใน [`App.jsx`](./sapa-project/src/App.jsx):

| Path | หน้าที่ |
| --- | --- |
| `/` | ฟีดข่าวประชาสัมพันธ์ |
| `/profile/:id` | โปรไฟล์พรรค โดย `id` เช่น `p1` |
| `/party/:partyId/post/:postId` | รายละเอียดโพสต์และความคิดเห็น |
| `/login` | เข้าสู่ระบบ Google / ออกจากระบบ |
| `/partyLogin` | เข้าสู่ระบบตัวแทนพรรค |
| `/partyAdmin/:id` | เมนูหลังบ้าน โดย `id` เป็น Firestore party document ID |
| `/partyAdmin/:id/create` | สร้างโพสต์ |
| `/partyAdmin/:id/posts` | รายการโพสต์ของพรรค |
| `/partyAdmin/:id/posts/:postID` | รายละเอียดโพสต์และตอบความคิดเห็นในนามพรรค |
| `/learn` | รายการหัวข้อเรียนรู้ |
| `/learn/:id` | รายละเอียดหัวข้อและคะแนนหัวใจ |
| `/school` | แท็บพรรคและผลการเลือกตั้ง |
| `/debate` | โพล/ดีเบตตามช่วงเวลาที่ตั้งไว้ |

ไม่มี route `/vote` หรือ `/parties` แยกต่างหาก ทั้งสองส่วนแสดงภายใน `/school` และยังไม่มี catch-all route สำหรับหน้า 404 ส่วน `/partyLogin` และเส้นทางที่ขึ้นต้นด้วย `/partyAdmin` จะซ่อน Header, Navbar และ Footer ของหน้าสาธารณะ

<a id="development"></a>
## คำสั่งพัฒนาและการตรวจสอบ

| คำสั่ง | หน้าที่ |
| --- | --- |
| `npm ci` | ติดตั้ง dependencies ตาม lockfile |
| `npm run dev` | เริ่ม Vite development server |
| `npm run lint` | ตรวจ JavaScript/JSX ด้วย ESLint |
| `npm run build` | สร้าง production bundle ใน `sapa-project/dist/` |
| `npm run preview` | เปิดดู production build ในเครื่อง หลังสั่ง build แล้ว |

Build ยังสร้าง/เขียนทับ `sapa-project/stats.html` เพื่อวิเคราะห์ขนาด bundle โดย visualizer ตั้ง `open: true` ไว้ จึงอาจพยายามเปิดรายงานในเบราว์เซอร์ `vite.config.js` กำหนดการแยก chunk ของ Firebase และ React เพิ่มเติมด้วย

Repository ยังไม่มี test script หรือชุดทดสอบอัตโนมัติ และ workflow ปัจจุบันไม่ได้เรียก lint ก่อน deploy การตรวจแก้ฟีเจอร์ควรรัน lint/build และลอง flow ที่เกี่ยวข้องด้วย Firebase สำหรับทดสอบ เช่น เข้าสู่ระบบ → เปิดโพสต์ → ถูกใจ/แสดงความคิดเห็น หรือสร้างโพสต์พร้อมภาพ → ตรวจรายการโพสต์

<a id="deployment"></a>
## การเผยแพร่

### Firebase Hosting จากเครื่อง

เมื่อเตรียม Firebase CLI และสิทธิ์เข้าถึงโปรเจกต์แล้ว รันจาก `sapa-project/`:

```bash
npm run build
firebase login
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

แทนที่ `YOUR_FIREBASE_PROJECT_ID` ด้วยโปรเจกต์ปลายทาง `.firebaserc` ใน repository ตั้ง default project เป็น `sapa-nr` การระบุ `--project` ช่วยเลือกปลายทางให้ชัดเจน หากนำไปใช้กับโปรเจกต์ใหม่ให้ปรับ alias และค่าที่เกี่ยวข้องใน workflows ด้วย

[`firebase.json`](./sapa-project/firebase.json) ตั้งค่า:

- Publish directory เป็น `dist`
- Rewrite ทุกเส้นทางไป `/index.html` เพื่อรองรับ `BrowserRouter` และการรีเฟรชหน้ารอง
- Cache ไฟล์ภาพ, JavaScript และ CSS ที่ตรงรูปแบบไว้ `2592000` วินาที (30 วัน)

คำสั่งนี้ deploy เฉพาะ Hosting ไม่ได้เตรียมฐานข้อมูล Rules หรือ Storage ให้โดยอัตโนมัติ หากใช้ static hosting อื่นต้องกำหนด fallback ไป `index.html` เช่นเดียวกัน

### GitHub Actions

| Workflow | Trigger และการทำงาน |
| --- | --- |
| `firebase-hosting-merge.yml` | เมื่อ push เข้า `main`: ติดตั้ง dependencies, build และ deploy ไป live channel ของ `sapa-nr` |
| `firebase-hosting-pull-request.yml` | เมื่อเปิด/อัปเดต PR จาก repository เดียวกัน: ติดตั้ง, build และสร้าง Hosting preview; PR จาก fork ถูกข้ามตามเงื่อนไขในไฟล์ |

GitHub Actions secrets ที่ workflow อ้างอิง:

| Secret | การใช้งาน |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID |
| `VOTE_API_URL` | ส่งเข้า build ในชื่อตัวแปร `VITE_API_URL` |
| `FIREBASE_SERVICE_ACCOUNT_SAPA_NR` | Service account สำหรับ deploy ผ่าน Firebase Hosting action |

`GITHUB_TOKEN` ใช้ token ที่ GitHub Actions จัดให้ Workflow ทั้งสองใช้ `npm install` และยังไม่ได้กำหนด Node.js ผ่าน `actions/setup-node` จึงควรตรวจเวอร์ชัน Node ของ runner เมื่อพบปัญหา build

<a id="maintenance"></a>
## การปรับแต่งและข้อจำกัด

| สิ่งที่ต้องการปรับ | จุดที่เกี่ยวข้อง |
| --- | --- |
| พรรค สมาชิก นโยบาย รูปภาพ และสี | `src/data/parties.js`; รักษาความสัมพันธ์กับ `parties.UID` และ API `tag` |
| ชื่อเว็บ ฟอนต์ และ favicon | `index.html`, `Header.jsx`, `index.css`, `app.css` |
| เมนูและลิงก์แหล่งเรียนรู้ | `Navbar.jsx`, `learning/Learn.jsx` |
| ข้อมูลติดต่อและเครดิต | `Footer.jsx` |
| หัวข้อห้องเรียนรู้ | Firestore collection `learn` |
| วันแสดงผลและจำนวนผู้มีสิทธิ์ | `electionDate` และ `allStudents` ใน `Vote.jsx` |
| เวลาเปิด–ปิดโพลและ collection | `DebateDate`, `DebateEndDate`, `disk` ใน `Debate.jsx` |
| Firebase ปลายทาง | `.env.local`, `.firebaserc` และ `.github/workflows/` |

ข้อจำกัดที่เห็นจากซอร์สโค้ดปัจจุบัน:

- วันโพลตั้งไว้เป็น **18 กุมภาพันธ์ 2026 เวลา 08:00–08:10 น. (UTC+7)** ขณะที่เวลาแสดงผลเลือกตั้งเป็นปี 2027 ต้องตรวจและปรับตามกิจกรรมที่นำไปใช้
- การกันโหวตซ้ำตรวจจาก Firestore และค่า `voted` ใน `localStorage` แต่ค่าในเครื่องไม่ได้แยกตามบัญชีหรือกิจกรรม และการเขียนคะแนนไม่ได้ใช้ transaction จึงไม่ใช่การรับประกันหนึ่งคนหนึ่งสิทธิ์จากฝั่งเซิร์ฟเวอร์
- การบันทึกถูกใจ/คะแนนหัวใจและการอัปเดตตัวนับเป็นคนละคำสั่ง หากบางคำสั่งล้มเหลว ตัวนับอาจไม่ตรงกับรายการของผู้ใช้
- Party Login ยังใช้รหัสผ่านในเอกสาร Firestore และข้อมูลใน `localStorage` ตามที่อธิบายในส่วน Firebase เส้นทางย่อยหลังบ้านยังไม่ได้มี route guard ร่วมกัน
- การกลับเข้า Party Login เมื่อมีข้อมูลเดิมใช้ `party.UID` ใน URL แต่หน้า dashboard ตรวจเทียบกับ document ID (`party.id`) จึงอาจเปลี่ยนหน้าไม่ถูกต้องหากสองค่านี้ต่างกัน
- `Vote.jsx` เรียก `setError` ที่ยังไม่ได้ประกาศเมื่อ API ล้มเหลว และอ่านข้อมูลพรรคโดยไม่รองรับ `tag` ที่หาไม่พบ จึงยังมีกรณี error ที่ต้องแก้ก่อนพึ่งพาการแสดงผลจริง
- ภาพพรรค โลโก้ ฟอนต์ และลิงก์สื่อบางส่วนพึ่งพาบริการภายนอก ส่วน fallback `/sapa.png` ไม่มีไฟล์ดังกล่าวอยู่ใน repository

รายการนี้เป็นบันทึกสภาพโค้ดเพื่อช่วยติดตั้งและพัฒนาต่อ ไม่ใช่ผลการทดสอบ Firebase หรือระบบ production

<a id="troubleshooting"></a>
## การแก้ปัญหาเบื้องต้น

| อาการ | จุดที่ควรตรวจ |
| --- | --- |
| npm หา `package.json` ไม่พบ | ให้รันคำสั่งใน `sapa-project/` |
| ติดตั้งหรือ build ไม่ผ่านเพราะ Node | ตรวจ `node --version` ให้ตรง `engines` ที่ระบุในหัวข้อการติดตั้ง |
| Firebase initialization หรือ API key ผิดพลาด | ตรวจค่า `VITE_FIREBASE_*`, ตำแหน่ง `.env.local` และเริ่ม dev server ใหม่ |
| Google sign-in ถูกปฏิเสธ | ตรวจ Google provider, authorized domains และการบล็อก popup ของเบราว์เซอร์ |
| `Missing or insufficient permissions` | ตรวจสถานะ Firebase Auth และ Security Rules; Party Login เดิมไม่ได้สร้าง Auth session |
| Query โพสต์แจ้งว่าขาด index | สร้าง composite index ตาม error ของ Firestore สำหรับ query ที่ใช้ |
| ไม่พบพรรคหรือโพสต์ของพรรค | ตรวจ document ID, `parties.UID`, `posts.partyID` และ `PARTIES[].id` ให้เชื่อมกันถูกต้อง |
| ห้องเรียนรู้โหลดผิดพลาด | ตรวจว่า `tag` เป็น array และ `date` เป็น Timestamp |
| ภาพโพสต์อัปโหลดไม่สำเร็จ | ตรวจขนาดไฟล์, Storage bucket และ Storage Rules |
| ผลเลือกตั้งไม่แสดง | ตรวจเวลาปลดล็อก, `VITE_API_URL`, HTTP/CORS, JSON `summary` และ `tag` ของผู้สมัคร |
| รีเฟรชหน้ารองแล้ว 404 | ตรวจ SPA rewrite ไป `/index.html` บน hosting |
| ค่า environment เปลี่ยนแล้วเว็บยังใช้ค่าเดิม | เริ่ม dev server ใหม่ หรือ build และ deploy ใหม่สำหรับ production |

<a id="credits"></a>
## ผู้พัฒนาและสิทธิ์การใช้งาน

ตามเครดิตใน Footer: **คณะทำงานโครงการประชาธิปไตยดิจิทัลเพื่อการมีส่วนร่วม โรงเรียนนารีรัตน์จังหวัดแพร่**

- [Facebook สภานักเรียน](https://www.facebook.com/profile.php?id=100090712844000)
- [Instagram @studentcouncil_nr](https://www.instagram.com/studentcouncil_nr/)

Repository ยังไม่มีไฟล์ `LICENSE` จึงยังไม่มีการระบุสัญญาอนุญาตสำหรับนำซอร์สโค้ดไปใช้ซ้ำอย่างชัดเจน
