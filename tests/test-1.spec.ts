import { test, expect } from '@playwright/test';

test('Mengakses halaman yang memerlukan autentikasi tanpa login', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/main');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Project Hive/);
});


test('Menekan tombol "Mulai" pada halaman beranda', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/');
  await page.getByRole('button', { name: 'Mulai' }).click();
  
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page).toHaveURL(/.*\/login/);
})

test('Menekan tombol "sign up" pada halaman login', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  
  await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
  await expect(page).toHaveURL(/.*\/signup/);
})

test('menekan tombol sign up pada halaman sign up tanpa mengisi seluruh atau salah satu field', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  const emailInput = page.getByPlaceholder('name@example.com').or(page.locator('input[type="email"]'));
  const validationMessage = await emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);
  expect(validationMessage).toContain('Please fill in this field.');
})

test('mengisi format nama email yang tidak valid pada field email halaman sign up', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('getuserr@email');
  await page.getByPlaceholder('username').click();
  await page.getByPlaceholder('username').fill('testuserr');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).fill('12345678');
  await page.getByPlaceholder('confirm password').click();
  await page.getByPlaceholder('confirm password').fill('12345678');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByText('Format email tidak valid').isVisible();
})

test('mengisi email yang sudah terdaftar pada field email halaman sign up', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('username').click();
  await page.getByPlaceholder('username').press('ControlOrMeta+a');
  await page.getByPlaceholder('username').fill('testuser');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).press('ControlOrMeta+a');
  await page.getByPlaceholder('password', { exact: true }).fill('12345678');
  await page.getByPlaceholder('confirm password').click();
  await page.getByPlaceholder('confirm password').fill('1234568');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByText('Email sudah terdaftar').isVisible();
})

test('mengisi field password kurang dari 8 karakter pada halaman sign up', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev43@gmail.com');
  await page.getByPlaceholder('username').click();
  await page.getByPlaceholder('username').press('ControlOrMeta+a');
  await page.getByPlaceholder('username').fill('testuser');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).fill('12345');
  await page.getByPlaceholder('confirm password').click();
  await page.getByPlaceholder('confirm password').fill('12345');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByText('Password harus memiliki minimal 8 karakter').isVisible();
})

test('mengisi field password dan confirm password tidak sama pada halaman sign up ', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev43@gmail.com');
  await page.getByPlaceholder('username').click();
  await page.getByPlaceholder('username').fill('testuser');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).press('ControlOrMeta+a');
  await page.getByPlaceholder('password', { exact: true }).fill('12345678');
  await page.getByPlaceholder('confirm password').click();
  await page.getByPlaceholder('confirm password').fill('12345768');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByText('Password tidak sesuai').isVisible();
})

test('mengisi formulir registrasi dengan valid dan menekan tombol sign up', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/signup');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev66df88@gmail.com');
  await page.getByPlaceholder('username').click();
  await page.getByPlaceholder('username').fill('testuser6fd622');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).press('ControlOrMeta+a');
  await page.getByPlaceholder('password', { exact: true }).fill('12345678');
  await page.getByPlaceholder('confirm password').click();
  await page.getByPlaceholder('confirm password').fill('12345678');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await expect(page).toHaveURL(/.*\/login/);
})

test('menekan tombol login pada halaman login tanpa mengisi seluruh atau salah satu field formulir login.', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByRole('button', { name: 'Login' }).click();
  const emailInput = page.getByPlaceholder('name@example.com').or(page.locator('input[type="email"]'));
  const validationMessage = await emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);
  expect(validationMessage).toContain('Please fill in this field.');
})

test('menginput email atau password yang tidak valid pada halaman login.', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('getuserr@email');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).fill('12345678');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Email atau password tidak valid').isVisible();
})

test('menginput email atau password yang valid pada halaman login.', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password', { exact: true }).click();
  await page.getByPlaceholder('password', { exact: true }).fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Dashboard').isVisible();
})

test('menekan ikon pengguna pada halaman dashbord.', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password').click();
  await page.getByPlaceholder('password').fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'U', exact: true }).click();
  await page.getByText('Profile').isVisible();
})

test('Pengguna menekan opsi logout.', async ({ page }) => {
  await page.goto('https://project-hive-psi.vercel.app/auth/login');
  await page.getByPlaceholder('name@example.com').click();
  await page.getByPlaceholder('name@example.com').fill('testdev@gmail.com');
  await page.getByPlaceholder('password').click();
  await page.getByPlaceholder('password').fill('testdev123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'U', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Log Out' }).click();
  await page.getByText('Login').isVisible();
})


