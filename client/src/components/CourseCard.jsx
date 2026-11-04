import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Users, CheckCircle, ArrowRight, PlayCircle, HelpCircle } from 'lucide-react';

const CourseCard = ({ course }) => {
  const isEnrolled = course.isEnrolled;
  const userProgress = course.userProgress || 0;

  return (
    <div className="course-card">
      <div className="card-thumbnail-wrapper">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="card-thumbnail"
          loading="lazy"
        />
        <div className="card-badge-group">
          <span className="badge category-badge">{course.category}</span>
          <span className={`badge level-badge level-${course.level?.toLowerCase()}`}>
            {course.level}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta-top">
          <span className="rating-pill">
            <Star size={14} className="star-icon" />
            <span>{course.rating || 4.9}</span>
            <span className="reviews-count">({course.reviewsCount || 120})</span>
          </span>
          <span className="duration-pill">
            <Clock size={14} />
            <span>{course.duration || '8.5 Hours'}</span>
          </span>
        </div>

        <h3 className="course-title">
          <Link to={`/courses/${course._id}`}>{course.title}</Link>
        </h3>

        <p className="course-subtitle">{course.subtitle || course.description}</p>

        <div className="instructor-row">
          <span className="instructor-name">By {course.instructorName || 'Lead Tech Educator'}</span>
          <span className="lesson-count-tag">
            <BookOpen size={13} />
            <span>{course.lessons?.length || 0} Lessons + Quizzes</span>
          </span>
        </div>

        {/* Progress or Enrollment Status */}
        {isEnrolled ? (
          <div className="card-enrolled-footer">
            <div className="progress-info-row">
              <span className="progress-label">
                <CheckCircle size={13} color="#10b981" />
                <span>{userProgress === 100 ? 'Completed!' : `${userProgress}% Completed`}</span>
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${userProgress}%` }}
              ></div>
            </div>
            <Link to={`/learn/${course._id}`} className="btn btn-primary btn-sm btn-block mt-2">
              <PlayCircle size={14} />
              <span>{userProgress === 100 ? 'Review Classroom' : 'Continue Learning'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="card-footer-action">
            <div className="price-tag">
              <span className="free-pill">100% Free Access</span>
            </div>
            <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
              <span>View Curriculum</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
