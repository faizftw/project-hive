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
      return json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    // Siapkan data yang akan diupdate
    const updateData: { name: string; password?: string } = {
      name
    };

    if (!newPassword && data.confirmPassword) {
      return json({ error: 'New password is required when confirmation is provided' }, { status: 400 });
    }

    // Jika ada permintaan untuk mengubah password
    if (newPassword) {
      if (!currentPassword) {
        return json({ error: 'Current password is required to change password' }, { status: 400 });
      }
      
      // Validasi kekuatan password baru
      if (newPassword.length < 8) {
        return json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }
      
      // Validasi konfirmasi password jika dikirim dari client
      if (data.confirmPassword && data.confirmPassword !== newPassword) {
        return json({ error: 'New password and confirmation do not match' }, { status: 400 });
      }
    
      // Ambil user untuk verifikasi password
      const user = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { password: true }
      });

      if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Verify current password
		const validPassword = await bcrypt.compare(currentPassword, user.password);
		if (!validPassword) {
        return json({ error: 'Current password is invalid' }, { status: 400 });
		}

		// Check if new password is the same as old password
		const isSameAsOld = await bcrypt.compare(newPassword, user.password);
		if (isSameAsOld) {
        return json({ error: 'New password cannot be the same as old password' }, { status: 400 });
      }
    
      // Encrypt new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user data
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
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
		console.error('Error updating profile:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
}; 