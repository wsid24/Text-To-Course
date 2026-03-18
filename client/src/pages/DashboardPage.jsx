import { useState, useEffect } from "react";
import { getCourses, deleteCourse } from "../api/courseApi";
import CourseCard from "../components/course/CourseCard";
import GenerateForm from "../components/course/GenerateForm";
import toast from "react-hot-toast";
import { HiOutlineBookOpen } from "react-icons/hi";

const DashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data.courses);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (courseId) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((c) => c._id !== courseId));
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }} className="animate-fade-in">
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>
        My Courses
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Generate a new course or continue where you left off.
      </p>

      <div style={{ marginBottom: "2.5rem" }}>
        <GenerateForm compact />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--color-border)", borderTopColor: "var(--color-primary)", borderRadius: "50%", margin: "0 auto" }} />
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }} className="glass" style2={{ borderRadius: "1rem" }}>
          <HiOutlineBookOpen style={{ fontSize: "3rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }} />
          <h3 style={{ fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.25rem" }}>No courses yet</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Generate your first course above to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
