import matter from "gray-matter";

export async function loadMarkdownWithMeta(path) {
  const response = await fetch(path);
  const raw = await response.text();
  const { content, data } = matter(raw);
  return { content, meta: data };
}
