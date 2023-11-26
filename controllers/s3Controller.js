const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const s3 = new S3Client({
  region: 'us-east-1', // Replace with your actual AWS region
  credentials: fromIni(),
});

const uploadToS3 = async (req, res, next) => {
  try {
    if (req.file) {
      const fileData = req.file;

      const params = {
        Bucket: 'accesspoint-8yjwix8e8phe6pu1iu793a5y4gfzsuse1a-s3alias',
        Key: fileData.originalname,
        Body: fileData.buffer,
      };

      const data = await s3.send(new PutObjectCommand(params));
      req.body.image = data.Location; // Store the S3 file URL in the request body
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading the file to S3" });
  }
};

module.exports = {
  uploadToS3,
};
