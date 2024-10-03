import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile, unlink } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name;
  const filepath = path.join(process.cwd(), "tmp", filename);
  const outputFilename = `processed_${filename}`;
  const outputFilepath = path.join(process.cwd(), "tmp", outputFilename);

  try {
    await writeFile(filepath, buffer);

    const ffmpegCommand = `
      ffmpeg -i ${filepath} \
      -filter_complex "
      [0:a]apad=pad_dur=2[s1];
      [0:a]rubberband=pitch=1.059463094359295[p1];
      [p1]apad=pad_dur=2[s2];
      [0:a]rubberband=pitch=1.122462048309373[p2];
      [s1][s2][p2]concat=n=3:v=0:a=1
      " ${outputFilepath}
    `;

    await new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`FFmpeg error: ${error}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    // Limpieza: eliminar el archivo original
    await unlink(filepath);

    return NextResponse.json({ result: outputFilename });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Error processing audio" }, { status: 500 });
  }
}