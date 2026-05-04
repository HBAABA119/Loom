import ChapterPageClient from "./ChapterPageClient";
import chapterDataRaw from "@/content/chapters/01-dynamic-arrays.json";

const chapterData = chapterDataRaw as {
  title: string;
  theory: {
    overview: string;
    keyConcepts: { name: string; description: string }[];
    complexity: {
      access: string;
      search: string;
      insertion: string;
      deletion: string;
      space: string;
    };
  };
  problems: { id: string; title: string; difficulty: "easy" | "medium" | "hard" }[];
};

export function generateStaticParams() {
  const chapters = [
    "01-dynamic-arrays", "02-strings", "03-linked-lists", "04-stacks", "05-queues",
    "06-recursion", "07-sorting", "08-searching", "09-hash-tables", "10-bst",
    "11-heaps", "12-graphs", "13-dfs-bfs", "14-shortest-paths", "15-mst",
    "16-tries", "17-segment-trees", "18-fenwick-trees", "19-disjoint-sets",
    "20-dp-fundamentals", "21-advanced-dp", "22-greedy", "23-backtracking",
    "24-bit-manipulation", "25-math-primes", "26-suffix-trees", "27-kd-trees",
    "28-bloom-filters", "29-network-flow", "30-computational-geometry"
  ];
  return chapters.map((id) => ({ id }));
}

export default async function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChapterPageClient chapterId={id} chapterData={chapterData} />;
}
