import { test, expect, type Page } from '@playwright/test';

const login = async ({ page }: { page: Page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password').click();
  await page.getByPlaceholder('password').fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Buka Proyek' }).first().click();
};

test('menekan tombol “Buat Tugas', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
});

test('menekan ikon (x) atau menekan diluar jendela dialog atau menekan tombol cancel', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByText('Detail Proyek').isVisible();
});

test('tidak mengisi field judul pada formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Please fill out this field.').isVisible();
});

test('tidak mengisi field Deskripsi dan URL atau salah satunya pada formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.locator('[data-bits-calendar-next-button]').click();
  await page.getByLabel('Saturday, May 24,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:20');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Tugas berhasil ditambahkan').isVisible();
});

test('mengisi field URL alias tetapi tidak mengisi field URL dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas2');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.locator('[data-bits-calendar-next-button]').click();
  await page.getByLabel('Saturday, May 24,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:20');
  await page.getByPlaceholder('Nama tampilan untuk URL').click();
  await page.getByPlaceholder('Nama tampilan untuk URL').fill('testtugasurl');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Tugas berhasil ditambahkan').isVisible();
});

test('tidak mengisi field tanggal dan waktu atau salah satunya pada formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas3');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Deadline tugas (tanggal dan waktu) harus diisi').isVisible();
});

test('mengisi field tanggal dan waktu pada masa lampau pada formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas4');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.locator('[data-bits-calendar-prev-button]').click();
  await page.getByLabel('Friday, March 28,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:20');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Deadline tugas harus di masa depan').isVisible();
});

test('mengisi formulir dengan data valid dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buat Tugas' }).click();
  await expect(page.getByRole('heading', { name: 'Buat Tugas Baru' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas5');
  await page.getByPlaceholder('Deskripsi').click();
  await page.getByPlaceholder('Deskripsi').fill('deskripsi testtugas5');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.locator('[data-bits-calendar-next-button]').click();
  await page.getByLabel('Saturday, May 24,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:20');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Tugas berhasil ditambahkan').isVisible();
});

test('menekan ikon titik tiga (...) pada kolom tugas', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Set Status' })).toBeVisible();
});

test('menekan opsi edit', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Tugas' })).toBeVisible();
});
  
test('mengedit formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Tugas' })).toBeVisible();
  await page.getByPlaceholder('Judul Tugas').click();
  await page.getByPlaceholder('Judul Tugas').fill('testtugas6');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Tugas berhasil diperbarui').isVisible();
});

test('menekan opsi delete', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Tugas akan dihapus' })).toBeVisible();
});

test('menekan tombol cancel atau menekan diluar dialog', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Tugas akan dihapus' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByText('Detail Proyek').isVisible();
});

test('menekan tombol delete', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Tugas akan dihapus' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByText('Tugas berhasil dihapus').isVisible();
});

test('menekan opsi set status pada dropdown', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Set Status' }).click();
  await expect(page.getByRole('menuitemradio', { name: 'Todo' })).toBeVisible();
});

test('menekan salah satu opsi status', async ({ page }) => {
  await login({ page });
  await page.getByRole('cell', { name: 'dots horizontal, Open Menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Set Status' }).click();
  await page.getByRole('menuitemradio', { name: 'Todo' }).click();
  await page.getByText('Todo', { exact: true }).isVisible();
});

test('menginput kata kunci yang valid pada search bar', async ({ page }) => {
  await login({ page });
  await page.getByRole('searchbox', { name: 'Filter tasks...' }).first().click();
  await page.getByRole('searchbox', { name: 'Filter tasks...' }).first().fill('testtugas');
  await page.getByText('testtugas').isVisible();
});

test('menginput kata kunci yang tidak valid pada search bar', async ({ page }) => {
  await login({ page });
  await page.getByRole('searchbox', { name: 'Filter tasks...' }).first().click();
  await page.getByRole('searchbox', { name: 'Filter tasks...' }).first().fill('testtugas7hhh');
  await page.getByRole('cell', { name: 'Tidak ada tugas yang sesuai dengan filter' }).isVisible();
});

test('menekan salah satu header kolom tabel tugas', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Prioritas caret sort,' }).click();
  await page.getByRole('menuitem', { name: 'arrow up, Asc' }).isVisible();
  await page.getByRole('menuitem', { name: 'arrow down, Desc' }).isVisible();
});

test('menekan salah satu opsi pengurutan', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Prioritas caret sort,' }).click();
  await page.getByRole('menuitem', { name: 'arrow up, Asc' }).click();
  await page.getByRole('button', { name: 'Prioritas arrow up,' }).isVisible();
});

test('menekan tombol home pada breadcrumb', async ({ page }) => {
  await login({ page });
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByText('Dashboard').isVisible();
});

