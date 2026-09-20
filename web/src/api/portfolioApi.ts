// export interface PortfolioUploadResponse {
// //   upload: {
//     id: string;
//     fileName: string;
//     rowCount: number;
// //   };
// }

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL;

// export async function uploadPortfolioFile(
//   file: File
// ): Promise<PortfolioUploadResponse> {
//   const formData = new FormData();

//   formData.append("file", file);

//   const response = await fetch(
//     `${API_BASE_URL}/api/portfolio/uploads`,
//     {
//       method: "POST",
//       body: formData
//     }
//   );

//   const body = await response
//     .json()
//     .catch(() => null);
//   console.log(body, response)
//   if (!response.ok) {
//     console.log('not ok')
//     throw new Error(
//       body?.message ??
//         "Failed to upload portfolio"
//     );
//   }

//   return body;
// }

export interface PortfolioUpload {
  id: string;
  fileName: string;
  rowCount: number;
}

interface PortfolioUploadResponse {
  uploadId: string;
  fileName: string;
  rowCount: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export async function uploadPortfolioFile(
  file: File
): Promise<PortfolioUpload> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/uploads`,
    {
      method: "POST",
      body: formData
    }
  );

  const body =
    (await response.json().catch(() => null)) as
      | PortfolioUploadResponse
      | { message?: string }
      | null;

  if (!response.ok) {
    throw new Error(
      body &&
        "message" in body &&
        body.message
        ? body.message
        : "Failed to upload portfolio"
    );
  }

  if (
    !body ||
    !("uploadId" in body) ||
    !body.uploadId
  ) {
    throw new Error(
      "Portfolio upload succeeded but the upload ID was not returned."
    );
  }

  return {
    id: body.uploadId,
    fileName: body.fileName,
    rowCount: body.rowCount
  };
}
