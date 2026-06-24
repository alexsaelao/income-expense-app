# Wallet Code Sabai - DB-First Implementation Plan

## Goal

เปลี่ยน flow หลักของข้อมูลการเงินให้เป็น `DB-first` แบบชัดเจน

- การ submit `transaction`
- การ create/update/delete `wallet`
- การ create/update/delete `category`
- การ create/update/delete `company`

ทุก action ข้างบนต้องเขียนลงฐานข้อมูลสำเร็จก่อนเสมอ แล้วค่อยอัปเดต state ในหน้า app

ถ้า `offline` หรือ `DB request fail`

- ห้ามบันทึกลง local state เป็นข้อมูลถาวร
- ห้ามค้างรายการไว้รอ sync
- ห้ามมี offline queue
- ให้ผู้ใช้เห็น error แล้วลองใหม่ตอนกลับมา online

## Direction

ระบบนี้จะไม่ใช้แนว `offline-first` และไม่ทำ `offline queue` ใน scope นี้

- App shell ยังเปิดได้ตอน offline
- หน้า UI ยังแสดงสถานะ online/offline ได้
- แต่การแก้ข้อมูลการเงินจริงทำได้เฉพาะตอน online และตอน DB พร้อมเท่านั้น

`Cloud database` ต้องเป็น source of truth ของข้อมูลธุรกรรมและ master data ทั้งหมด

## Current problems

จากโค้ดปัจจุบัน

- `transactions` เริ่มเข้าใกล้ DB-first แล้ว เพราะ submit ผ่าน `/api/transactions` ก่อน
- แต่ `wallet/category/company` ยังแก้ `store.value` ใน client ก่อน แล้วค่อย `syncCloudNow()`
- `app_state` ยังถูกใช้เป็น snapshot state ก้อนใหญ่ ทำให้พฤติกรรมยังปน local-first
- ถ้า request หลักล้มเหลว มีโอกาสที่ local UI กับ DB จะไม่ตรงกัน

## Target behavior

### 1. Transactions

- `create/update/delete` ต้องเรียก API แล้ว commit DB ก่อน
- ถ้า API สำเร็จ ค่อยอัปเดต local store จาก response
- ถ้า API ล้มเหลว local store ต้องไม่เปลี่ยน

### 2. Wallets

- `create/update/delete` ต้องเรียก API ฝั่ง server โดยตรง
- local store อัปเดตจาก response หลัง DB สำเร็จเท่านั้น
- ถ้าลบ wallet ต้องจัดการ transaction ที่เกี่ยวข้องตามกติกาเดียวกับ server

### 3. Categories

- `create/update/delete`
- `enable/disable`
- `pin/unpin`
- `reorder`

ทั้งหมดต้องมี persistence ชัดเจนจาก DB ไม่ใช่ local mutate ก่อน

### 4. Companies

- `create/update/delete`
- `enable/disable`
- `pin/unpin`
- `reorder`

ทั้งหมดต้องเขียน DB ก่อนเหมือนกัน

### 5. Offline behavior

- ปุ่ม submit/edit/delete ต้อง block หรือ fail เร็วเมื่อ offline
- แสดงข้อความชัดเจนว่า action นี้ต้องใช้อินเทอร์เน็ต
- ไม่สร้าง pending change
- ไม่ retry อัตโนมัติจาก local queue

## Data architecture target

### Keep in DB

- transactions
- wallets
- categories
- companies
- category order / pinned / enabled state
- company order / pinned / enabled state
- wallet order / pinned state
- selected currency support if it is account-level behavior

### Keep local only

- theme
- language
- purely device-level UI preferences

### Reduce or remove from `app_state`

`app_state` ไม่ควรเป็นแหล่งหลักของข้อมูลการเงินอีกต่อไป

เป้าหมายคือค่อย ๆ ลดให้เหลือ

- transient migration fallback ชั่วคราว
- หรือ metadata/account snapshot ที่ไม่ใช่ transactional source of truth

## Implementation phases

## Phase 1 - Backend schema

เพิ่ม table ใหม่ใน Turso

- `wallets`
- `categories`
- `companies`
- `user_preferences` หรือแยก table ตามชนิด state ที่ต้อง persist

ข้อกำหนด schema

- ทุก table ต้องมี `owner_key`
- ทุก record ต้องมี stable id
- ทุก record ต้องมี `created_at` และ `updated_at`
- fields ที่ใช้ reorder/pinned/enabled ต้องถูก persist แบบอ่านกลับได้ตรง

ผลลัพธ์ของ phase นี้

- schema รองรับ wallet/category/company โดยไม่ต้องพึ่ง snapshot ทั้งก้อน

## Phase 2 - Server APIs

เพิ่ม API CRUD สำหรับ

- wallets
- categories
- companies

และ API สำหรับ preference state ที่เกี่ยวกับ

- reorder
- pin
- enable/disable
- currency support ถ้ายังเป็น account-level

หลักการของทุก endpoint

- ตรวจ auth
- ตรวจสิทธิ์ Pro ตาม policy ปัจจุบัน
- validate input
- เขียน DB
- คืน normalized payload กลับไปให้ client ใช้ทันที

ถ้า request fail

- ต้องตอบ error ชัดเจน
- ห้ามมี fallback ไปเขียน local ผ่าน API

## Phase 3 - Client composable refactor

รีแฟกเตอร์ `useMoneyNote`

- `addWallet`, `updateWallet`, `removeWallet` ให้เป็น async DB actions
- `addCategory`, `updateCategory`, `removeCategory` ให้เป็น async DB actions
- `addCompany`, `updateCompany`, `removeCompany` ให้เป็น async DB actions
- `set...Enabled`, `set...Pinned`, `move...` ให้ persist ผ่าน DB หรือ preference API ก่อน

หลักการ

- local state เปลี่ยนหลัง response สำเร็จเท่านั้น
- ถ้า fail ให้ throw error กลับหน้า UI
- ตัด logic ที่ mutate store แล้วค่อย `syncCloudNow()`

## Phase 4 - Page submit flow cleanup

ปรับหน้าเหล่านี้

- `pages/add.vue`
- `pages/wallets/index.vue`
- `pages/wallets/[id].vue`
- `pages/categories/index.vue`
- `pages/companies/index.vue`

ให้เปลี่ยนจาก

- call local mutation
- then `syncCloudNow()`

เป็น

- call async DB action
- handle success/error explicitly
- close modal หรือ redirect เมื่อสำเร็จเท่านั้น

## Phase 5 - Load and hydration flow

ตอนเปิดแอป

- โหลด wallets/categories/companies/preferences จาก DB โดยตรง
- โหลด transactions จาก DB โดยตรง
- ใช้ `app_state` ได้เฉพาะ migration fallback ชั่วคราวเท่านั้น

หลัง migration เสร็จ

- เอา fallback import จาก snapshot ออก
- ลดการพึ่ง `refreshCloudState()` สำหรับข้อมูลการเงินหลัก

## Phase 6 - Remove legacy local-first behavior

ลบหรือจำกัด behavior ต่อไปนี้

- snapshot sync ทั้งก้อนเป็นเส้นทางหลักของ money data
- local mutation ก่อน DB success
- implicit retry ผ่าน `syncCloudNow()` หลัง submit
- แนวคิด offline queue และ pending sync สำหรับ transactional data

## UI/UX requirements

เมื่อ offline

- ปุ่ม action สำคัญควรถูก disable หรือ fail พร้อมข้อความทันที
- ข้อความต้องสื่อว่า "ต้องออนไลน์เพื่อบันทึกข้อมูล"
- ห้ามทำให้ผู้ใช้เข้าใจว่าบันทึกสำเร็จแล้วทั้งที่ DB ยังไม่สำเร็จ

เมื่อ online แต่ DB fail

- แสดง error ชัดเจน
- modal/form ควรยังอยู่เพื่อให้ผู้ใช้แก้หรือกดใหม่
- ห้ามปิด form ก่อนสำเร็จ

## Migration plan

ย้ายข้อมูลเก่าจาก `app_state` ไป table ใหม่

ลำดับ

1. อ่าน snapshot เดิม
2. extract wallets/categories/companies/preferences
3. upsert เข้า table ใหม่
4. verify count และ fields สำคัญ
5. เปลี่ยน client ให้อ่านจาก table ใหม่
6. คง fallback ชั่วคราวช่วงเปลี่ยนผ่าน
7. ลบ fallback เมื่อยืนยันว่า migration เสถียร

migration ต้องเป็น `idempotent`

- run ซ้ำได้
- ไม่สร้าง record ซ้ำ
- ไม่ทำข้อมูลใหม่หาย

## Acceptance criteria

ถือว่างานเสร็จเมื่อ

- submit transaction ตอน offline ไม่สร้างข้อมูลใหม่ใน local store
- create wallet ตอน offline ไม่เพิ่ม wallet ใน UI ถ้า DB ไม่สำเร็จ
- create category ตอน offline ไม่เพิ่ม category ใน UI ถ้า DB ไม่สำเร็จ
- create company ตอน offline ไม่เพิ่ม company ใน UI ถ้า DB ไม่สำเร็จ
- ทุก create/update/delete ของ money data มาจาก DB response
- เปิดแอปใหม่แล้วข้อมูลหลักโหลดจาก DB ไม่ใช่จาก local snapshot
- ไม่มี offline queue สำหรับ transactional data

## Explicitly out of scope

- offline queue
- background retry queue
- optimistic UI สำหรับข้อมูลการเงินหลัก
- local-first conflict resolution สำหรับ money data

## First implementation order

ลำดับที่แนะนำสำหรับลงมือทำจริง

1. เพิ่ม schema wallets/categories/companies/preferences
2. เพิ่ม server APIs
3. รีแฟกเตอร์ `useMoneyNote` ให้ action เป็น async DB-first
4. ปรับหน้า submit/edit/delete ทั้งหมด
5. เพิ่ม offline guard และ error states
6. ทำ migration จาก `app_state`
7. ลบ fallback local-first ที่ไม่ต้องใช้แล้ว

