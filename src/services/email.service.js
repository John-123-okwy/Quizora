import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_uhsd61a';
const TEMPLATE_ID = 'template_ignchjk';
const PUBLIC_KEY = '_ZQ0lNSfejALOtDST';

const LOGIN_LINK ='https://the-quizora.netlify.app' ;

export async function sendResultReleasedEmail({
  studentName,
  studentEmail,
  subjectName,
  subjectCode,
  score,
  totalQuestions,
}) {
  if (!studentEmail) return; // safety guard — never attempt a send with no recipient

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        student_name: studentName,
        student_email: studentEmail,
        subject_name: subjectName,
        subject_code: subjectCode || '',
        score: String(score),
        total_questions: String(totalQuestions),
        login_link: LOGIN_LINK,
      },
      { publicKey: PUBLIC_KEY }
    );
  } catch (err) {
    // Email failure should never break the actual release action
    console.error('Failed to send result-released email:', err);
  }
}