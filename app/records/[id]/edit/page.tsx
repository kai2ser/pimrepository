import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecordWithDocs } from "@/modules/records/queries";
import { RecordForm } from "@/components/records/RecordForm";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getRecordWithDocs(id);

  if (!record) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href={`/records/${id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Record
        </Link>
        <h1 className="text-2xl font-bold">Edit Record</h1>
        <p className="text-muted-foreground text-sm mt-1">{record.nameEng}</p>
      </div>

      <RecordForm record={record} documents={record.documents} mode="edit" />
    </div>
  );
}
