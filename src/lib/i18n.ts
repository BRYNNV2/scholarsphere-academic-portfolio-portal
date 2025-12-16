import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    common: {
                        home: "Home",
                        directory: "Directory",
                        publications: "Publications",
                        projects: "Projects",
                        portfolio: "Portfolio",
                        dashboard: "Dashboard",
                        login: "Login",
                        logout: "Logout",
                        register: "Register",
                        getStarted: "Get Started",
                        viewProfile: "View Profile",
                        adminDashboard: "Admin Dashboard",
                        viewPublicPage: "View public page",
                    },
                    home: {
                        heroTitle: "Showcase Your",
                        heroTitleHighlight: "Academic Legacy",
                        heroDescription: "ScholarSphere provides a beautiful, centralized platform for academics to manage and display their professional portfolios with the world.",
                        exploreDirectory: "Explore Directory",
                        whyTitle: "Why ScholarSphere?",
                        whySubtitle: "Everything you need to build a compelling academic presence online.",
                        feature1Title: "Centralized Portfolio",
                        feature1Desc: "Consolidate your publications, research, and projects into one elegant, professional profile.",
                        feature2Title: "Global Visibility",
                        feature2Desc: "Increase your reach and impact by making your work discoverable to a global audience of peers and institutions.",
                        feature3Title: "Effortless Management",
                        feature3Desc: "Our intuitive dashboard makes it simple to add, edit, and organize your academic achievements.",
                        featuredLecturers: "Featured Lecturers",
                        featuredLecturersDesc: "Discover the brilliant minds shaping the future of academia.",
                        ctaTitle: "Ready to Build Your Legacy?",
                        ctaDesc: "Join ScholarSphere today and create a professional portfolio that truly represents your academic contributions and expertise.",
                        createPortfolio: "Create Your Portfolio",
                    },
                    footer: {
                        tagline: "An elegant, modern, and scalable web platform for academics.",
                        navigation: "Navigation",
                        legal: "Legal",
                        terms: "Terms of Service",
                        privacy: "Privacy Policy",
                        connect: "Connect",
                        copyright: "ScholarSphere. Built with Team Kelompok 1."
                    }
                }
            },
            id: {
                translation: {
                    common: {
                        home: "Beranda",
                        directory: "Direktori",
                        publications: "Publikasi",
                        projects: "Proyek",
                        portfolio: "Portofolio",
                        dashboard: "Dashboard",
                        login: "Masuk",
                        logout: "Keluar",
                        register: "Daftar",
                        getStarted: "Mulai Sekarang",
                        viewProfile: "Lihat Profil",
                        adminDashboard: "Dashboard Admin",
                        viewPublicPage: "Lihat halaman publik",
                    },
                    home: {
                        heroTitle: "Tunjukkan",
                        heroTitleHighlight: "Warisan Akademik Anda",
                        heroDescription: "ScholarSphere menyediakan platform terpusat yang indah bagi akademisi untuk mengelola dan menampilkan portofolio profesional mereka kepada dunia.",
                        exploreDirectory: "Jelajahi Direktori",
                        whyTitle: "Mengapa ScholarSphere?",
                        whySubtitle: "Segala yang Anda butuhkan untuk membangun kehadiran akademik yang menarik secara online.",
                        feature1Title: "Portofolio Terpusat",
                        feature1Desc: "Konsolidasikan publikasi, penelitian, dan proyek Anda menjadi satu profil profesional yang elegan.",
                        feature2Title: "Visibilitas Global",
                        feature2Desc: "Tingkatkan jangkauan dan dampak Anda dengan membuat karya Anda dapat ditemukan oleh audiens global.",
                        feature3Title: "Pengelolaan Mudah",
                        feature3Desc: "Dashboard intuitif kami memudahkan Anda untuk menambah, mengedit, dan mengatur pencapaian akademik Anda.",
                        featuredLecturers: "Dosen Pilihan",
                        featuredLecturersDesc: "Temukan pemikir cerdas yang membentuk masa depan akademisi.",
                        ctaTitle: "Siap Membangun Warisan Anda?",
                        ctaDesc: "Bergabunglah dengan ScholarSphere hari ini dan buat portofolio profesional yang benar-benar mewakili kontribusi akademik dan keahlian Anda.",
                        createPortfolio: "Buat Portofolio Anda",
                    },
                    footer: {
                        tagline: "Platform web yang elegan, modern, dan berskala untuk akademisi.",
                        navigation: "Navigasi",
                        legal: "Legal",
                        terms: "Syarat Layanan",
                        privacy: "Kebijakan Privasi",
                        connect: "Hubungi",
                        copyright: "ScholarSphere. Dibangun oleh Tim Kelompok 1."
                    }
                }
            }
        }
    });

export default i18n;
