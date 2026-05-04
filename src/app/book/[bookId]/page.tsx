import { BOOKS } from "@/lib/engine/bookRegistry";
import BookPageClient from "./BookPageClient";

// Generate static paths for all books
export function generateStaticParams() {
  return BOOKS.map((book) => ({
    bookId: book.id,
  }));
}

// Generate metadata for each book
export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = BOOKS.find((b) => b.id === bookId);
  return {
    title: book ? `${book.title} | Loom` : "Book | Loom",
    description: book?.description || "Interactive learning on Loom",
  };
}

interface BookPageProps {
  params: Promise<{ bookId: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { bookId } = await params;
  const book = BOOKS.find((b) => b.id === bookId);

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center text-muted">
        Book not found
      </div>
    );
  }

  return <BookPageClient book={book} bookId={bookId} />;
}
