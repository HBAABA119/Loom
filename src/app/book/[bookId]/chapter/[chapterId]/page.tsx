import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { BOOKS, getChapterMeta } from "@/lib/engine/bookRegistry";
import ChapterPageClient from "./ChapterPageClient";

interface ChapterPageProps {
  params: Promise<{ bookId: string; chapterId: string }>;
}

async function loadChapterContent(bookId: string, chapterId: string) {
  try {
    const contentPath = join(process.cwd(), "src", "content", bookId, `${chapterId}.json`);
    const content = await readFile(contentPath, "utf-8");
    return JSON.parse(content);
  } catch {
    // Return default content if file doesn't exist yet
    return null;
  }
}

export async function generateStaticParams() {
  const params: { bookId: string; chapterId: string }[] = [];
  
  for (const book of BOOKS) {
    for (const chapter of book.chapters) {
      params.push({
        bookId: book.id,
        chapterId: chapter.id,
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { bookId, chapterId } = await params;
  const chapter = getChapterMeta(bookId, chapterId);
  const book = BOOKS.find((b) => b.id === bookId);
  
  return {
    title: chapter ? `${chapter.title} | ${book?.title} | Loom` : "Chapter | Loom",
    description: chapter?.title || "Interactive chapter on Loom",
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { bookId, chapterId } = await params;
  
  const book = BOOKS.find((b) => b.id === bookId);
  const chapter = getChapterMeta(bookId, chapterId);
  
  if (!book || !chapter) {
    notFound();
  }
  
  // Load chapter content from JSON
  const chapterContent = await loadChapterContent(bookId, chapterId);
  
  // Get previous and next chapters for navigation
  const allChapters = book.chapters;
  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  
  return (
    <ChapterPageClient
      book={book}
      chapter={chapter}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      content={chapterContent}
    />
  );
}
