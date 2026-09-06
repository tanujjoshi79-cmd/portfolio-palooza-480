export const COURSE_PRICE = 40000;

export type CourseUser = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  coursePaid?: boolean;
};

const USER_KEY = "tti-user";

export function getCourseUser(): CourseUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}

export function setCourseUser(user: CourseUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function hasCourseAccess() {
  const user = getCourseUser();
  return Boolean(user?.isAdmin || user?.coursePaid);
}
