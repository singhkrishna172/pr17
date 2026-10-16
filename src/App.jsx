import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STUDENTS_API = 'https://dummyjson.com/users?limit=12'

function StudentCard({ student }) {
  const fullName = `${student.firstName} ${student.lastName}`

  return (
    <article className="student-card">
      <div className="student-card-top">
        <img className="student-avatar" src={student.image} alt={fullName} />
        <span className="student-status">
          <span className="status-dot" />
          Enrolled
        </span>
      </div>

      <h3>{fullName}</h3>
      <p className="student-email">{student.email}</p>

      <div className="student-details">
        <div className="detail-row">
          <span className="detail-icon" aria-hidden="true">⌂</span>
          <span>{student.university || 'University not listed'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-icon" aria-hidden="true">✳</span>
          <span>{student.company?.department || 'Department not listed'}</span>
        </div>
      </div>

      <div className="student-card-footer">
        <span>{student.age} years old</span>
        <a href={`mailto:${student.email}`} aria-label={`Email ${fullName}`}>
          Contact <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  )
}

function App() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchStudents() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch(STUDENTS_API, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`The student list could not be loaded (${response.status}).`)
        }

        const data = await response.json()
        if (!Array.isArray(data.users)) {
          throw new Error('The student list response was not in the expected format.')
        }

        setStudents(data.users)
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Something went wrong while loading students.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchStudents()
    return () => controller.abort()
  }, [refreshCount])

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return students

    return students.filter((student) => {
      const searchableDetails = [
        student.firstName,
        student.lastName,
        student.email,
        student.university,
        student.company?.department,
      ]
      return searchableDetails.some((detail) =>
        detail?.toLowerCase().includes(normalizedSearch),
      )
    })
  }, [searchTerm, students])

  const universityCount = new Set(
    students.map((student) => student.university).filter(Boolean),
  ).size

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Classroom home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m3 9 9-5 9 5-9 5-9-5Z" />
              <path d="M7 11.2v4.3c2.8 2.3 7.2 2.3 10 0v-4.3M21 9v6" />
            </svg>
          </span>
          <span>classroom<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="term-label">STUDENT DIRECTORY</span>
          <span className="profile-avatar" aria-label="Admin profile">A</span>
        </div>
      </header>

      <div className="page-content">
        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR CAMPUS, AT A GLANCE</p>
            <h1>Student directory</h1>
            <p className="welcome-copy">
              Get to know the people that make our campus special.
            </p>
          </div>
          <div className="welcome-decoration" aria-hidden="true">
            <span className="decoration-spark">✳</span>
            <span className="decoration-circle" />
          </div>
        </section>

        <section className="overview" aria-label="Directory overview">
          <div className="overview-copy">
            <span className="overview-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
                <circle cx="9.5" cy="7" r="4" />
                <path d="M17 11a4 4 0 0 0 0-8m4 17v-1.5a4 4 0 0 0-3-3.87" />
              </svg>
            </span>
            <div>
              <p className="overview-label">Students listed</p>
              <p className="overview-value">
                {isLoading ? '—' : students.length}
                <span> students</span>
              </p>
            </div>
          </div>
          <div className="overview-divider" />
          <div className="overview-copy university-overview">
            <span className="overview-icon university-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01M9 12h.01M15 12h.01" />
              </svg>
            </span>
            <div>
              <p className="overview-label">Universities</p>
              <p className="overview-value">
                {isLoading ? '—' : universityCount}
                <span> represented</span>
              </p>
            </div>
          </div>
          <span className="overview-note">
            <span className="note-dot" />
            {isLoading ? 'Syncing directory' : 'Directory up to date'}
          </span>
        </section>

        <section className="directory-section" aria-labelledby="directory-heading">
          <div className="directory-heading">
            <div>
              <p className="eyebrow">MEET YOUR PEERS</p>
              <h2 id="directory-heading">All students</h2>
            </div>
            <label className="search-box">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4 4" />
              </svg>
              <input
                type="search"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search students"
              />
              <kbd>/</kbd>
            </label>
          </div>

          {isLoading && (
            <div className="student-grid" aria-label="Loading students" aria-busy="true">
              {Array.from({ length: 6 }, (_, index) => (
                <div className="student-card skeleton-card" key={index}>
                  <span className="skeleton skeleton-avatar" />
                  <span className="skeleton skeleton-title" />
                  <span className="skeleton skeleton-line" />
                  <span className="skeleton skeleton-line short" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="message-panel" role="alert">
              <span className="message-icon" aria-hidden="true">!</span>
              <h3>We couldn’t load the directory</h3>
              <p>{error}</p>
              <button
                className="retry-button"
                type="button"
                onClick={() => setRefreshCount((count) => count + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && filteredStudents.length > 0 && (
            <>
              <p className="results-count">
                Showing <strong>{filteredStudents.length}</strong> of {students.length} students
              </p>
              <div className="student-grid">
                {filteredStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </>
          )}

          {!isLoading && !error && filteredStudents.length === 0 && (
            <div className="message-panel empty-panel">
              <span className="empty-icon" aria-hidden="true">⌕</span>
              <h3>No students found</h3>
              <p>Try a different name, email, university, or department.</p>
              <button className="retry-button" type="button" onClick={() => setSearchTerm('')}>
                Clear search
              </button>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>© 2025 Classroom</span>
          <span>Making campus feel a little smaller <span aria-hidden="true">♡</span></span>
        </footer>
      </div>
    </main>
  )
}

export default App
