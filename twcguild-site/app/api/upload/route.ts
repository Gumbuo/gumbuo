import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  const body = (await req.json()) as HandleUploadBody;
  const jsonResponse = await handleUpload({
    body,
    request: req,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
      maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
    }),
    onUploadCompleted: async () => {},
  });
  return Response.json(jsonResponse);
}
