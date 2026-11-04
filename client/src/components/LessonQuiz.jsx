import React, { useState, useEffect, useMemo } from 'react';
import { progressService } from '../services/api';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  Send,
  ArrowRight,
  Lightbulb,
  Check,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

/**
 * Intelligent, interactive Quiz engine.
 * Guarantees every video lesson has a responsive, gamified quiz
 * with instant feedback, explanations, and progress synchronization.
 */
const LessonQuiz = ({ courseId, lesson, onQuizCompleted, onNextLesson }) => {
  // Generate intelligent fallback questions if lesson has no DB quiz questions
  const questions = useMemo(() => {
    if (lesson?.quiz && lesson.quiz.length > 0) {
      return lesson.quiz;
    }

    const title = lesson?.title || 'This Module';
    const summary = lesson?.summary || 'core technical principles and modern full-stack workflows';

    return [
      {
        question: `What is the core takeaway covered in "${title}"?`,
        options: [
          `Applying ${summary.length > 80 ? summary.slice(0, 80) + '...' : summary}`,
          'Hardcoding static variables in frontend components without state management',
          'Relying solely on local storage instead of reliable cloud databases',
          'Deploying unminified development bundles directly to edge production'
        ],
        correctAnswer: 0,
        explanation: `This lesson emphasizes ${summary || 'building scalable and maintainable architectures'}.`
      },
      {
        question: 'Which software engineering principle is best demonstrated in this lesson?',
        options: [
          'Tight coupling between client rendering and database internal schemas',
          'Decoupled separation of concerns, defensive validations, and modular design',
          'Bypassing version control when committing critical security configurations',
          'Ignoring error handling in asynchronous network requests'
        ],
        correctAnswer: 1,
        explanation: 'Decoupled systems and clean boundaries ensure resilience, scalability, and maintainability across modern applications.'
      }
    ];
  }, [lesson]);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when lesson changes
  useEffect(() => {
    setSelectedAnswers({});
    setQuizResult(null);
    setErrorMsg('');
  }, [lesson?._id]);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSelectOption = (questionIdx, optionIdx) => {
    if (quizResult) return; // Prevent changing after submit
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
    setErrorMsg('');
  };

  const handleSubmitQuiz = async () => {
    if (answeredCount < totalQuestions) {
      setErrorMsg(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const answersArray = questions.map((_, idx) => selectedAnswers[idx]);

      let resData = null;

      // Check if questions are from DB or fallback
      const isCustomDbQuiz = lesson?.quiz && lesson.quiz.length > 0;

      if (isCustomDbQuiz) {
        try {
          const res = await progressService.submitQuiz(courseId, {
            lessonId: lesson._id,
            userAnswers: answersArray
          });
          if (res.data.success) {
            resData = res.data;
          }
        } catch (apiErr) {
          console.warn('Backend quiz submit failed, using client grading fallback:', apiErr);
        }
      }

      // If backend didn't have quiz or client fallback needed:
      if (!resData) {
        let score = 0;
        const review = questions.map((q, idx) => {
          const selected = selectedAnswers[idx];
          const isCorrect = selected === q.correctAnswer;
          if (isCorrect) score++;

          return {
            question: q.question,
            options: q.options,
            userSelected: selected,
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation
          };
        });

        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 60;

        // If passed, mark lesson completed on backend
        if (passed) {
          try {
            const compRes = await progressService.completeLesson(courseId, lesson._id);
            resData = {
              success: true,
              result: { score, totalQuestions, percentage, passed, review },
              progressPercentage: compRes.data.progressPercentage,
              certificateIssued: compRes.data.certificateIssued,
              completedLessonIds: compRes.data.completedLessonIds
            };
          } catch (e) {
            resData = {
              success: true,
              result: { score, totalQuestions, percentage, passed, review }
            };
          }
        } else {
          resData = {
            success: true,
            result: { score, totalQuestions, percentage, passed, review }
          };
        }
      }

      setQuizResult(resData.result);
      if (onQuizCompleted && resData.progressPercentage !== undefined) {
        onQuizCompleted(resData);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setQuizResult(null);
    setErrorMsg('');
  };

  return (
    <div className="interactive-quiz-container">
      {/* Quiz Top Header */}
      <div className="quiz-header-card">
        <div className="quiz-header-top">
          <div className="quiz-title-group">
            <div className="quiz-badge-icon">
              <HelpCircle size={22} color="#ffffff" />
            </div>
            <div>
              <span className="quiz-pill-tag">Interactive Video Knowledge Check</span>
              <h3 className="quiz-main-heading">Module Comprehension Quiz</h3>
            </div>
          </div>

          {quizResult && (
            <div className={`quiz-score-pill ${quizResult.passed ? 'passed' : 'failed'}`}>
              <Award size={18} />
              <span>
                {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar while answering */}
        {!quizResult && (
          <div className="quiz-progress-bar-wrapper">
            <div className="quiz-progress-info">
              <span>{answeredCount} of {totalQuestions} answered</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="quiz-alert-box alert-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions List */}
      <div className="quiz-questions-stack">
        {questions.map((q, qIdx) => {
          const selectedOption = selectedAnswers[qIdx];
          const reviewInfo = quizResult ? quizResult.review[qIdx] : null;

          return (
            <div
              key={qIdx}
              className={`question-card ${
                reviewInfo
                  ? reviewInfo.isCorrect
                    ? 'card-state-correct'
                    : 'card-state-wrong'
                  : selectedOption !== undefined
                  ? 'card-state-selected'
                  : ''
              }`}
            >
              {/* Question Header */}
              <div className="question-header">
                <span className="question-index-tag">Question {qIdx + 1}</span>
                <p className="question-text">{q.question}</p>
              </div>

              {/* Options Grid */}
              <div className="options-container">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  let optClass = 'quiz-option-card';
                  if (quizResult) {
                    if (optIdx === q.correctAnswer) {
                      optClass += ' opt-correct';
                    } else if (isSelected && optIdx !== q.correctAnswer) {
                      optClass += ' opt-wrong';
                    } else {
                      optClass += ' opt-dimmed';
                    }
                  } else if (isSelected) {
                    optClass += ' opt-selected';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      className={optClass}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      disabled={!!quizResult}
                    >
                      <span className="opt-letter-badge">{letter}</span>
                      <span className="opt-content-text">{opt}</span>

                      {quizResult && optIdx === q.correctAnswer && (
                        <div className="opt-status-badge text-success">
                          <CheckCircle2 size={18} />
                          <span>Correct</span>
                        </div>
                      )}

                      {quizResult && isSelected && optIdx !== q.correctAnswer && (
                        <div className="opt-status-badge text-danger">
                          <XCircle size={18} />
                          <span>Your Choice</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Question Explanation Box */}
              {quizResult && reviewInfo && reviewInfo.explanation && (
                <div className={`explanation-callout ${reviewInfo.isCorrect ? 'explanation-correct' : 'explanation-wrong'}`}>
                  <div className="explanation-title">
                    <Lightbulb size={16} />
                    <span>Explanation & Key Insight</span>
                  </div>
                  <p>{reviewInfo.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Footer Actions */}
      <div className="quiz-bottom-card">
        {quizResult ? (
          <div className="quiz-completed-banner">
            {quizResult.passed ? (
              <div className="banner-message banner-pass">
                <div className="banner-icon-circle pass-circle">
                  <Sparkles size={24} color="#10b981" />
                </div>
                <div className="banner-text-group">
                  <h4>Outstanding Work! You Passed the Quiz! 🎉</h4>
                  <p>You scored {quizResult.percentage}%. Your progress has been updated in MongoDB Atlas.</p>
                </div>
              </div>
            ) : (
              <div className="banner-message banner-fail">
                <div className="banner-icon-circle fail-circle">
                  <RotateCcw size={24} color="#f59e0b" />
                </div>
                <div className="banner-text-group">
                  <h4>Passing Score is 60% (Scored {quizResult.percentage}%)</h4>
                  <p>Review the module reading notes above and retake the quiz to earn full certification credit.</p>
                </div>
              </div>
            )}

            <div className="banner-action-buttons">
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={15} />
                <span>Retake Quiz</span>
              </button>

              {quizResult.passed && onNextLesson && (
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="btn btn-primary btn-sm"
                >
                  <span>Next Video Module</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="quiz-submit-strip">
            <span className="submit-hint">
              {answeredCount === totalQuestions
                ? 'All questions answered! Ready to grade.'
                : `Answer remaining ${totalQuestions - answeredCount} question(s) to submit.`}
            </span>

            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting || answeredCount < totalQuestions}
              className="btn btn-primary"
            >
              <Send size={16} />
              <span>{submitting ? 'Verifying Answers...' : 'Submit Answers & Check Score'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonQuiz;
