import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QuestionCard from '../../components/exam/QuestionCard';
import QuestionNavPanel from '../../components/exam/QuestionNavPanel';
import Timer from '../../components/exam/Timer';
import ProgressCounter from '../../components/exam/ProgressCounter';
import ConfirmModal from '../../components/common/ConfirmModal';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useExamSession } from '../../contexts/ExamSessionContext';
import { useTimer } from '../../hooks/useTimer';
import { getSubjectById } from '../../firebase/subjects.service';
import { getQuestionsBySubject } from '../../firebase/questions.service';
import { submitExamResult } from '../../firebase/results.service';
import { shuffleArray } from '../../utils/shuffle';
import { shuffleQuestionOptions } from '../../utils/shuffleOptions';
import styles from './Quiz.module.css';

export default function Quiz() {
  const { subjectId } = useParams();
  return <QuizInner key={subjectId} subjectId={subjectId} />;
}

function QuizInner({ subjectId }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { getSessionInfoForSubject, recordResult } = useExamSession();

  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showNextSubjectModal, setShowNextSubjectModal] = useState(false);
  const [pendingNextSubjectId, setPendingNextSubjectId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef(Date.now());
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    async function loadExam() {
      const subjectData = await getSubjectById(subjectId);
      const questionsData = await getQuestionsBySubject(subjectId);

      if (subjectData) {
        const limited = shuffleArray(questionsData).slice(0, subjectData.numQuestions);
        const withShuffledOptions = limited.map(shuffleQuestionOptions);
        setQuestions(withShuffledOptions);
        setSubject(subjectData);
      }
      setLoading(false);
    }
    loadExam();
  }, [subjectId]);

  const handleSubmit = useCallback(
    async (isTimeout = false) => {
      if (hasSubmittedRef.current) return;
      if (!subject || questions.length === 0) return;
      hasSubmittedRef.current = true;
      setSubmitting(true);

      const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      const result = await submitExamResult({
        userId: currentUser.uid,
        subjectId,
        subjectName: subject.name,
        subjectCode: subject.code,
        resultsVisibility: subject.resultsVisibility || 'immediate',
        answers,
        questions,
        timeTakenSeconds,
      });

      recordResult(subjectId, result.id);
      const { isLast, nextSubjectId, totalSubjects } = getSessionInfoForSubject(subjectId);

      if (!isLast && nextSubjectId) {
        if (isTimeout) {
          navigate(`/exam/${nextSubjectId}`, { replace: true });
        } else {
          setPendingNextSubjectId(nextSubjectId);
          setShowNextSubjectModal(true);
          setSubmitting(false);
        }
      } else if (totalSubjects > 1) {
        navigate('/session-result', { replace: true });
      } else {
        navigate(`/result/${result.id}`, { replace: true });
      }
    },
    [currentUser, subjectId, subject, answers, questions, navigate, recordResult, getSessionInfoForSubject]
  );

  const { secondsLeft } = useTimer(
    subject ? subject.timeLimitMinutes * 60 : 0,
    () => {
      if (!hasSubmittedRef.current) handleSubmit(true);
    },
    !!subject
  );

  const answeredMap = useMemo(() => {
    const map = {};
    questions.forEach((q, idx) => {
      map[idx] = answers[q.id] !== undefined;
    });
    return map;
  }, [questions, answers]);

  const answeredCount = Object.values(answeredMap).filter(Boolean).length;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (optionIndex) => {
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const unansweredCount = questions.length - answeredCount;
      if (unansweredCount > 0) {
        setShowUnansweredWarning(true);
      } else {
        setShowSubmitConfirm(true);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleJumpTo = (index) => {
    setCurrentIndex(index);
    setShowUnansweredWarning(false);
  };

  const handleContinueToNextSubject = () => {
    if (pendingNextSubjectId) navigate(`/exam/${pendingNextSubjectId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner label="Loading exam..." />
      </DashboardLayout>
    );
  }

  if (!subject || questions.length === 0) {
    return (
      <DashboardLayout>
        <p className={styles.loading}>
          This exam has no questions available yet. Please contact your admin.
        </p>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <DashboardLayout>
      <div className={styles.layout}>
        <div className={styles.topBar}>
          <span className={styles.subjectName}>{subject.name}</span>
          <ProgressCounter answeredCount={answeredCount} totalCount={questions.length} />
          <Timer secondsLeft={secondsLeft} />
        </div>

        {showUnansweredWarning && (
          <div className={styles.warningBanner}>
            You have {questions.length - answeredCount} unanswered question(s).
            Use the navigator to go back, or click Submit again to proceed anyway.
          </div>
        )}

        <div>
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalCount={questions.length}
            selectedIndex={answers[currentQuestion.id]}
            onSelect={handleSelectOption}
          />

          <div className={styles.navButtons}>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrev} disabled={currentIndex === 0}>
              Previous
            </button>

            {isLastQuestion ? (
              <button
                className={`${styles.navBtn} ${styles.submitBtn}`}
                onClick={() => {
                  const unansweredCount = questions.length - answeredCount;
                  if (unansweredCount > 0) {
                    setShowUnansweredWarning(true);
                  } else {
                    setShowSubmitConfirm(true);
                  }
                }}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNext}>
                Next
              </button>
            )}
          </div>
        </div>

        <div className={styles.sidebarStack}>
          <QuestionNavPanel
            totalCount={questions.length}
            currentIndex={currentIndex}
            answeredMap={answeredMap}
            onJumpTo={handleJumpTo}
          />
        </div>
      </div>

      {showSubmitConfirm && (
        <ConfirmModal
          title="Submit Exam"
          message={`You've answered ${answeredCount} of ${questions.length} questions. Once submitted, you cannot change your answers. Proceed?`}
          confirmLabel="Submit"
          onConfirm={() => handleSubmit(false)}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}

      {showNextSubjectModal && (
        <ConfirmModal
          title="Subject Complete"
          message={`Well done! You've completed ${subject.name}. Click continue to move to the next subject — its timer will start immediately.`}
          confirmLabel="Continue"
          onConfirm={handleContinueToNextSubject}
          onCancel={handleContinueToNextSubject}
        />
      )}
    </DashboardLayout>
  );
}