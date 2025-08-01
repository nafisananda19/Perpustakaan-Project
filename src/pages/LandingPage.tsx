//import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  Star,
  ArrowRight,
  CheckCircle,
  Calendar,
  Award,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const services = [
    {
      icon: BookOpen,
      title: "Koleksi Buku Lengkap",
      description: "Ribuan buku dari berbagai kategori untuk semua kalangan"
    },
    {
      icon: Search,
      title: "Sistem Pencarian Digital",
      description: "Temukan buku yang Anda cari dengan mudah melalui katalog online"
    },
    {
      icon: Users,
      title: "Ruang Baca Nyaman",
      description: "Area baca yang tenang dan kondusif untuk pembelajaran"
    },
    {
      icon: Calendar,
      title: "Program Literasi",
      description: "Berbagai kegiatan dan workshop untuk meningkatkan minat baca"
    }
  ];

  const stats = [
    { number: "50,000+", label: "Koleksi Buku" },
    { number: "10,000+", label: "Anggota Aktif" },
    { number: "25+", label: "Tahun Berdiri" },
    { number: "100+", label: "Program Literasi" }
  ];

  const testimonials = [
    {
      name: "Sarah Putri",
      role: "Mahasiswa",
      content: "Rumah Lebah Ilmu Dhuawar adalah tempat favorit saya untuk belajar. Koleksi bukunya lengkap dan suasananya sangat mendukung untuk fokus.",
      rating: 5
    },
    {
      name: "Ahmad Rahman",
      role: "Dosen",
      content: "Perpustakaan ini benar-benar menjadi rumah kedua bagi para pencinta ilmu. Fasilitasnya modern dan pelayanannya sangat baik.",
      rating: 5
    },
    {
      name: "Fatimah Ali",
      role: "Peneliti",
      content: "Sistem digital yang canggih memudahkan saya dalam mencari referensi. Staf perpustakaan juga sangat membantu.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Rumah Lebah Ilmu Dhuawar</span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-amber-600 transition-colors">Beranda</a>
              <a href="#about" className="text-gray-700 hover:text-amber-600 transition-colors">Tentang</a>
              <a href="#services" className="text-gray-700 hover:text-amber-600 transition-colors">Layanan</a>
              <a href="#testimonials" className="text-gray-700 hover:text-amber-600 transition-colors">Testimoni</a>
              <a href="#contact" className="text-gray-700 hover:text-amber-600 transition-colors">Kontak</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate("/login")} className="text-gray-700 hover:text-amber-600 transition-colors font-medium">
                Masuk
              </button>
              <button onClick={() => navigate("/register")} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105">
                Daftar
              </button>
            </div>

            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors">Beranda</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors">Tentang</a>
              <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors">Layanan</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors">Testimoni</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors">Kontak</a>
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-amber-600 transition-colors font-medium">
                  Masuk
                </button>
                <button className="block w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all">
                  Daftar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-amber-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Selamat Datang di
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                Rumah Lebah Ilmu Dhuawar
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Perpustakaan modern yang menyediakan akses ke ribuan koleksi buku dan fasilitas pembelajaran terbaik
              untuk mengembangkan pengetahuan dan keterampilan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Jelajahi Koleksi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-amber-500 text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-all">
                Daftar Keanggotaan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tentang Rumah Lebah Ilmu Dhuawar
              </h2>
              <p className="text-gray-600 mb-6">
                Berdiri sejak tahun 1999, Rumah Lebah Ilmu Dhuawar telah menjadi pusat pembelajaran dan
                pengembangan intelektual bagi masyarakat. Kami berkomitmen untuk menyediakan akses yang
                mudah dan berkualitas terhadap informasi dan pengetahuan.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Koleksi Terkurasi</h3>
                    <p className="text-gray-600">Buku-buku pilihan dari berbagai bidang ilmu pengetahuan</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Teknologi Modern</h3>
                    <p className="text-gray-600">Sistem digital terintegrasi untuk kemudahan akses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Komunitas Pembelajar</h3>
                    <p className="text-gray-600">Lingkungan yang mendukung pertukaran ide dan pengetahuan</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Visi Kami</h3>
                    <p className="text-gray-600">
                      Menjadi pusat pembelajaran yang menginspirasi dan memberdayakan masyarakat melalui akses pengetahuan yang berkualitas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai fasilitas dan layanan terbaik untuk mendukung kegiatan pembelajaran dan penelitian Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Testimoni dari para pengunjung yang telah merasakan manfaat layanan kami.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hubungi Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Silakan hubungi kami untuk informasi lebih lanjut atau kunjungi perpustakaan kami.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-gray-900 font-medium">Alamat</p>
                    <p className="text-gray-600">Jl. Ilmu Pengetahuan No. 123, Dhuawar, Indonesia</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-gray-900 font-medium">Telepon</p>
                    <p className="text-gray-600">+62 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-gray-900 font-medium">Email</p>
                    <p className="text-gray-600">info@rumahlebahilmu.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-gray-900 font-medium">Jam Buka</p>
                    <p className="text-gray-600">Senin - Jumat: 08:00 - 20:00</p>
                    <p className="text-gray-600">Sabtu - Minggu: 09:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Kirim Pesan</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masukkan email Anda"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Tulis pesan Anda di sini"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105"
                >
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Rumah Lebah Ilmu Dhuawar</span>
              </div>
              <p className="text-gray-400">
                Perpustakaan modern yang menyediakan akses ke pengetahuan berkualitas untuk semua kalangan.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Peminjaman Buku</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Ruang Baca</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Penelitian</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Workshop</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Tentang</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Sejarah</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Visi & Misi</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Tim Kami</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Karir</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-400">
                <p>Jl. Ilmu Pengetahuan No. 123</p>
                <p>Dhuawar, Indonesia</p>
                <p>+62 123 456 789</p>
                <p>info@rumahlebahilmu.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center">
              <span>© 2024 Rumah Lebah Ilmu Dhuawar. Dibuat dengan</span>
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              <span>untuk kemajuan pendidikan.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
