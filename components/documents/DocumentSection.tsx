"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DocumentUpload } from "./DocumentUpload";
import type { Document } from "@/drizzle/schema";

interface DocumentSectionProps {
  recordId: string;
  initialDocuments: Document[];
}

export function DocumentSection({
  recordId,
  initialDocuments,
}: DocumentSectionProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const refreshDocuments = async () => {
    try {
      const res = await fetch(`/api/records/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents ?? []);
      }
    } catch (err) {
      console.error("Failed to refresh documents:", err);
      toast.error("Could not refresh document list");
    }
  };

  return (
    <DocumentUpload
      recordId={recordId}
      documents={documents}
      onUpdate={refreshDocuments}
    />
  );
}
