import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

export const uploadImage = async (file: Express.Multer.File) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}-${file.originalname}`,
      folder: "/products",
    });

    return {
      success: true,
      url: response.url,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
