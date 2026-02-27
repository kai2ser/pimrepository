import Link from "next/link";
import { RecordForm } from "@/components/records/RecordForm";
import { ArrowLeft } from "lucide-react";

export default function NewRecordPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Repository
        </Link>
        <h1 className="text-2xl font-bold">Add New Policy Record</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add a new country policy or strategy document to the repository.
          After saving, you can upload the English and native-language PDF files.
        </p>
      </div>

      <RecordForm mode="create" />
    </div>
  );
}
