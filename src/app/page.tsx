import { FileUploaderComponent } from "@/components/file-uploader";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-2xl font-bold">Audio Processing with FFmpeg</h1>
        <FileUploaderComponent />
      </main>
    </div>
  );
}
