import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");

  console.log("Requested file:", fileName); // Añade este log

  if (!fileName) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  const tmpDir = path.join(process.cwd(), "tmp");
  console.log("Tmp directory:", tmpDir); // Añade este log

  try {
    // Leer todos los archivos en el directorio tmp
    const files = await readdir(tmpDir);
    console.log("Files in tmp directory:", files); // Añade este log
    
    // Buscar el archivo que coincida con el nombre solicitado
    const matchingFile = files.find(file => file === fileName);

    if (!matchingFile) {
      console.log("File not found in tmp directory"); // Añade este log
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(tmpDir, matchingFile);
    const fileBuffer = await readFile(filePath);
    
    // Determinar el tipo de contenido basado en la extensión del archivo
    const fileExtension = path.extname(fileName).toLowerCase();
    let contentType = "application/octet-stream"; // Por defecto

    if (fileExtension === ".mp3") {
      contentType = "audio/mpeg";
    } else if (fileExtension === ".wav") {
      contentType = "audio/wav";
    } else if (fileExtension === ".ogg") {
      contentType = "audio/ogg";
    }
    // Añade más tipos según sea necesario

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json({ error: "Error reading file" }, { status: 500 });
  }
}