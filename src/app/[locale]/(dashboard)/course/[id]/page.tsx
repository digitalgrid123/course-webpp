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
    title: `קורס ${id} | הקורסים שלנו`,
    description: `פרטים ומידע על קורס ${id}. למדו עוד על המרצה, התוכן והרמה.`,
    openGraph: {
      title: `קורס ${id} | הקורסים שלנו`,
      description: `גלו את כל הפרטים על קורס ${id}.`,
      url: `https://yourdomain.com/courses/${id}`,
      siteName: "הקורסים שלנו",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `קורס ${id} | הקורסים שלנו`,
      description: `גלו מה יש לקורס ${id} להציע.`,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;

  return <CourseDetail id={id} />;
}
