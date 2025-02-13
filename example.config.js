/**
- PERINGATAN: PROYEK INI DILINDUNGI OLEH HAK CIPTA DAN LISENSI ISC
- 
- Made by: Dani Technology (Full Stack Engineer)
- Created on: January 10, 2025
- 
- KONTAK DEVELOPER:
-     - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
-     - Email: dani.technology.id@gmail.com
-     - GitHub: https://github.com/dani-techno
- 
- PERINGATAN:
-     - Anda tidak boleh mengklaim proyek ini sebagai milik Anda sendiri.
-     - Anda tidak boleh menjual proyek ini tanpa izin tertulis dari pemilik hak cipta.
-     - Anda tidak boleh mengubah atau menghapus atribusi hak cipta dari proyek ini.
- 
- KONSEKUENSI PELANGGARAN:
-     - Ganti rugi atas pelanggaran hak cipta sebesar Rp 1.000.000.000 (satu miliar rupiah) atau lebih.
-     - Penghentian penggunaan proyek ini dan semua derivatifnya.
-     - Tindakan hukum lainnya yang sesuai, termasuk tuntutan pidana dan perdata.
- 
- DENGAN MENGGUNAKAN PROYEK INI, ANDA MENYATAKAN BAHWA ANDA TELAH MEMBACA, MEMAHAMI, DAN MENYETUJUI SYARAT-SYARAT LISENSI DAN HAK CIPTA INI.
*/

module.exports = {
	pairing_mode: true,
	//prefix: '.', // Delete or disable section code "prefix: '?'," if the bot does not want to use prefix.
	chat_mode: 'default', // default/self/private/group
	connection_status_message: false,
	only_show_command_chat: false,
	group_member_status_message: false,
	bot_offline_status: false,
	automatic_read_messages: true,
	automatic_update_profile_status: [false, "Status"],
	automatic_typing_or_recording: [true, "typing"], // typing/recording
	owner_number: '6282320667363',
	owner_name: 'Dani Techno',
	bot_name: 'Forest Bot',
	api: {
		base_url: 'https://forestapi.web.id', // Do not change this URL.
    	secret_key: 'sk-danitechno',
    	wd_balance: {
    		bank_code: 'DANA',
    		owner_name: 'DANI RAMDANI',
    		destination_number: '082320667363',
    		email: 'daniramdani310807@gmail.com'
    	},
    	profit: 2 // This value will be divided by 100 and divided according to the product price.
    }
};
