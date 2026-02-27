import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          The record or page you are looking for does not exist.
        </p>
      </div>
      <Link href="/">
        <Button>Return to Repository</Button>
      </Link>
    </div>
  );
}
