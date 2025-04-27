import { test, expect, type Page } from '@playwright/test';

const login = async ({ page }: { page: Page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password').click();
  await page.getByPlaceholder('password').fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'U', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
};

test('menekan tombol “Edit Profil”', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Profil' })).toBeVisible();
});

test('menekan ikon (x) atau menekan diluar jendela dialog', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('heading', { name: 'Aktivitas Terbaru' }).isVisible();
});

test('mengosongkan field username dan menekan tombol save changes', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Username').clear();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Nama tidak boleh kosong').isVisible();
});

test('mengisi field username dan menekan tombol save changes', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Username').fill('testdev2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Profil berhasil diperbarui').isVisible();
});

test('field new password dan field confirm password tidak memiliki inputan yang sama', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Current Password').fill('testdev123');
  await page.getByLabel('New Password').fill('testdev2');
  await page.getByLabel('Confirm Password').fill('testdev3');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Password baru dan konfirmasi tidak sesuai').isVisible();
});

test('mengisi field password kurang dari delapan karakter', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Current Password').fill('testdev123');
  await page.getByLabel('New Password').fill('testdev');
  await page.getByLabel('Confirm Password').fill('testdev');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Password baru harus memiliki minimal 8 karakter').isVisible();
});

test('tidak mengisi field new password tapi mengisi field confirm password dan menekan tombol save changes', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Current Password').fill('testdev123');
  await page.getByLabel('Confirm Password').fill('testdev2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Password baru tidak boleh kosong').isVisible();
});

test('mengisi field current password tidak valid', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Current Password').fill('testdev2');
  await page.getByLabel('New Password').fill('testdev3');
  await page.getByLabel('Confirm Password').fill('testdev3');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Password saat ini tidak valid').isVisible();
});

test('mengisi field current password, new password, dan confirm password dengan data yang valid', async ({ page }) => {
  await login({ page });
  await page.getByRole('button', { name: 'Edit Profil' }).click();
  await page.getByLabel('Current Password').fill('testdev123');
  await page.getByLabel('New Password').fill('testdev123');
  await page.getByLabel('Confirm Password').fill('testdev123');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Profil berhasil diperbarui').isVisible();
});

test('menekan tab “Detail Akun”', async ({ page }) => {
  await login({ page });
  await page.getByRole('tab', { name: 'Detail Akun' }).click();
  await expect(page.getByRole('heading', { name: 'Username' })).toBeVisible();
});

test('menekan tab “Aktivitas Terkini”', async ({ page }) => {
  await login({ page });
  await page.getByRole('tab', { name: 'Aktivitas Terkini' }).click();
  await expect(page.getByRole('heading', { name: 'Aktivitas Terkini' })).toBeVisible();
});

test('menekan tombol home pada breadcrumb', async ({ page }) => {
  await login({ page });
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByText('Dashboard').isVisible();
});
