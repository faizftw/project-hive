import {ArrowDown, ArrowRight, ArrowUp, CheckCircled, Circle, CrossCircled, QuestionMarkCircled, Stopwatch, Pause, CounterClockwiseClock } from 'svelte-radix';



export const labels = [
	{
		value: 'bug',
		label: 'Bug'
	},
	{
		value: 'feature',
		label: 'Feature'
	},
	{
		value: 'documentation',
		label: 'Documentation'
	},
	{
		value: 'general',
		label: 'General'
	},
	// Academic Labels
	{
		value: 'uts',
		label: 'UTS'
	},
	{
		value: 'uas',
		label: 'UAS'
	},
	{
		value: 'tugas-harian',
		label: 'Tugas Harian'
	},
	{
		value: 'praktikum',
		label: 'Praktikum'
	},
	{
		value: 'skripsi',
		label: 'Skripsi'
	},
	{
		value: 'presentasi',
		label: 'Presentasi'
	},
	{
		value: 'laporan',
		label: 'Laporan'
	},
	{
		value: 'quiz',
		label: 'Quiz'
	}
];

// Academic Task Templates
export const academicTemplates = [
	{
		id: 'uts',
		name: 'UTS (Ujian Tengah Semester)',
		icon: '📝',
		template: {
			title: 'UTS [Nama Mata Kuliah]',
			description: 'Persiapan Ujian Tengah Semester\n\n📚 Checklist Persiapan:\n• Review materi perkuliahan\n• Buat rangkuman materi\n• Latihan soal-soal\n• Diskusi dengan teman\n• Persiapan alat tulis\n\n🎯 Target: Memahami 80% materi yang diujikan',
			priority: 'High',
			status: 'Todo',
			label: 'uts'
		}
	},
	{
		id: 'uas',
		name: 'UAS (Ujian Akhir Semester)',
		icon: '🎓',
		template: {
			title: 'UAS [Nama Mata Kuliah]',
			description: 'Persiapan Ujian Akhir Semester\n\n📚 Checklist Persiapan:\n• Review seluruh materi semester\n• Buat mind map materi\n• Latihan soal UTS + materi baru\n• Study group dengan teman\n• Persiapan mental dan fisik\n\n🎯 Target: Mencapai nilai A',
			priority: 'High',
			status: 'Todo',
			label: 'uas'
		}
	},
	{
		id: 'tugas-harian',
		name: 'Tugas Harian',
		icon: '📋',
		template: {
			title: 'Tugas [Nama Mata Kuliah] - [Topik]',
			description: 'Tugas harian mata kuliah\n\n📝 Detail Tugas:\n• Baca materi terkait\n• Kerjakan soal/pertanyaan\n• Review jawaban\n• Submit sebelum deadline\n\n💡 Tips: Mulai mengerjakan segera setelah tugas diberikan',
			priority: 'Medium',
			status: 'Todo',
			label: 'tugas-harian'
		}
	},
	{
		id: 'praktikum',
		name: 'Praktikum',
		icon: '🔬',
		template: {
			title: 'Praktikum [Nama Mata Kuliah] - [Modul]',
			description: 'Praktikum dan Laporan\n\n🔬 Checklist Praktikum:\n• Persiapan pre-test\n• Baca modul praktikum\n• Siapkan alat dan bahan\n• Lakukan percobaan\n• Catat hasil observasi\n• Buat laporan praktikum\n• Submit laporan\n\n📊 Format Laporan: Sesuai template yang diberikan',
			priority: 'Medium',
			status: 'Todo',
			label: 'praktikum'
		}
	},
	{
		id: 'skripsi',
		name: 'Skripsi/Tugas Akhir',
		icon: '🎯',
		template: {
			title: 'Skripsi - [Milestone/Bab]',
			description: 'Progress Skripsi/Tugas Akhir\n\n📖 Milestone Skripsi:\n• Proposal penelitian\n• Literature review\n• Metodologi penelitian\n• Implementasi/Eksperimen\n• Analisis hasil\n• Penulisan laporan\n• Persiapan sidang\n\n🎯 Target: Selesai tepat waktu dengan kualitas terbaik',
			priority: 'High',
			status: 'Todo',
			label: 'skripsi'
		}
	},
	{
		id: 'presentasi',
		name: 'Presentasi',
		icon: '🎤',
		template: {
			title: 'Presentasi [Mata Kuliah] - [Topik]',
			description: 'Persiapan Presentasi\n\n🎤 Checklist Presentasi:\n• Riset materi presentasi\n• Buat outline presentasi\n• Siapkan slide PowerPoint\n• Latihan presentasi\n• Persiapan Q&A\n• Cek teknis (laptop, proyektor)\n\n⏰ Durasi: [X] menit\n👥 Audience: [Dosen/Mahasiswa]',
			priority: 'Medium',
			status: 'Todo',
			label: 'presentasi'
		}
	},
	{
		id: 'laporan',
		name: 'Laporan',
		icon: '📄',
		template: {
			title: 'Laporan [Mata Kuliah] - [Jenis Laporan]',
			description: 'Pembuatan Laporan\n\n📄 Struktur Laporan:\n• Cover dan identitas\n• Abstrak/Ringkasan\n• Pendahuluan\n• Isi/Pembahasan\n• Kesimpulan\n• Daftar Pustaka\n• Lampiran (jika ada)\n\n✅ Checklist: Format, grammar, referensi, plagiarisme',
			priority: 'Medium',
			status: 'Todo',
			label: 'laporan'
		}
	},
	{
		id: 'quiz',
		name: 'Quiz/Kuis',
		icon: '❓',
		template: {
			title: 'Quiz [Mata Kuliah] - [Materi]',
			description: 'Persiapan Quiz\n\n❓ Persiapan Quiz:\n• Review materi yang akan diujikan\n• Buat catatan penting\n• Latihan soal serupa\n• Pahami konsep dasar\n• Siapkan strategi mengerjakan\n\n⏰ Durasi: Biasanya 15-30 menit\n📝 Tips: Baca soal dengan teliti',
			priority: 'Medium',
			status: 'Todo',
			label: 'quiz'
		}
	}
];

export const statuses = [
	{
		value: 'Backlog',
		label: 'Backlog',
		icon: QuestionMarkCircled
	},
	{
		value: 'Pending',
		label: 'Pending',
		icon: QuestionMarkCircled
	},
	{
		value: 'Todo',
		label: 'Todo',
		icon: Circle
	},
	{
		value: 'In Progress',
		label: 'In Progress',
		icon: Stopwatch
	},
	{
		value: 'Overdue',
		label: 'Overdue',
		icon: CounterClockwiseClock
	},
	{
		value: 'Completed',
		label: 'Completed',
		icon: CheckCircled
	},
	{
		value: 'Canceled',
		label: 'Canceled',
		icon: CrossCircled
	}
];

export const priorities = [
	{
		label: 'Low',
		value: 'Low',
		icon: ArrowDown
	},
	{
		label: 'Medium',
		value: 'Medium',
		icon: ArrowRight
	},
	{
		label: 'High',
		value: 'High',
		icon: ArrowUp
	}
];
