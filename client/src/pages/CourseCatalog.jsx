import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../services/api';
import CourseCard from '../components/CourseCard';
import {
  Search,
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Database,
  ArrowRight,
  RefreshCw,
  X,
  Compass,
  Flame,
  Award
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Artificial Intelligence',
  'UI/UX Design',
  'Cloud & DevOps'
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CourseCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, sortBy]);

  const fetchCourses = async (overrideQuery) => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedLevel !== 'All') params.level = selectedLevel;
      const queryToUse = overrideQuery !== undefined ? overrideQuery : searchQuery;
      if (queryToUse && queryToUse.trim()) params.search = queryToUse.trim();
      if (sortBy) params.sort = sortBy;

      const res = await courseService.getAll(params);
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Unable to load courses. Please verify the backend server and MongoDB Atlas connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Instant search if cleared
    if (!val.trim()) {
      fetchCourses('');
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSearchQuery('');
    setSortBy('rating');
    setSearchParams({});
    fetchCourses('');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedLevel !== 'All' || searchQuery.trim().length > 0;

  return (
    <div className="catalog-page">
      {/* Hero Section */}
      <section className="catalog-hero">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={15} color="#4f46e5" />
            <span>Interactive Academy • Cloud & Atlas Ready</span>
          </div>

          <h1 className="hero-heading">
            Master High-Impact Engineering with <span className="gradient-text">Interactive Video & Quizzes</span>
          </h1>

          <p className="hero-description">
            Accelerate your software engineering career with hands-on curriculums. Build modern MERN apps, architect AI agents, master design systems, and deploy to cloud platforms with MongoDB Atlas.
          </p>

          <div className="hero-stats-row">
            <div className="stat-pill-item">
              <BookOpen size={16} color="#4f46e5" />
              <span>Production Tracks</span>
            </div>
            <div className="stat-pill-item">
              <CheckCircle2 size={16} color="#10b981" />
              <span>Interactive Quizzes & Certificates</span>
            </div>
            <div className="stat-pill-item">
              <Database size={16} color="#059669" />
              <span>MongoDB Atlas Cloud Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Search & Filter Controls */}
      <section className="catalog-filter-bar">
        <div className="filter-controls-container">
          {/* Centered Modern Search Input */}
          <form onSubmit={handleSearchSubmit} className="search-form-wrapper">
            <Search size={19} className="search-input-icon" />
            <input
              type="text"
              placeholder="Search courses by title, topic, technology, or keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); fetchCourses(''); }}
                className="btn-clear-search"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          {/* Difficulty & Sort Dropdowns */}
          <div className="dropdowns-group">
            <div className="filter-select-wrapper">
              <label>Level:</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="custom-select"
              >
                {LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="custom-select"
              >
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="category-chips-row">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="active-filters-bar">
            <span className="results-count-text">
              Showing {courses.length} course{courses.length === 1 ? '' : 's'}
              {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
              {searchQuery.trim() && <span> for "<strong>{searchQuery}</strong>"</span>}
              {selectedLevel !== 'All' && <span> ({selectedLevel} level)</span>}
            </span>
            <button onClick={handleClearFilters} className="btn-reset-filters">
              <X size={13} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </section>

      {/* Course Grid Content */}
      <section className="courses-grid-section">
        {loading ? (
          <div className="courses-loading-state">
            <RefreshCw size={36} className="spinning-icon" color="#4f46e5" />
            <p>Fetching curriculum from MongoDB Atlas...</p>
          </div>
        ) : error ? (
          <div className="courses-error-state">
            <p>{error}</p>
            <button onClick={() => fetchCourses()} className="btn btn-secondary mt-3">
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-empty-state">
            <GraduationCap size={48} color="#94a3b8" />
            <h3>No courses found matching your criteria</h3>
            <p>Try searching with different terms or clearing your selected filters.</p>
            <button onClick={handleClearFilters} className="btn btn-primary mt-3">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseCatalog;
