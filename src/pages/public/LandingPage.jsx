import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandHeader from '../../components/common/BrandHeader';
import HeroSlider from '../../components/public/HeroSlider';
import styles from './LandingPage.module.css';
import heroImage1 from '../../assets/heroImage1.jpg';
import heroImage3 from '../../assets/heroImage3.jpg';
import heroImage4 from '../../assets/heroImage4.jpg';
import heroImage2 from '../../assets/heroImage2.jpg';


const HERO_SLIDES = [
  {
    // Replace with a real photo: student studying with glasses, laptop open
    image: /*'https://picsum.photos/id/1005/800/600'*/ heroImage1,
    title: 'Focused Preparation',
    text: 'Students study at their own pace with organized subjects and clear structure.',
  },
  {
    // Replace with a real photo: students taking a computer-based exam
    image: /*'https://picsum.photos/id/180/800/600'*/heroImage2,
    title: 'Real Exam Conditions',
    text: 'A timed, distraction-free CBT environment that mirrors real exam centers.',
  },
  {
    // Replace with a real photo: student celebrating a good result on laptop
    image:/* 'https://picsum.photos/id/1074/800/600'*/heroImage3,
    title: 'Instant Results',
    text: 'Get your score and a full answer breakdown the moment it\u2019s released.',
  },
  {
    // Replace with a real photo: students taking a computer-based exam
    image: 'https://picsum.photos/id/180/800/600',
    title: 'Exam Result Review',
    text: 'A well explained and detailed result reviews tailored to the particular exam taken.',
  },
];

const STEPS = [
  {
    title: 'Create Your Account',
    text: 'Sign up in seconds with your name and email — no paperwork, no waiting.',
  },
  {
    title: 'Pick Your Subjects',
    text: 'Choose one subject or several for a combined session, just like real exam boards.',
  },
  {
    title: 'Take the Exam',
    text: 'Answer at your own pace with a live timer, question navigator, and progress tracker.',
  },
  {
    title: 'View Your Results',
    text: 'See your score and review every answer with explanations once it\u2019s released.',
  },
];

const TESTIMONIALS = [
  {
    text: "Quizora made our department's mock exams feel exactly like the real CBT center. Students adapted instantly.",
    name: 'Amaka O.',
    role: 'Course Coordinator',
  },
  {
    text: 'The question navigator and timer helped me manage my time so much better than paper exams ever did.',
    name: 'Tunde A.',
    role: 'Final Year Student',
  },
  {
    text: 'Setting up subjects and uploading questions in bulk saved our admin team hours of work every week.',
    name: 'Grace E.',
    role: 'Exams Officer',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <BrandHeader size="small" />

        <div className={styles.navLinks}>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#testimonials" className={styles.navLink}>Testimonials</a>
          <a href="#about" className={styles.navLink}>About</a>
        </div>

        <div className={styles.navBtns}>
          <Link to="/login" className={styles.loginLink}>Login</Link>
          <Link to="/register" className={styles.getStartedBtn}>Get Started</Link>
        </div>

        <button
          className={styles.menuToggle}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {mobileMenuOpen && (
        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          <a href="#testimonials" className={styles.navLink}>Testimonials</a>
          <a href="#about" className={styles.navLink}>About</a>
          <Link to="/" className={styles.navLink}>Login</Link>
        </div>
      )}

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>
            Exams made <span className={styles.highlight}>simple</span>, fair, and fully digital.
          </h1>
          <p className={styles.heroSubtext}>
            Quizora is a computer-based testing platform built for schools and institutions —
            timed exams, instant results, and powerful admin tools, all in one place.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register" className={styles.primaryCta}>Get Started Free</Link>
            <a href="#how-it-works" className={styles.secondaryCta}>See How It Works</a>
          </div>
        </div>

        <HeroSlider slides={HERO_SLIDES} />
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="how-it-works">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>How It Works</span>
          <h2>Four simple steps to your exam</h2>
          <p>From sign-up to results, Quizora keeps the entire process smooth and stress-free.</p>
        </div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, index) => (
            <div className={styles.stepCard} key={index}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.section} id="testimonials">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Testimonials</span>
          <h2>Trusted by students and institutions</h2>
          <p>Here's what people using Quizora have to say.</p>
        </div>

        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, index) => (
            <div className={styles.testimonialCard} key={index}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.section} id="about">
        <div className={styles.aboutGrid}>
          <div>
            <span className={styles.sectionTag}>About Us</span>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Built to make digital exams accessible to everyone
            </h2>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
              Quizora started as a final-year project with a simple goal: make computer-based
              testing affordable and easy to set up for schools that can't access expensive
              enterprise exam software.
            </p>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              Today, it supports full exam workflows — from question banks and multi-subject
              sessions to result control and activity monitoring — all built with students and
              administrators in mind.
            </p>
          </div>

          <div className={styles.aboutStats}>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Digital & Paperless</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>3-Tier</div>
              <div className={styles.statLabel}>Admin Access Control</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>Instant</div>
              <div className={styles.statLabel}>or Scheduled Results</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className={styles.ctaBanner}>
        <h2>Ready to take your first exam?</h2>
        <p>Join Quizora today and experience a modern, fair, and fully digital testing process.</p>
        <Link to="/register" className={styles.ctaBannerBtn}>Create Free Account</Link>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <BrandHeader size="small" />
            <p className={styles.footerBrandText}>
              A modern computer-based testing platform for schools, institutions, and exam centers.
            </p>
          </div>

          <div>
            <div className={styles.footerColTitle}>Product</div>
            <a href="#how-it-works" className={styles.footerLink}>How It Works</a>
            <a href="#testimonials" className={styles.footerLink}>Testimonials</a>
            <a href="#about" className={styles.footerLink}>About</a>
          </div>

          <div>
            <div className={styles.footerColTitle}>Account</div>
            <Link to="/login" className={styles.footerLink}>Login</Link>
            <Link to="/register" className={styles.footerLink}>Register</Link>
            <Link to="/forgot-password" className={styles.footerLink}>Forgot Password</Link>
          </div>

          <div>
            <div className={styles.footerColTitle}>Legal</div>
            <a href="#" className={styles.footerLink}>Privacy Policy</a>
            <a href="#" className={styles.footerLink}>Terms of Service</a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          © {new Date().getFullYear()} Quizora. All rights reserved.
        </div>
      </footer>
    </div>
  );
}