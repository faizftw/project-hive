import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request, locals }) => {
  // Pastikan pengguna sudah login
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, currentPassword, newPassword } = data;

    // Validasi input
    if (!name || name.trim() === '') {
      return json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
    }

    // Siapkan data yang akan diupdate
    const updateData: { name: string; password?: string } = {
      name
    };

    // Jika ada permintaan untuk mengubah password
    if (newPassword) {
      if (!currentPassword) {
        return json({ error: 'Password saat ini diperlukan untuk mengubah password' }, { status: 400 });
      }

      // Ambil user untuk verifikasi password
      const user = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { password: true }
      });

      if (!user) {
        return json({ error: 'User tidak ditemukan' }, { status: 404 });
      }

      // Verifikasi password saat ini
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return json({ error: 'Password saat ini tidak valid' }, { status: 400 });
      }

      // Enkripsi password baru
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update data pengguna
    const updatedUser = await prisma.user.update({
      where: { id: locals.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Format tanggal join
    const formattedUser = {
      ...updatedUser,
      joinDate: updatedUser.createdAt.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    };

    // Hilangkan createdAt dari response
    const { createdAt, ...userResponse } = formattedUser;

    return json({
      message: 'Profil berhasil diperbarui',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}; 