import InstructorDetail from "@/components/pages/InstructorDetail/InstructorDetail";
import { Metadata } from "next";

interface InstructorDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: InstructorDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `מרצה ${id} | המרצים שלנו`,
    description: `פרטים ומידע על מרצה ${id}. גלו את הקורסים, הניסיון והמומחיות של המרצה.`,
    openGraph: {
      title: `מרצה ${id} | המרצים שלנו`,
      description: `גלו את כל הפרטים על מרצה ${id} והקורסים שהוא מעביר.`,
      url: `https://yourdomain.com/instructor/${id}`,
      siteName: "המרצים שלנו",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `מרצה ${id} | המרצים שלנו`,
      description: `למדו עוד על מרצה ${id} והקורסים שהוא מציע.`,
    },
  };
}

export default async function InstructorDetailPage({
  params,
}: InstructorDetailPageProps) {
  const { id } = await params;

  return <InstructorDetail id={id} />;
}
