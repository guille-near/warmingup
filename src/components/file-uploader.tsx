"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function FileUploaderComponent() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [processedFiles, setProcessedFiles] = useState<{ name: string; newName: string }[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    uploadAndProcessFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
    setProcessedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileToRemove.name))
  }

  const uploadAndProcessFiles = async (filesToUpload: File[]) => {
    setUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")

    try {
      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append("audio", file)

        const response = await fetch('/api/process-audio', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        console.log("Archivo procesado:", data.result)
        setProcessedFiles(prev => [...prev, { name: file.name, newName: data.result }])
        setUploadProgress(prev => prev + (100 / filesToUpload.length))
      }

      setUploadStatus("success")
    } catch (error) {
      console.error('Error processing audio:', error)
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const downloadFile = async (fileName: string) => {
    try {
      const cleanFileName = fileName.replace("Audio processed: ", "")
      const response = await fetch(`/api/download?file=${encodeURIComponent(cleanFileName)}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName.split('/').pop() || fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              isDragActive ? "border-primary" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Archivos seleccionados</h3>
              <ul className="mt-2 divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.name} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploading && (
            <Progress value={uploadProgress} className="mt-4" />
          )}

          {uploadStatus === "success" && (
            <Alert variant="default" className="mt-4">
              <AlertDescription>Archivos procesados exitosamente.</AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>Error al procesar los archivos. Por favor, intenta de nuevo.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {processedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Archivos procesados</h3>
            <ul className="divide-y divide-gray-200">
              {processedFiles.map((file) => (
                <li key={file.newName} className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">{file.newName}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => downloadFile(file.newName)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}