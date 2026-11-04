import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService, progressService } from '../services/api';
import NotesReader from '../components/NotesReader';
import LessonQuiz from '../components/LessonQuiz';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Check,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';

const Classroom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'quiz'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theaterMode, setTheaterMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassroomData();
  }, [courseId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      setError('');

      const courseRes = await courseService.getById(courseId);
      if (!courseRes.data.success) {
        throw new Error('Course not found');
      }
      setCourse(courseRes.data.course);

      const progressRes = await progressService.getProgress(courseId);
      if (progressRes.data.success && progressRes.data.enrollment) {
        setEnrollment(progressRes.data.enrollment);

        // Resume at last accessed lesson if available
        const lastId = progressRes.data.enrollment.lastAccessedLessonId;
        if (lastId && courseRes.data.course.lessons) {
          const foundIdx = courseRes.data.course.lessons.findIndex(
            l => l._id?.toString() === lastId.toString()
          );
          if (foundIdx !== -1) {
            setActiveLessonIdx(foundIdx);
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load classroom');
    } finally {
      setLoading(false);
    }
  };

  const currentLesson = course?.lessons?.[activeLessonIdx];
  const totalLessons = course?.lessons?.length || 0;

  const isLessonCompleted = (lessonId) => {
    if (!enrollment?.completedLessonIds) return false;
    return enrollment.completedLessonIds.some(
      id => id.toString() === lessonId?.toString()
    );
  };

  const isCurrentLessonDone = currentLesson ? isLessonCompleted(currentLesson._id) : false;

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    try {
      setSavingProgress(true);
      const res = await progressService.completeLesson(courseId, currentLesson._id);
      if (res.data.success) {
        setEnrollment(prev => ({
          ...prev,
          progressPercentage: res.data.progressPercentage,
          certificateIssued: res.data.certificateIssued,
          completedLessonIds: res.data.completedLessonIds
        }));
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleQuizCompleted = (resultData) => {
    setEnrollment(prev => ({
      ...prev,
      progressPercentage: resultData.progressPercentage !== undefined ? resultData.progressPercentage : prev?.progressPercentage,
      certificateIssued: resultData.certificateIssued !== undefined ? resultData.certificateIssued : prev?.certificateIssued,
      completedLessonIds: resultData.completedLessonIds || prev?.completedLessonIds
    }));
  };

  const handleNextLesson = () => {
    if (activeLessonIdx < totalLessons - 1) {
      setActiveLessonIdx(prev => prev + 1);
      setActiveTab('notes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(prev => prev - 1);
      setActiveTab('notes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Convert regular YouTube watch links to embed link
  const formatVideoEmbedUrl = (rawUrl) => {
    if (!rawUrl) return 'https://www.youtube.com/embed/nu_pCVPKzTk';
    if (rawUrl.includes('/embed/')) return rawUrl;
    if (rawUrl.includes('watch?v=')) {
      const videoId = rawUrl.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (rawUrl.includes('youtu.be/')) {
      const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return rawUrl;
  };

  if (loading) {
    return (
      <div className="classroom-loading">
        <div className="loading-spinner"></div>
        <p>Initializing interactive classroom session...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="classroom-error">
        <h2>{error || 'Course not available'}</h2>
        <Link to="/" className="btn btn-secondary mt-3">
          Back to Courses
        </Link>
      </div>
    );
  }

  const progressPercent = enrollment?.progressPercentage || 0;

  return (
    <div className={`classroom-container ${theaterMode ? 'theater-layout' : ''}`}>
      {/* Top Bar Navigation */}
      <header className="classroom-topbar">
        <div className="topbar-left">
          <Link to={`/courses/${course._id}`} className="btn-back-course">
            <ArrowLeft size={16} />
            <span>Course Details</span>
          </Link>
          <div className="topbar-divider"></div>
          <div className="topbar-course-info">
            <h2 className="topbar-course-title">{course.title}</h2>
            <span className="topbar-module-crumb">
              Module {activeLessonIdx + 1} of {totalLessons}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="classroom-progress-badge">
            <div className="progress-text-row">
              <span className="progress-stat">
                {progressPercent}% Complete
              </span>
              {enrollment?.certificateIssued && (
                <span className="certified-badge">
                  <Award size={13} />
                  <span>Certified</span>
                </span>
              )}
            </div>
            <div className="classroom-progress-track">
              <div
                className="classroom-progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className="btn-theater-mode"
            title={theaterMode ? 'Exit Theater View' : 'Theater View'}
            aria-label="Theater Mode"
          >
            {theaterMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-toggle-sidebar"
            aria-label="Toggle Syllabus"
            title="Toggle Course Modules"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Classroom Main Layout */}
      <div className="classroom-body">
        {/* Left Lesson Navigation Sidebar */}
        <aside className={`classroom-sidebar ${sidebarOpen && !theaterMode ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <div className="sidebar-title-group">
              <Layers size={17} color="#6366f1" />
              <h4>Course Modules</h4>
            </div>
            <span className="lesson-counter">
              {activeLessonIdx + 1} / {totalLessons}
            </span>
          </div>

          <div className="sidebar-lessons-list">
            {course.lessons?.map((lesson, idx) => {
              const completed = isLessonCompleted(lesson._id);
              const isActive = idx === activeLessonIdx;
              const hasQuiz = (lesson.quiz && lesson.quiz.length > 0) || true; // guaranteed interactive quiz

              return (
                <button
                  key={lesson._id || idx}
                  className={`syllabus-lesson-btn ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                  onClick={() => {
                    setActiveLessonIdx(idx);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                >
                  <div className="lesson-status-icon">
                    {completed ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <PlayCircle size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="lesson-meta-info">
                    <span className="lesson-title-text">{lesson.title}</span>
                    <div className="lesson-sub-meta">
                      <span className="duration-tag">
                        <Clock size={12} />
                        <span>{lesson.duration || '15 min'}</span>
                      </span>
                      {hasQuiz && (
                        <span className="has-quiz-tag">
                          <HelpCircle size={11} />
                          <span>Quiz</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {enrollment?.certificateIssued && (
            <div className="sidebar-certificate-card">
              <div className="cert-card-icon">
                <Award size={26} color="#10b981" />
              </div>
              <div className="cert-card-text">
                <h5>Certificate Earned!</h5>
                <p>You have completed 100% of the lessons and passed the module quizzes.</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main Stage Content */}
        <main className="classroom-main-stage">
          {currentLesson ? (
            <div className="active-lesson-wrapper">
              {/* Responsive Video Embed Player */}
              <div className="video-player-container">
                <div className="video-iframe-aspect">
                  <iframe
                    src={formatVideoEmbedUrl(currentLesson.videoUrl)}
                    title={currentLesson.title}
                    className="lesson-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Video Action Bar Directly Beneath Player */}
                <div className="video-action-bar">
                  <div className="video-status-indicator">
                    {isCurrentLessonDone ? (
                      <div className="status-pill status-pill-done">
                        <CheckCircle2 size={16} />
                        <span>Video Completed</span>
                      </div>
                    ) : (
                      <div className="status-pill status-pill-pending">
                        <PlayCircle size={16} />
                        <span>In Progress</span>
                      </div>
                    )}
                  </div>

                  <div className="video-controls-group">
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={savingProgress}
                      className={`btn ${isCurrentLessonDone ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    >
                      {savingProgress ? (
                        <span>Saving...</span>
                      ) : isCurrentLessonDone ? (
                        <>
                          <Check size={16} color="#10b981" />
                          <span>Completed ✓</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Complete Video & Save</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextLesson}
                      disabled={activeLessonIdx >= totalLessons - 1}
                      className="btn btn-secondary btn-sm"
                      title="Next Module"
                    >
                      <span>Next Video</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Lesson Stage Header & Tab Switcher */}
              <div className="lesson-stage-header">
                <div className="lesson-title-row">
                  <div>
                    <span className="module-counter-tag">
                      Module {activeLessonIdx + 1} of {totalLessons}
                    </span>
                    <h2 className="lesson-main-title">{currentLesson.title}</h2>
                  </div>

                  <div className="lesson-tabs">
                    <button
                      className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notes')}
                    >
                      <BookOpen size={16} />
                      <span>Reading & Notes</span>
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                      onClick={() => setActiveTab('quiz')}
                    >
                      <HelpCircle size={16} />
                      <span>Interactive Quiz</span>
                      <span className="tab-pill-badge">
                        {currentLesson.quiz?.length || 2} Qs
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="lesson-content-body">
                {activeTab === 'notes' ? (
                  <NotesReader
                    lesson={currentLesson}
                    isCompleted={isCurrentLessonDone}
                    onMarkComplete={handleMarkComplete}
                    onTakeQuiz={() => setActiveTab('quiz')}
                  />
                ) : (
                  <LessonQuiz
                    courseId={course._id}
                    lesson={currentLesson}
                    onQuizCompleted={handleQuizCompleted}
                    onNextLesson={handleNextLesson}
                  />
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="classroom-bottom-nav">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeLessonIdx === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Module</span>
                </button>

                <button
                  onClick={handleMarkComplete}
                  disabled={savingProgress}
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {isCurrentLessonDone
                      ? (activeLessonIdx < totalLessons - 1 ? 'Go to Next Module' : 'Course Finished!')
                      : (savingProgress ? 'Saving...' : 'Mark as Complete & Proceed')}
                  </span>
                </button>

                <button
                  onClick={handleNextLesson}
                  disabled={activeLessonIdx >= totalLessons - 1}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next Module</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="no-lesson-selected">
              <p>Select a module from the sidebar to begin learning.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Classroom;
