import { test, expect, type Page } from '@playwright/test';

const login = async ({ page }: { page: Page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password').click();
  await page.getByPlaceholder('password').fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
};

test('menekan tombol “Buat Proyek” pada dashboard.', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await expect(page.getByRole('heading', { name: 'Buat Proyek Baru' })).toBeVisible();
});

test('menekan ikon ‘x’ atau menekan diluar jendela dialog.', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await expect(page.getByRole('heading', { name: 'Buat Proyek Baru' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByText('Dashboard').isVisible();
});

test('tidak mengisi field Nama pada formulir dan menekan tombol “Buat Proyek”.', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await page.getByLabel('Buat Proyek Baru').getByRole('button', { name: 'Buat Proyek' }).click();
  await page.getByText('Please fill out this field.').isVisible();
});

test('tidak mengisi field Deskripsi pada formulir dan menekan tombol “Buat Proyek”.', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await page.getByPlaceholder('Nama Proyek').click();
  await page.getByPlaceholder('Nama Proyek').fill('testproyek');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.getByLabel('Next').click();
  await page.getByLabel('Next').click();
  await page.getByLabel('Monday, June 30,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:22');
  await page.getByLabel('Buat Proyek Baru').getByRole('button', { name: 'Buat Proyek' }).click();
  await page.getByText('Proyek berhasil dibuat').isVisible();
});

test('tidak mengisi field tanggal dan waktu atau salah satunya pada formulir', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await page.getByPlaceholder('Nama Proyek').click();
  await page.getByPlaceholder('Nama Proyek').fill('testproyek2');
  await page.getByLabel('Buat Proyek Baru').getByRole('button', { name: 'Buat Proyek' }).click();
  await page.getByText('Tanggal dan waktu deadline proyek wajib diisi').isVisible();
});

test('mengisi field tanggal dan waktu pada masa lampau pada formulir dan menekan tombol “Buat Proyek”.', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await page.getByPlaceholder('Nama Proyek').click();
  await page.getByPlaceholder('Nama Proyek').fill('testproyek3');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.getByLabel('Thursday, April 24,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:22');
  await page.getByLabel('Buat Proyek Baru').getByRole('button', { name: 'Buat Proyek' }).click();
  await page.getByText('Deadline tidak boleh di masa lalu').isVisible();
});

test('mengisi formulir dengan data valid dan menekan tombol “Buat Proyek”', async ({ page }) => {
  await login({ page });
  await page.getByLabel('Buat Proyek').click();
  await page.getByPlaceholder('Nama Proyek').click();
  await page.getByPlaceholder('Nama Proyek').fill('testproyek4');
  await page.getByPlaceholder('Deskripsi').click();
  await page.getByPlaceholder('Deskripsi').fill('deskripsi testproyek4');
  await page.getByRole('button', { name: 'Pilih Tanggal' }).click();
  await page.getByLabel('Next').click();
  await page.getByLabel('Next').click();
  await page.getByLabel('Monday, June 30,').click();
  await page.getByRole('button', { name: 'Pilih Waktu' }).click();
  await page.locator('input[type="time"]').fill('22:22');
  await page.getByLabel('Buat Proyek Baru').getByRole('button', { name: 'Buat Proyek' }).click();
  await page.getByText('Proyek berhasil dibuat').isVisible();
});

test('menekan ikon titik tiga (...) pada kartu proyek', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).isVisible();
  await page.getByRole('menuitem', { name: 'Delete' }).isVisible();
});

test('menekan opsi edit', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Proyek' })).toBeVisible();
});

test('menekan tombol cancel atau ikon “x” atau diluar dialog', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Proyek' })).toBeHidden();
});

test('mengedit formulir dan menekan tombol save', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();
  await page.getByPlaceholder('Nama Proyek').fill('testproyekedited');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Proyek berhasil diperbarui')).toBeVisible();
});

test('menekan opsi delete pada dropdown', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
});

test('menekan tombol cancel atau menekan diluar dialog', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Delete' })).toBeHidden();
});

test('menekan tombol delete pada dialog', async ({ page }) => {
  await login({ page });
  await page.locator('[aria-label="dots horizontal,"]').first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Project berhasil dihapus')).toBeVisible();
});

test('menekan tombol “Buka proyek” pada salah satu kartu proyek', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Buka Proyek' }).first().click();
  await expect(page.getByRole('heading', { name: 'Detail Proyek' })).toBeVisible();
});

test('menginput kata kunci yang valid pada search bar', async ({ page }) => {
  await login({ page });
  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('project 2');
  await expect(page.getByRole('heading', { name: 'test project 2' })).toBeVisible();
});

test('menginput kata kunci yang tidak valid pada search bar', async ({ page }) => {
  await login({ page });
  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('project 3');
  await expect(page.getByRole('heading', { name: 'project 3' })).toBeHidden(); 
});
  
test('menekan tab recent task pada tabel task overview', async ({ page }) => {
  await login({ page });
  await page.getByRole('tab', { name: 'Recent Task' }).click();
  await expect(page.locator('button[role="tab"][data-state="active"]:has-text("Recent Task")')).toBeVisible();
});

test('menekan tab upcoming deadline pada tabel task overview', async ({ page }) => {
  await login({ page });
  await page.getByRole('tab', { name: 'Upcoming Deadline' }).click();
  await expect(page.locator('button[role="tab"][data-state="active"]:has-text("Upcoming Deadline")')).toBeVisible();
});

test('menekan ikon dark mode', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'sun, moon, Toggle theme' }).click();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});

test('menekan opsi profile', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'U', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await expect(page.getByRole('button', { name: 'Edit Profil' })).toBeVisible();
});