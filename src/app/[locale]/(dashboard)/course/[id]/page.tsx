import CourseDetail from "@/components/pages/CourseDetail/CourseDetail";
import { Metadata } from "next";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Course ${id} | Our Courses`,
    description: `Details and information about Course ${id}. Learn more about the instructor, content, and level.`,
    openGraph: {
      title: `Course ${id} | Our Courses`,
      description: `Explore all details for Course ${id}.`,
      url: `https://yourdomain.com/courses/${id}`,
      siteName: "Our Courses",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Course ${id} | Our Courses`,
      description: `Discover what Course ${id} has to offer.`,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;

  return <CourseDetail id={id} />;
}
