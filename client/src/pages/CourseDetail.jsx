import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService, progressService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  BookOpen,
  Star,
  Users,
  CheckCircle,
  PlayCircle,
  HelpCircle,
  Award,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Check,
  Video
} from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      const res = await courseService.getById(id);
      if (res.data.success) {
        setCourse(res.data.course);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollOrResume = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    if (course.isEnrolled) {
      navigate(`/learn/${course._id}`);
      return;
    }

    try {
      setEnrolling(true);
      const res = await progressService.enroll(course._id);
      if (res.data.success) {
        navigate(`/learn/${course._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    navigate(`/learn/${course._id}`);
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading course curriculum & modules...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-error">
        <h2>{error || 'Course not found'}</h2>
        <Link to="/" className="btn btn-secondary mt-3">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const userProgress = course.enrollment?.progressPercentage || 0;
  const isEnrolled = course.isEnrolled;

  return (
    <div className="course-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="detail-nav-strip">
        <div className="detail-nav-container">
          <Link to="/" className="detail-breadcrumb-link">
            <ArrowLeft size={16} />
            <span>Back to All Courses</span>
          </Link>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">{course.category}</span>
        </div>
      </div>

      {/* Course Hero Banner */}
      <section className="detail-hero">
        <div className="detail-hero-container">
          {/* Hero Left Content */}
          <div className="detail-hero-left">
            <div className="detail-badges-row">
              <span className="badge category-badge">{course.category}</span>
              <span className={`badge level-badge level-${course.level?.toLowerCase()}`}>
                {course.level}
              </span>
              <span className="badge badge-atlas">MongoDB Atlas Ready</span>
            </div>

            <h1 className="detail-title">{course.title}</h1>
            <p className="detail-subtitle">{course.subtitle || course.description}</p>

            <div className="detail-meta-row">
              <div className="meta-item rating-star-item">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span className="font-bold">{course.rating || 4.9}</span>
                <span className="text-muted">({course.reviewsCount || 150} reviews)</span>
              </div>
              <div className="meta-item">
                <Users size={16} />
                <span>{course.enrolledCount || 1200} Students Enrolled</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>{course.duration || '8.5 Hours'} Total Duration</span>
              </div>
              <div className="meta-item">
                <Award size={16} color="#10b981" />
                <span>Certificate Included</span>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="instructor-card-compact">
              <div className="instructor-avatar-badge">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt={course.instructorName}
                  className="instructor-avatar-img"
                />
              </div>
              <div className="instructor-info">
                <span className="taught-by-label">Curriculum Lead & Instructor</span>
                <h4 className="instructor-title">{course.instructorName || 'Lead Tech Educator'}</h4>
                <p className="instructor-headline">{course.instructorTitle || 'Principal Software Architect & Mentor'}</p>
              </div>
            </div>
          </div>

          {/* Sticky Enrollment Card */}
          <div className="detail-hero-right">
            <div className="sticky-enrollment-card">
              <div className="card-preview-thumb">
                <img src={course.thumbnail} alt={course.title} />
                <div className="play-overlay" onClick={handleEnrollOrResume}>
                  <PlayCircle size={52} color="#ffffff" />
                  <span className="preview-label">Preview Classroom</span>
                </div>
              </div>

              <div className="enrollment-card-body">
                <div className="price-display">
                  <span className="price-main">Free</span>
                  <span className="price-badge">100% Free Access</span>
                </div>

                {isEnrolled ? (
                  <div className="enrolled-status-box">
                    <div className="progress-info-row">
                      <span>Course Progress</span>
                      <span className="font-semibold">{userProgress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${userProgress}%` }}></div>
                    </div>
                    <button
                      onClick={handleEnrollOrResume}
                      className="btn btn-primary btn-block mt-3"
                    >
                      <PlayCircle size={17} />
                      <span>Continue to Classroom</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnrollOrResume}
                    disabled={enrolling}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    <span>{enrolling ? 'Enrolling...' : 'Enroll in Course (Free)'}</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                <div className="card-guarantees">
                  <div className="guarantee-item">
                    <CheckCircle size={15} color="#10b981" />
                    <span>Full lifetime access to videos & notes</span>
                  </div>
                  <div className="guarantee-item">
                    <HelpCircle size={15} color="#4f46e5" />
                    <span>Interactive quiz for every video</span>
                  </div>
                  <div className="guarantee-item">
                    <Award size={15} color="#8b5cf6" />
                    <span>Official certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Outcomes & Syllabus */}
      <section className="detail-body-section">
        <div className="detail-body-container">
          {/* What You'll Learn */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div className="content-card outcomes-card">
              <h3 className="section-card-title">
                <Sparkles size={20} color="#4f46e5" />
                <span>What You'll Learn in this Track</span>
              </h3>
              <div className="outcomes-grid">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="outcome-item">
                    <div className="outcome-check-circle">
                      <Check size={14} color="#10b981" />
                    </div>
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Syllabus */}
          <div className="content-card syllabus-card">
            <div className="syllabus-header">
              <div>
                <h3 className="section-card-title">
                  <Layers size={20} color="#4f46e5" />
                  <span>Interactive Curriculum & Modules</span>
                </h3>
                <p className="syllabus-subtitle">
                  Watch videos, read in-depth notes, and test yourself with interactive quizzes.
                </p>
              </div>
              <div className="syllabus-meta-pills">
                <span className="meta-pill">{lessons.length} Modules</span>
                <span className="meta-pill">{course.duration}</span>
                <span className="meta-pill highlight">{lessons.length} Quizzes</span>
              </div>
            </div>

            <div className="lessons-accordion">
              {lessons.map((lesson, idx) => {
                const isCompleted = course.enrollment?.completedLessonIds?.some(
                  id => id.toString() === lesson._id?.toString()
                );

                return (
                  <div
                    key={lesson._id || idx}
                    className={`lesson-item-row ${isCompleted ? 'lesson-done' : ''}`}
                    onClick={() => handleStartLesson(lesson._id)}
                  >
                    <div className="lesson-left">
                      <div className="lesson-order-badge">
                        {isCompleted ? (
                          <CheckCircle size={18} color="#10b981" />
                        ) : (
                          <span className="order-number">{String(idx + 1).padStart(2, '0')}</span>
                        )}
                      </div>
                      <div className="lesson-info">
                        <h4 className="lesson-title">{lesson.title}</h4>
                        {lesson.summary && (
                          <p className="lesson-mini-desc">{lesson.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="lesson-right">
                      <span className="lesson-duration-pill">
                        <Clock size={13} />
                        <span>{lesson.duration || '15 min'}</span>
                      </span>
                      <span className="lesson-quiz-indicator">
                        <HelpCircle size={13} />
                        <span>Quiz</span>
                      </span>
                      <button
                        type="button"
                        className="btn-start-lesson-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartLesson(lesson._id);
                        }}
                      >
                        <PlayCircle size={15} />
                        <span>{isCompleted ? 'Review' : 'Start'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
